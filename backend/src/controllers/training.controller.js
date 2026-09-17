const pythonService = require('../services/pythonService');

exports.generateDataset = async (req, res, next) => {
  try {
    const {
      numSamples = 500,
      snrMin = 0.0,
      snrMax = 30.0,
      speedMin = 50.0,
      speedMax = 500.0,
      pilotMode = 'SCATTERED',
      pilotSpacing = 4,
      seed = 42,
    } = req.body;

    const payload = {
      num_samples: Math.min(Math.max(Number(numSamples) || 500, 100), 5000),
      snr_min: Number(snrMin) || 0.0,
      snr_max: Number(snrMax) || 30.0,
      speed_min: Number(speedMin) || 50.0,
      speed_max: Number(speedMax) || 500.0,
      pilot_mode: String(pilotMode).toUpperCase(),
      pilot_spacing: Number(pilotSpacing) || 4,
      seed: Number(seed) || 42,
    };

    const result = await pythonService.generateDataset(payload);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.trainModel = async (req, res, next) => {
  try {
    const { epochs = 15, batchSize = 32, learningRate = 0.001 } = req.body;

    const payload = {
      epochs: Math.min(Math.max(Number(epochs) || 15, 1), 50),
      batch_size: Number(batchSize) || 32,
      learning_rate: Number(learningRate) || 0.001,
    };

    const result = await pythonService.trainModel(payload);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.evaluateModel = async (req, res, next) => {
  try {
    const result = await pythonService.evaluateModel();
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
