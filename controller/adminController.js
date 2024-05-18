const catchAsync = require('../utils/catchAsync');
const config = require('../config/config');
const customer = require('../models/customerModel');
const Appointment = require('../models/appointmentModel');
const matchController = require('./matchController');
const excel = require('exceljs');
const constants = require('../constants');

exports.checkAdminLogin = catchAsync(async (req, res, next) => {
  const validKey = req.body.token == config.token_backend;

  if (validKey) {
    return res.json({
      status: 200,
    });
  } else {
    throw new Error('Not authorised');
  }
});

exports.getcustomers = catchAsync(async (req, res) => {
  let pack = { ...req.body };

  let customers = [];
  let filter = {};

  let query;

  // city filter
  if (pack['cityFilter']['city']) {
    filter['city'] = pack['cityFilter']['city'];
  }

  // blood group filter
  if (pack['bloodGroupFilter']) {
    filter['blood'] = pack['bloodGroupFilter'];
  }
  if(pack["useWarrior"] == false){
    filter['heard_from']= {$ne:'warriors'}
  }
  if(pack['removecustomer28daysfilter'] != true){
    filter['last_symptom_discharge_date'] = {$lt: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000 )}
  }

  // recent filter
  // if (pack['recentFilter']) {
  //   let least_date = new Date() - 100 * 60 * 60 * 1000;
  //   filter['registeredAt'] = { $gt: least_date };
  // }

  query = customer.find(filter).populate('matchedTo', 'name');

  customers = await query;

  return res.json({
    status: 200,
    results: customers.length,
    data: customers,
  });
});

exports.getAppointments = catchAsync(async (req, res) => {
  let pack = { ...req.body };

  let appointments = [];
  let filter = {};
  let query;

  // city filter
  if (pack['cityFilter']['city']) {
    filter['city'] = pack['cityFilter']['city'];
  }

  // recent filter
  if (pack['recentFilter']) {
    let least_date = new Date() - 48 * 60 * 60 * 1000;
    filter['registeredAt'] = { $gt: least_date };
  }

  // blood Group Filter

  if (pack['bloodGroupFilter']) {
    filter['blood'] = pack['bloodGroupFilter'];
  }

  query = Appointment.find(filter).populate('matchedTo', 'name');

  appointments = await query;

  return res.json({
    status: 200,
    results: appointments.length,
    data: appointments,
  });
});

exports.triggerMatch = async (req, res) => {
  try {
    await matchController.match(
      req.body.data['customer'],
      req.body.data['appointment']
    );

    res.status(200).json({
      status: 200,

    });
  } catch (e) {
    throw e;
  }
};

exports.getCities = async (req, res) => {
  
  let filter = {}
  if(req.body.filter.useWarrior != true){
    filter["heard_from"] = {$ne:'warriors'}
  }

  
  const customer_cities = await customer.distinct('city',filter);

  const appointment_cities = await Appointment.distinct('city');

  let cities = [... new Set(customer_cities.concat(appointment_cities))];


  cities = cities.filter((item, i, ar) => ar.indexOf(item) === i);
  res.json({
    status: 'success',
    data: {
      cities,
    },
  });
};

exports.excelTrigger = async (req, res) => {
  try {
    const customers = await customer.find({});
    const appointments = await Appointment.find({});

    let workbook = new excel.Workbook();

    let customerSheet = workbook.addWorksheet('customers');
    let appointmentSheet = workbook.addWorksheet('Appointments');

    customerSheet.columns = [
      { header: 'Id', key: '_id' },
      { header: 'Name', key: 'name' },
      { header: 'Age', key: 'age' },
      { header: 'Sex', key: 'sex' },
      { header: 'Contact', key: 'contact' },
      { header: 'Email', key: 'email' },
      { header: 'Weight', key: 'weight' },
      { header: 'Blood', key: 'blood' },
      { header: 'City', key: 'city' },
      { header: 'Location', key: 'location' },
      { header: 'Pregnant', key: 'pregnant' },
      { header: 'Tattoo', key: 'tattoo' },
      { header: 'Diabities', key: 'diabities' },
      { header: 'On Medication', key: 'onMedication' },
      { header: 'Anemia', key: 'anemia' },
      { header: 'HIV', key: 'hiv' },
      { header: 'Maleria and TB', key: 'mosquito' },
      { header: 'Cancer', key: 'cancer' },
      { header: 'FLU', key: 'flu' },
      { header: 'Lab Test Confirm', key: 'labTestConfirm' },
      { header: '14 days over', key: 'days14over' },
      { header: 'Last Symptom Date', key: 'last_symptom_discharge_date' },
      { header: 'Follow up test', key: 'hadFollowUp' },
      { header: 'Discharge Report', key: 'dischargeReport' },
      { header: 'Aadhaar', key: 'aadhaar' },
      { header: 'Matched Earlier', key: 'matchedEarlier' },
      { header: 'Matched To', key: 'matchedTo' },
      { header: 'Healthy', key: 'healthy' },
    ];

    appointmentSheet.columns = [
      { header: 'Id', key: '_id' },
      { header: 'Name', key: 'name' },
      { header: 'Age', key: 'age' },
      { header: 'Sex', key: 'sex' },
      { header: 'Contact', key: 'contact' },
      { header: 'Email', key: 'email' },
      { header: 'Blood', key: 'blood' },
      { header: 'City', key: 'city' },
      { header: 'Hospital', key: 'hospital' },
      { header: 'Doctor"s Prescription', key: 'doctorPrescription' },
      { header: 'Lab Diagnosed', key: 'labDiagnosed' },
      { header: 'Registered At', key: 'registeredAt' },
      { header: 'Healthy', key: 'healthy' },
      { header: 'Matched Earlier', key: 'matchedEarlier' },
      { header: 'Matched To', key: 'matchedTo' },
    ];

    customerSheet.addRows(customers);
    appointmentSheet.addRows(appointments);

    await workbook.xlsx.writeFile(
      `${constants.EXCEL_FILE_ADMIN_PATH}/excel.xlsx`
    );

    const options = {
      headers: {
        'x-timestamp': Date.now(),
        'x-sent': true,
      },
    };

    res.sendFile(
      `${constants.EXCEL_FILE_ADMIN_PATH}/excel.xlsx`,
      options,
      (err) => {
        if (err) {
          throw err;
        } else {
          console.log('Xlsx file downloaded');
        }
      }
    );
  } catch (e) {
    throw e;
  }
};

exports.changeStatuscustomer = async (req, res) => {
  try {
    let customer = { ...req.body.customer };
    let new_status = req.body.new_status;

    await customer.findByIdAndUpdate(customer._id, { status: new_status });
  } catch (error) {
    throw error;
  }

  res.json({
    status: 'success',
    data: {
      message: 'Done',
    },
  });
};
exports.changeStatusAppointment = async (req, res) => {
  try {
    let appointment = { ...req.body.appointment };
    let new_status = req.body.new_status;
    await Appointment.findByIdAndUpdate(appointment._id, { status: new_status });
  } catch (error) {
    throw error;
  }

  res.json({
    status: 'success',
    data: {
      message: 'Done',
    },
  });
};
