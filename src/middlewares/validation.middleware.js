const { ValidationError } = require('../utils/errors');
const { z } = require('zod');

module.exports = 
  (schema) =>
  (req, res, next) => {
    try {
      const result = schema.parse({
        params: req.params,
        body: req.body,
        query: req.query,
      });
      req.validated = result;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return next(new ValidationError(error.errors));
      }
      next(error);
    }
  };