const rateLimit = require('express-rate-limit');

const basicLimiter = rateLimit({ // for GET:
  windowMs: 15 * 60 * 1000, // 15min
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false
});

const strictLimiter = rateLimit({   // for other endpoints
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 comment operations per windowMs
  message: 'Too many comment operations from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  basicLimiter,
  strictLimiter
};