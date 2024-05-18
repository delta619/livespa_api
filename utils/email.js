const nodemailer = require('nodemailer');
const path = require('path');


const is_prod_config = process.env.NODE_ENV == "production"

const transporter = nodemailer.createTransport({
  host: is_prod_config?process.env.EMAIL_HOST_LIVE:process.env.EMAIL_HOST_TEST,
  port: is_prod_config?process.env.EMAIL_PORT_LIVE:process.env.EMAIL_PORT_TEST,
  secure: is_prod_config?true:false,
  auth: {
    user: is_prod_config?process.env.EMAIL_USERNAME_LIVE:process.env.EMAIL_USERNAME_TEST,
    pass: is_prod_config?process.env.EMAIL_PASSWORD_LIVE:process.env.EMAIL_PASSWORD_TEST,
  },
});


exports.sendEmailPlain =  (options) => {

  const mailOptions = {
    from: 'Live SPA <no-reply@livespabyloreto.com>',
    to: options.email,
    subject: options.subject,
    html: options.message,
    replyTo: options.replyTo || null,
    
    envelope: {
      from: 'Live SPA <no-reply@livespabyloreto.com>',
      to: options.email
    }
  }
  return transporter.sendMail(mailOptions);
}


exports.sendEmailWithAttachments = async options => {

  const mailOptions = {
    from: 'Live SPA <no-reply@livespabyloreto.com>',
    to: options.email,
    subject: options.subject,
    html: options.message,
    attachments: options.attachments,
    envelope: {
      from: 'Live SPA <no-reply@livespabyloreto.com>',
      to: options.email
    }
  }
  try{
    await  transporter.sendMail(mailOptions);
  }catch(e){
    throw e
  }

}

