const authService = require('../services/auth.service');

class AuthController {
  async register(req, res, next) {
    try {
      const user = await authService.register(req.body);
      res.status(201).json({ 
        message: 'Registration successful. Please check your email to verify your account.',
        user: user.toJSON()
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req, res, next) {
    try {
      const { token } = req.query;
      const result = await authService.verifyEmail(token);
      
      if (result.alreadyVerified) {
        return res.json({ message: 'Email already verified' });
      }

      res.json({ 
        message: 'Email verified successfully',
        user: result.user
      });
    } catch (error) {
      next(error);
    }
  }

  async requestPasswordReset(req, res, next) {
    try {
      const { email } = req.body;
      await authService.requestPasswordReset(email);
      res.json({ message: 'Password reset email sent if the email exists in our system' });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { token } = req.query;
      const { newPassword } = req.body;
      await authService.resetPassword(token, newPassword);
      res.json({ message: 'Password reset successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(req, res, next) {
    try {
      res.json({ user: req.user.toJSON() });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();