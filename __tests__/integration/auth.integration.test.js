const request = require('supertest');
const app = require('../../src/app');
const userRepository = require('../../src/repositories/user.repository');
const mailService = require('../../src/services/mail.service');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../../src/utils/auth');

jest.mock('../../src/repositories/user.repository');
jest.mock('../../src/services/mail.service');

describe('Auth Integration Tests', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    const newUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123!'
    };

    it('should register a new user successfully (201)', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.findByUsername.mockResolvedValue(null);
      
      userRepository.create.mockImplementation(async (data) => {
        return {
          ...data,
          id: 'user-id-123',
          toJSON: () => ({ 
            id: 'user-id-123', 
            username: data.username, 
            email: data.email,
            role: 'user',
            emailVerified: false
          })
        };
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send(newUser);

      expect(res.statusCode).toBe(201);
      expect(res.body.user).toHaveProperty('id', 'user-id-123');
      expect(res.body.message).toMatch(/successful/i);
      
      expect(userRepository.create).toHaveBeenCalled();
      expect(mailService.sendVerificationEmail).toHaveBeenCalled();
    });

    it('should return 500 if email already exists', async () => {
      userRepository.findByEmail.mockResolvedValue({ id: 'existing-id', email: newUser.email });

      const res = await request(app)
        .post('/api/auth/register')
        .send(newUser);

      expect(res.statusCode).toBe(500); 
    });
  });

  describe('POST /api/auth/login', () => {
    const loginData = {
      email: 'test@example.com',
      password: 'Password123!'
    };

    it('should login successfully and return a token (200)', async () => {
      const hashedPassword = await bcrypt.hash(loginData.password, 10);

      const mockUser = {
        id: 'user-id-123',
        email: loginData.email,
        password: hashedPassword,
        role: 'user',
        emailVerified: true,
        toJSON: function() {
          return { id: this.id, email: this.email, role: this.role };
        }
      };

      userRepository.findByEmail.mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('id', 'user-id-123');
    });

    it('should return 401 for invalid password', async () => {
      const realHash = await bcrypt.hash('CorrectPassword', 10);
      
      userRepository.findByEmail.mockResolvedValue({
        id: 'user-123',
        email: loginData.email,
        password: realHash // Different from 'Password123!'
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 if user does not exist', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    
    it('should return user profile if token is valid', async () => {
      const userId = 'user-id-123';
      const token = generateToken({ userId, role: 'user' });

      userRepository.findById.mockResolvedValue({
        id: userId,
        username: 'testuser',
        email: 'test@example.com',
        role: 'user',
        toJSON: function() { return this; }
      });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.user).toHaveProperty('id', userId);
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
    });

    it('should return 401 if token is missing', async () => {
      const res = await request(app)
        .get('/api/auth/me'); // No header

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toMatch(/token required/i);
    });

    it('should return 401 if token is valid but user no longer exists', async () => {
      const token = generateToken({ userId: 'deleted-user', role: 'user' });
      
      // Middleware looks for user, but returns null
      userRepository.findById.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toMatch(/invalid token/i);
    });
  });
});