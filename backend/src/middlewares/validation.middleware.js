const { validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const detail = errors.array().map(err => ({ field: err.param, message: err.msg }));

    return res.status(400).json({
      error: 'Validation Error',
      message: detail[0].message,
      details: detail
    });
  }
  next();
};

module.exports = {
  handleValidationErrors
};
