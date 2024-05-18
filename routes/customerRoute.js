const router = require('express').Router();
const customerController = require('../controller/customerController')





router
.route('/')
.post(customerController.addcustomer)

module.exports = router;