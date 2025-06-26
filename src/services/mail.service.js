const nodemailer = require('nodemailer');
const { SMTP_CONFIG } = require('../../config');
const { generateVerificationToken } = require('../utils/auth');

const transporter = nodemailer.createTransport(SMTP_CONFIG);

class MailService {
  async sendVerificationEmail(user) {
    const token = generateVerificationToken(user.id);
    const verificationUrl = `http://localhost:3000/api/auth/verify-email?token=${token}`;

    const mailOptions = {
      from: `"Reddit Clone" <${SMTP_CONFIG.auth.user}>`,
      to: user.email,
      subject: 'Verify Your Email Address',
      html: `
        <h1>Welcome to Reddit Clone!</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>If you didn't create an account, please ignore this email.</p>
      `
    };

    await transporter.sendMail(mailOptions);
  }

  async sendPasswordResetEmail(user) {
    const token = generateVerificationToken(user.id);
    const resetUrl = `http://localhost:3000/api/auth/reset-password?token=${token}`;

    const mailOptions = {
      from: `"Reddit Clone" <${SMTP_CONFIG.auth.user}>`,
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <h1>Password Reset</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>If you didn't request a password reset, please ignore this email.</p>
      `
    };

    await transporter.sendMail(mailOptions);
  }
}

module.exports = new MailService();