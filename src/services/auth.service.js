const { 
  generateToken, 
  generateVerificationToken,
  hashPassword, 
  comparePasswords 
} = require('../utils/auth');
const userRepository = require('../repositories/user.repository');
const mailService = require('./mail.service');

class AuthService {
  async register(userData) {
    // Check if email or username already exists
    const existingEmail = await userRepository.findByEmail(userData.email);
    if (existingEmail) {
      throw new Error('Email already in use');
    }

    const existingUsername = await userRepository.findByUsername(userData.username);
    if (existingUsername) {
      throw new Error('Username already taken');
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.password);

    // Create user
    const user = await userRepository.create({
      ...userData,
      password: hashedPassword,
      role: 'user',
      emailVerified: false
    });

    // Send verification email
    await mailService.sendVerificationEmail(user);

    return user;
  }

  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await comparePasswords(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const token = generateToken({
      id: user.id,
      role: user.role,
      emailVerified: user.emailVerified
    });

    return {
      user: user.toJSON(),
      token
    };
  }

  async verifyEmail(token) {
    try {
      const { userId } = verifyToken(token);
      const user = await userRepository.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      if (user.emailVerified) {
        return { alreadyVerified: true };
      }

      const updatedUser = await userRepository.update(user.id, { email_verified: true });
      return { user: updatedUser.toJSON() };
    } catch (error) {
      throw new Error('Invalid or expired verification token');
    }
  }

  async requestPasswordReset(email) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    await mailService.sendPasswordResetEmail(user);
    return { message: 'Password reset email sent' };
  }

  async resetPassword(token, newPassword) {
    try {
      const { userId } = verifyToken(token);
      const user = await userRepository.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      const hashedPassword = await hashPassword(newPassword);
      await userRepository.update(user.id, { password: hashedPassword });

      return { message: 'Password updated successfully' };
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}

module.exports = new AuthService();