const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRY } = require('../../config');

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

function generateVerificationToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
}

function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (!decoded.userId) {
      throw new Error('Token missing required fields');
    }
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error.message);
    throw new Error('Invalid or expired token');
  }
}

async function hashPassword(password) {
  const bcrypt = require('bcryptjs');
  const salt = await bcrypt.genSalt();
  return await bcrypt.hash(password, salt);
}

async function comparePasswords(plainPassword, hashedPassword) {
  const bcrypt = require('bcryptjs');
  return await bcrypt.compare(plainPassword, hashedPassword);
}

module.exports = {
  generateToken,
  generateVerificationToken,
  verifyToken,
  hashPassword,
  comparePasswords
};