const constants = require('../constants');
const {PintDataClass} = require('../utils/PintDataClass')

const customer = require('../models/customerModel');
const Hit = require('../models/hitModel');

const catchAsync = require('../utils/catchAsync');
const email = require('../utils/email');

const config = require('../config/config');

const sms = require('../utils/smsService');
const AppError = require('../utils/AppError');
const Appointment = require('../models/appointmentModel');

exports.addcustomer = catchAsync(async (req, res, next) => {
  let customer = JSON.parse(JSON.stringify(req.body));

  customer.healthy =
    customer.hiv != 1 &&
    customer.mosquito != 1 &&
    customer.days14over == 1 &&
    customer.pregnant == 0 &&
    customer.age >= 18 &&
    customer.age <= 65;

  let doc = await customer.create(customer);
  if(doc){
    PintDataClass.incr_customer_count()
  }

  // if (customer.contact) {
  //   await sms.sendWelcomeMessage(customer);
  // }

  if (customer.email) {
    email.sendEmailPlain({
      email: customer.email,
      subject: 'Welcome to PintNetwork',
      message: `
        <br>Dear ${customer.name},<br>
        <br>Thank you for registering with pintnetwork.com.<br>
        <br>We are trying our best to find you a appointment in need of plasma within the next 24-48 hours.<br>
        <br>Once we have made a successful match, you will receive a text message and an email.<br>
        <br>We thank you for your time.<br>
        <br>Regards,
        <br>Team PINT`,
    }).then(res=>{
      console.log("customer Mail ",customer.name," sent.");
    }).catch(err=>{
      console.log("customer Mail ",customer.name," failed. ",err);
    });
  }

  return res.json({
    status: 200,
    message: 'success',
  });
});

exports.getAllcustomers = catchAsync(async (req, res, next) => {
  if (req.body.token == config.token_backend) {
    const customers = await customer.find({});

    return res.status(200).json({
      status: 'Success',
      results: customers.length,

      data: customers,
    });
  } else {
    next(new AppError('hi', 500));
  }
});

exports.getcustomerStats = catchAsync(async (req, res, next) => {
  const customers = await customer.find({});

  res.json({
    status: 200,
    length: customers.length,
  });
});
