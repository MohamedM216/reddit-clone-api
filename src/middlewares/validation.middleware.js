const { z, ZodError } = require('zod');

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
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          error: error.message
        });
      }
      next(error);
    }
  };