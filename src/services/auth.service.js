const { 
  generateToken, 
  generateVerificationToken,
  verifyToken,
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
      email_verified: false
    });

    // Send verification email
    await mailService.sendVerificationEmail(user);

    return user;
  }

  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    console.log('User found:', user ? user.id : 'none');
    
    if (!user) {
      console.log('No user found with email:', email);
      throw new Error('Invalid credentials');
    }

    const isMatch = await comparePasswords(password, user.password);
    
    if (!isMatch) {
      console.log('Password comparison failed');
      console.log('Input password:', password);
      console.log('Stored hash:', user.password);
      throw new Error('Invalid credentials');
    }

    const token = generateToken({
      userId: user.id,
      role: user.role,
      email_verified: user.emailVerified
    });

    return {
      user: user.toJSON(),
      token
    };
  }

  async verifyEmail(token) {
    if (!token) {
        throw new Error('No token provided');
    }

    try {
        const decoded = verifyToken(token);
        console.log('Decoded token payload:', decoded);

        const user = await userRepository.findById(decoded.userId);
        if (!user) {
        throw new Error('User not found');
        }

        if (user.emailVerified) {
        return { alreadyVerified: true, user: user.toJSON() };
        }

        const updatedUser = await userRepository.update(user.id, { 
        email_verified: true 
        });
        
        return { 
        user: updatedUser.toJSON(),
        message: 'Email verified successfully' 
        };
        
    } catch (error) {
        console.error('Email verification error:', {
        error: error.message,
        token: token,
        time: new Date().toISOString()
        });
        throw error;
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