const Appointment = require('../models/appointmentModel');
const Customer = require('../models/customerModel');
const catchAsync = require('../utils/catchAsync');
const email = require('../utils/email');
const sms = require('../utils/smsService');
const stripe = require('stripe')(process.env.STRIPE_TOKEN);
const { template_customer_message } = require('../utils/email_templates/template_customer');
const { template_team_message } = require('../utils/email_templates/template_team');
const {Redis_DB, connectRedis} = require('../utils/redis');

exports.sendAppointmentMails = async (appointment) => {

  // send the appointment confirmation mail to the customer.
  await email.sendEmailPlain({
    email: appointment.email,
    subject: 'LiveSPAbyLoreto | Payment Confirmation',
    message: template_customer_message(appointment)
  });

    connectRedis();
    let isPaid = await Redis_DB.get('prepayment') == '1' ? true : false;
  // send the customer details to the LiveSPA team.
  await email.sendEmailPlain({
    email: 'livespabyloreto82@gmail.com',
    subject: `Appointment Booked! | ${appointment.name}`,
    message: template_team_message(appointment, isPaid),
    replyTo: appointment.email
  });
  console.log("Emails sent successfully");
}

exports.createAppointmentIntent = async (appointment, payment_option, appointment_id) => {
  try {
    const appointmentDoc = await Appointment.create({ ...appointment, payment_option, appointment_id });
    console.log("appointment_id", appointment_id);
    console.log("Appointment intent created successfully", appointmentDoc);
    return appointmentDoc;

  } catch (error) {
    console.error("Error occurred while saving appointment and customer:", error);
    throw error; // Optionally rethrow the error to handle it at a higher level
  }
};

exports.updateAppointmentDB = async (appointment, customer_details) => {
  /**
   * Update the appointment with the customer details.
   * 
   * @param {Object} appointment - The appointment object.
   * @param {Object} customer_details - The customer details object.
   * 
   */
  appointment.paid = true;
  appointment.customer_details = customer_details;

  let doc = await appointment.save();
  console.log("Appointment updated successfully", doc);
  return doc
}

exports.getAppointmentIntent = async (appointment_id) => {
  /**
  *  Get the appointment object by the appointment_id.
  * 
  * @param {String} appointment_id - The appointment_id.
  * 
  * 
  */
  return await Appointment.findOne({
    appointment_id
  });

}

exports.createCheckoutSession = catchAsync(async (req, res, next) => {
  const YOUR_DOMAIN = process.env.NODE_ENV == "production" ? process.env.FRONTEND_HOST_LIVE : process.env.FRONTEND_HOST_TEST;

  // record the Apoointment trigger

  console.log("Request Body", req.body);
  const appointment_body = { ...req.body };

  let prepayment = await Redis_DB.get('prepayment');

  if (prepayment != 1) {

    await exports.createAppointmentIntent(appointment_body, "# NO PAYMENT", "# NO ID");
    await exports.sendAppointmentMails(appointment_body);
    
    return res.json({
      status: 200,
      url: "/success",
    })

  }

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price: process.env.STRIPE_PRICE_CODE,
        quantity: 1
      },
    ],
    mode: 'payment',
    success_url: `${YOUR_DOMAIN}/success`,
    cancel_url: `${YOUR_DOMAIN}/failure`,
  });

  await exports.createAppointmentIntent(appointment_body, "STRIPE", session.id);

  return res.json({
    status: 200,
    url: session.url,
  })


});

exports.webhook = (req, res) => {

  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.NODE_ENV == "production" ? process.env.STRIPE_WEBHOOK_SECRET_STAGE : process.env.STRIPE_WEBHOOK_SECRET_LOCAL
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.log(`Webhook Error: ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.created':
      handlePaymentIntentCreated(event.data.object);
      break;
    case 'checkout.session.completed':
      handleCheckoutSessionCompleted(event.data.object);
      break;
    case 'charge.updated':
      handleChargeUpdated(event.data.object);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  async function handlePaymentIntentCreated(paymentIntent) {
    // console.log('PaymentIntent was created:', paymentIntent);
  }

  async function handleCheckoutSessionCompleted(session) {
    // console.log('-> Checkout Session completed:', session);
    const sessionId = session.id;
    try {
      const appointment = await findAppointmentBySessionId(sessionId);
      if (session.payment_status === 'paid' && !appointment.paid) {
        // Mark the appointment as paid
        // send the mail
        exports.sendAppointmentMails(appointment);
        let doc = await exports.updateAppointmentDB(appointment, session.customer_details)

        console.log('Appointment finalised:', doc);
      } else {
        console.log('Appointment already marked as paid, so no email will be sent', appointment);
      }
    } catch (error) {
      console.error('Error handling checkout session completed:', error);
    }
  }

  function handleChargeUpdated(charge) {
    // console.log('-> Charge Updated:', charge);
  }

  async function findAppointmentBySessionId(sessionId) {
    // Implement your logic to find appointment by session ID
    return await Appointment.findOne({ appointment_id: sessionId });
  }

  // Return a 200 response to acknowledge receipt of the event
  return res.send();

};
