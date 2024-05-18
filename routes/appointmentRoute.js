const router = require('express').Router();
const appointmentController = require('../controller/appointmentController')

router
.route('/create_checkout_session')
.post(appointmentController.createCheckoutSession)

router.post('/webhook', appointmentController.webhook)

module.exports = router;