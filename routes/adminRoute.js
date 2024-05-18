const express = require('express');
const router = express.Router();
const adminController = require('../controller/adminController');
const authenticator = require('../authenticator/checkAdmin');

router.route('/checkAdminLogin').post(adminController.checkAdminLogin);

router
  .route('/getcustomers')
  .post(authenticator.checkAdmin, adminController.getcustomers);

router
  .route('/getAppointments')
  .post(authenticator.checkAdmin, adminController.getAppointments);

router
  .route('/triggerMatch')
  .post(authenticator.checkAdmin, adminController.triggerMatch);

router
  .route('/getCities')
  .post(authenticator.checkAdmin, adminController.getCities);

router
  .route('/excel')
  .post(authenticator.checkAdmin, adminController.excelTrigger);

router
  .route('/changeStatuscustomer')
  .post(authenticator.checkAdmin, adminController.changeStatuscustomer);

router
  .route('/changeStatusAppointment')
  .post(authenticator.checkAdmin, adminController.changeStatusAppointment);

module.exports = router;
