const pythonService = require('../services/pythonService');

exports.runSimulation = async (req, res, next) => {
  try {
    const {
      speed = 300,
      snr = 15,
      carrierFrequency = 2.6e9,
      modulation = 'QPSK',
      pilotMode = 'SCATTERED',
      pilotSpacing = 4,
      estimator = 'compare',
      equalizer = 'ZF',
      numSymbols = 14,
      seed = 42,
    } = req.body;

    // Validate inputs
    const parsedSpeed = Number(speed);
    const parsedSnr = Number(snr);
    if (isNaN(parsedSpeed) || parsedSpeed < 0 || parsedSpeed > 1000) {
      return res.status(400).json({ success: false, error: 'Invalid train speed value.' });
    }
    if (isNaN(parsedSnr) || parsedSnr < -10 || parsedSnr > 50) {
      return res.status(400).json({ success: false, error: 'Invalid SNR value.' });
    }

    const payload = {
      speed: parsedSpeed,
      snr: parsedSnr,
      carrier_frequency: Number(carrierFrequency) || 2.6e9,
      modulation: String(modulation).toUpperCase(),
      pilot_mode: String(pilotMode).toUpperCase(),
      pilot_spacing: Number(pilotSpacing) || 4,
      estimator: String(estimator).toLowerCase(),
      equalizer: String(equalizer).toUpperCase(),
      num_symbols: Number(numSymbols) || 14,
      seed: seed !== undefined && seed !== null ? Number(seed) : 42,
    };

    const result = await pythonService.runSimulation(payload);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
