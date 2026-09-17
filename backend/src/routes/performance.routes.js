const express = require('express');
const router = express.Router();
const performanceController = require('../controllers/performance.controller');

router.post('/snr', performanceController.runSnrSweep);
router.post('/speed', performanceController.runSpeedSweep);

module.exports = router;
