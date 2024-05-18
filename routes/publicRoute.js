const router = require('express').Router();
const statsController = require('../controller/StatsController');

router.route('/stats').get(statsController.get_status)

module.exports = router