const router = require('express').Router();
const statsController = require('../controller/StatsController');

router.route('/stats').get(statsController.get_status)
router.route('/newsletter').post(statsController.add_newsletter)
router.route('/rediskeys').get(statsController.get_redis_keys)

module.exports = router