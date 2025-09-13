// middleware function to be plugged into routes
const rateLimit = require('express-rate-limit');

const basicLimiter = rateLimit({ // for GET:
  windowMs: 15 * 60 * 1000, // 15min
  max: 100, // limit each IP to 100 requests per windowMs   (error code: 429)
  standardHeaders: true,
  legacyHeaders: false
});

const strictLimiter = rateLimit({   // for other endpoints
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 comment operations per windowMs   (error code: 429)
  message: 'Too many operations from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  basicLimiter,
  strictLimiter
};