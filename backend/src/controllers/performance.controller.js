const pythonService = require('../services/pythonService');

exports.runSnrSweep = async (req, res, next) => {
  try {
    const {
      snrList = [0, 5, 10, 15, 20, 25, 30],
      speed = 300,
      carrierFrequency = 2.6e9,
      modulation = 'QPSK',
      pilotMode = 'SCATTERED',
      pilotSpacing = 4,
      runsPerSnr = 2,
    } = req.body;

    const payload = {
      snr_list: Array.isArray(snrList) ? snrList.map(Number) : [0, 5, 10, 15, 20, 25, 30],
      speed: Number(speed) || 300,
      carrier_frequency: Number(carrierFrequency) || 2.6e9,
      modulation: String(modulation).toUpperCase(),
      pilot_mode: String(pilotMode).toUpperCase(),
      pilot_spacing: Number(pilotSpacing) || 4,
      runs_per_snr: Math.min(Math.max(Number(runsPerSnr) || 2, 1), 5),
    };

    const result = await pythonService.runSnrSweep(payload);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.runSpeedSweep = async (req, res, next) => {
  try {
    const {
      speeds = [50, 100, 200, 300, 500],
      snr = 15,
      carrierFrequency = 2.6e9,
      modulation = 'QPSK',
      pilotMode = 'SCATTERED',
      pilotSpacing = 4,
    } = req.body;

    const payload = {
      speeds: Array.isArray(speeds) ? speeds.map(Number) : [50, 100, 200, 300, 500],
      snr: Number(snr) || 15,
      carrier_frequency: Number(carrierFrequency) || 2.6e9,
      modulation: String(modulation).toUpperCase(),
      pilot_mode: String(pilotMode).toUpperCase(),
      pilot_spacing: Number(pilotSpacing) || 4,
    };

    const result = await pythonService.runSpeedSweep(payload);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
