const { query } = require('express-validator');

// Validation for timeframe query parameter
const timeframeValidation = [
  query('timeframe')
    .optional()
    .isIn(['all', 'week', 'month', 'year'])
    .withMessage('Timeframe must be one of: all, week, month, year')
];

module.exports = {
  timeframeValidation
}
