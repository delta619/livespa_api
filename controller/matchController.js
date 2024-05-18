const sms = require('../utils/smsService');
const emailController = require('./emailController');
const customer = require('../models/customerModel');
const Appointment = require('../models/appointmentModel');
const { PintDataClass } = require('../utils/PintDataClass');

exports.match = async (customer, appointment) => {
  // let otp = 1000 + Math.floor(Math.random() * 1000);

  try {
    await customer.findById(customer._id, (err, doc) => {
      if (doc) {
        doc.matchedEarlier = true;
        let list = doc.matchedTo;
        list.push(appointment._id);
        doc.matchedTo = list;

        console.log(doc.matchedTo);
        doc.save((err) => {
          if (err) console.log('Update was not saved', err);
        });
      }
      if (err) {
        throw err;
      }
    });

    await Appointment.findById(appointment._id, (err, doc) => {
      if (doc) {
        doc.matchedEarlier = true;
        let list = doc.matchedTo;
        list.push(customer._id);
        doc.matchedTo = list;

        console.log(doc.matchedTo);
        doc.save((err) => {
          if (err) console.log('Update was not saved', err);
        });
      }
      if (err) {
        throw err;
      }
    });

    //SOME text messages BELOW
    try {
      
      if (customer.contact) {
      await sms.sendMatchResponsecustomer({
          // to: customer.contact,
  
          to: customer.contact,
          var1: customer.name,
          var2: '',
        });
        console.log("sent sms to customer");
      }
  
      if (appointment.contact) {
        await sms.sendMatchResponseAppointment({
          to: appointment.contact,
          var1: appointment.name,
          var2: customer.sex == 'M' ? 'his' : 'her',
          var3: `${customer.name}, ${customer.contact}, ${customer.email}`,
          var4: '',
        });
        console.log("sent sms to appointment");
      }
    } catch (error) {
      
    }

    //    if customer doesnt have an email

    if (!customer.email) {
      customer.email = 'Not available';
      await emailController.sendMatchMailAppointment(customer, appointment);
    } else if (!appointment.email) {
      //    Appointment doesnt have a mail
      await emailController.sendMatchMailcustomer(customer, appointment);
    } else {
      //    if all have emails
      await emailController.sendMatchMailcustomer(customer, appointment);
      await emailController.sendMatchMailAppointment(customer, appointment);
    }
    PintDataClass.incr_match_count()
  } catch (error) {
    await emailController.sendErrorMail(error);
  }
};
