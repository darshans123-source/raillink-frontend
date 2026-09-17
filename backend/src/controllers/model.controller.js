const pythonService = require('../services/pythonService');

exports.getModelStatus = async (req, res, next) => {
  try {
    const result = await pythonService.getModelStatus();
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
