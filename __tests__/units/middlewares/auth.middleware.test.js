const authMiddleware = require('../../../src/middlewares/auth.middleware');
const authUtil = require('../../../src/utils/auth');
const userRepository = require('../../../src/repositories/user.repository');

jest.mock('../../../src/utils/auth', () => ({
  verifyToken: jest.fn()
}));

jest.mock('../../../src/repositories/user.repository', () => ({
  findById: jest.fn()
}));

const mockReq = () => ({
  headers: {},
  user: null,
});

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

describe('authMiddleware', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  })

  describe('authenticate', () => {

    it('should return 401 if Authorization header is missing', async () => {
      const req = mockReq();
      const res = mockRes();
      
      await authMiddleware.authenticate(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Authentication token required' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if Authorization header does not start with Bearer', async () => {
      const req = mockReq();
      req.headers.authorization = 'Token 12345';
      const res = mockRes();
      
      await authMiddleware.authenticate(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Authentication token required' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if verifyToken throws an error (invalid/expired token)', async () => {
      const req = mockReq();
      req.headers.authorization = 'Bearer invalidtoken';
      const res = mockRes();
      
      authUtil.verifyToken.mockImplementation(() => {
        throw new Error('Token verification failed');
      });

      await authMiddleware.authenticate(req, res, mockNext);

      expect(authUtil.verifyToken).toHaveBeenCalledWith('invalidtoken');
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if user is not found in the repository', async () => {
      const req = mockReq();
      req.headers.authorization = 'Bearer validbutunknownuser';
      const res = mockRes();
      const decodedPayload = { userId: 'unknown-id' };
      
      authUtil.verifyToken.mockReturnValue(decodedPayload);
      userRepository.findById.mockResolvedValue(null);

      await authMiddleware.authenticate(req, res, mockNext);

      expect(authUtil.verifyToken).toHaveBeenCalledWith('validbutunknownuser');
      expect(userRepository.findById).toHaveBeenCalledWith('unknown-id');
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should attach the user object to the request and call next() on success', async () => {
      const req = mockReq();
      req.headers.authorization = 'Bearer goodtoken';
      const res = mockRes();
      const decodedPayload = { userId: 'user-123' };
      const mockUser = { id: 'user-123', role: 'user', emailVerified: true };
      
      authUtil.verifyToken.mockReturnValue(decodedPayload);
      userRepository.findById.mockResolvedValue(mockUser);

      await authMiddleware.authenticate(req, res, mockNext);

      expect(authUtil.verifyToken).toHaveBeenCalledWith('goodtoken');
      expect(userRepository.findById).toHaveBeenCalledWith('user-123');
      expect(req.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('authorize', () => {

    it('should call next() if no roles are specified (public/authenticated route)', async () => {
      const middleware = authMiddleware.authorize();
      const req = mockReq();
      req.user = { id: 'user-123', role: 'any-role' };
      const res = mockRes();
      
      await middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 401 if req.user is missing (authenticate not run)', async () => {
      const middleware = authMiddleware.authorize(['admin']);
      const req = mockReq(); // req.user is null
      const res = mockRes();
      
      await middleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next() if user role matches a single required role (string input)', async () => {
      const middleware = authMiddleware.authorize('admin');
      const req = mockReq();
      req.user = { id: 'user-123', role: 'admin' };
      const res = mockRes();
      
      await middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should call next() if user role is in the array of required roles', async () => {
      const middleware = authMiddleware.authorize(['admin', 'manager']);
      const req = mockReq();
      req.user = { id: 'user-123', role: 'manager' };
      const res = mockRes();
      
      await middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 403 if user role does not match the required role', async () => {
      const middleware = authMiddleware.authorize(['admin']);
      const req = mockReq();
      req.user = { id: 'user-123', role: 'user' };
      const res = mockRes();
      
      await middleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
  
  describe('checkVerified', () => {

    it('should call next() if req.user.emailVerified is true', async () => {
      const req = mockReq();
      req.user = { id: 'user-123', emailVerified: true };
      const res = mockRes();
      
      await authMiddleware.checkVerified(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 403 if req.user.emailVerified is false', async () => {
      const req = mockReq();
      req.user = { id: 'user-123', emailVerified: false };
      const res = mockRes();
      
      await authMiddleware.checkVerified(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email not verified' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
