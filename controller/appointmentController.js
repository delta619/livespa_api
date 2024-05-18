const Appointment = require('../models/appointmentModel');
const Customer = require('../models/customerModel');
const catchAsync = require('../utils/catchAsync');
const email = require('../utils/email');
const sms = require('../utils/smsService');
const stripe = require('stripe')(process.env.STRIPE_TOKEN);
const { template_customer_message } = require('../utils/email_templates/template_customer');
const { template_team_message } = require('../utils/email_templates/template_team');

async function appointmentConfirmed(appointment) {

  // send the appointment confirmation mail to the customer.
  await email.sendEmailPlain({
    email: appointment.email,
    subject: 'LiveSPAbyLoreto | Payment Confirmation',
    message: template_customer_message(appointment)
  });

  // send the customer details to the LiveSPA team.
  await email.sendEmailPlain({
    email: 'livespabyloreto82@gmail.com',
    subject: 'Appointment Booked!',
    message: template_team_message(appointment),
    replyTo: appointment.email
  });

}


exports.createCheckoutSession = catchAsync(async (req, res, next) => {
  const YOUR_DOMAIN = process.env.NODE_ENV == "production" ? process.env.FRONTEND_HOST_LIVE : process.env.FRONTEND_HOST_TEST;

  // record the Apoointment trigger

  console.log("Request Body", req.body);
  const appointment_body = { ...req.body };

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

  appointment_body.appointment_id = session.id;
  appointment_body.pmc_details = session.payment_method_configuration_details.id;

  const doc = await Appointment.create(appointment_body);
  const customer = await Customer.create(appointment_body);
  // console.log("Saved Appointment", doc);
  // console.log("Saved Customer", customer);


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
        appointment.paid = true;
        appointment.customer_details = session.customer_details;
        appointmentConfirmed(appointment);
        await appointment.save();

        console.log('Appointment marked as paid:', appointment);
      } else {
        console.log('Appointment already marked as paid:', appointment);
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
