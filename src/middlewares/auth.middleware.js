const { verifyToken } = require('../utils/auth');
const userRepository = require('../repositories/user.repository');

// layered security model
const authMiddleware = {
  authenticate: async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication token required' });
      }

      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      
      const user = await userRepository.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Invalid or expired token' });
    }
  },

  authorize: (roles = []) => {
    if (typeof roles === 'string') {
      roles = [roles];
    }

    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      next();
    };
  },

  checkVerified: (req, res, next) => {
    if (!req.user.emailVerified) {
      return res.status(403).json({ message: 'Email not verified' });
    }
    next();
  }
};

module.exports = authMiddleware;