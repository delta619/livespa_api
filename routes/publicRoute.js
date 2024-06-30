const router = require('express').Router();
const statsController = require('../controller/StatsController');

router.route('/stats').get(statsController.get_status)
router.route('/newsletter').post(statsController.add_newsletter)

module.exports = router