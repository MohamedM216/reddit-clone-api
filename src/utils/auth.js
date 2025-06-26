const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRY } = require('../config');

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

function generateVerificationToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

async function hashPassword(password) {
  const bcrypt = require('bcryptjs');
  const salt = await bcrypt.genSalt(10);
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