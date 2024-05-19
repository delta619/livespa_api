const router = require('express').Router();
const paypalController = require('../controller/paypalController')


router
.route('/create-paypal-order')
.post(paypalController.create_paypal_order)

router
.route('/capture_paypal_transaction')
.post(paypalController.capture_paypal_transaction)


module.exports = router;