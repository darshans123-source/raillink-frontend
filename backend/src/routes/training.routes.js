const express = require('express');
const router = express.Router();
const trainingController = require('../controllers/training.controller');

router.post('/dataset', trainingController.generateDataset);
router.post('/train', trainingController.trainModel);
router.post('/evaluate', trainingController.evaluateModel);

module.exports = router;
