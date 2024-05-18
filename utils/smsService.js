const axios = require('axios');
const { sendErrorMail } = require('../controller/emailController');

exports.sendWelcomeMessage = async (person) => {
  try {
    await axios({
      method: 'post',
      url: `http://2factor.in/API/V1/${process.env.SMS_API_KEY}/ADDON_SERVICES/SEND/TSMS`,
      data: {
        From: 'PINTNW',
        To: process.env.DEFAULT_SMS_CONTACT || person.contact,
        TemplateName: 'greeting_v2',
        VAR1: person.name,
      },
    });
  } catch (error) {
    await sendErrorMail(error);
    throw error;
  }
};

// exports.unhealthy_customer_greeting = async (customer) => {
//   await axios({
//     method: 'post',
//     url: `http://2factor.in/API/V1/${process.env.SMS_API_KEY}/ADDON_SERVICES/SEND/TSMS`,
//     data: {
//       From: 'PINTNW',
//       To: process.env.DEFAULT_SMS_CONTACT || customer.contact,
//       TemplateName: 'unhealthy_customer_greeting',
//       VAR1: customer.name,
//     },
//   }).then(
//     (res) => {
//       return true;
//     },
//     (err) => {
//       throw Error(err);
//     }
//   );
// };

// exports.unhealthy_appointment_greeting = async (appointment) => {
//   await axios({
//     method: 'post',
//     url: `http://2factor.in/API/V1/${process.env.SMS_API_KEY}/ADDON_SERVICES/SEND/TSMS`,
//     data: {
//       From: 'PINTNW',
//       To: process.env.DEFAULT_SMS_CONTACT || appointment.contact,
//       TemplateName: 'unhealthy_appointment_greeting',
//       VAR1: appointment.name,
//     },
//   }).then(
//     (res) => {
//       return true;
//     },
//     (err) => {
//       throw Error(err);
//     }
//   );
// };

exports.sendMatchResponsecustomer = async (data) => {
  try {
    axios({
      method: 'post',
      url: `http://2factor.in/API/V1/${process.env.SMS_API_KEY}/ADDON_SERVICES/SEND/TSMS`,
      data: {
        From: 'PINTNW',
        To: process.env.DEFAULT_SMS_CONTACT || data.to,
        TemplateName: 'v3_customer_matched',
        VAR1: data.var1, // Name of the customer
        VAR2: data.var2, // Blank
      },
    });
  } catch (err) {
    await sendErrorMail(error);

    throw err;
  }
};

exports.sendMatchResponseAppointment = async (data) => {
  axios({
    method: 'post',
    url: `http://2factor.in/API/V1/${process.env.SMS_API_KEY}/ADDON_SERVICES/SEND/TSMS`,
    data: {
      From: 'PINTNW',
      To: process.env.DEFAULT_SMS_CONTACT || data.to,
      TemplateName: 'v3_appointment_matched',
      VAR1: data.var1, //Name of the Appointment
      VAR2: data.var2, //his/her
      VAR3: data.var3, // Details
      VAR4: data.var4, // blank
    }
  }).then(res=>{
    console.log(res.data);
  }).catch(err=>{
    console.log(err);
  });


};
