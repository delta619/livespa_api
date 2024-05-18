const router = require('express').Router();
const express = require('express');
const appointmentController = require('../controller/appointmentController');

router.post('/', appointmentController.webhook)

module.exports = router