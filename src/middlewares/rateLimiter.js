const rateLimit = require('express-rate-limit');
const { skip } = require('node:test');
const { RedisStore } = require('rate-limit-redis')
const { createClient } = require('redis');

const client = createClient({
  socket: {
    host: 'localhost',
    port: 6379
  }
});
client.connect()
  .then(() => console.log('connected to Redis'))
  .catch(err => console.log(`rate limit redis connection error: ${err}`));

const customSendCommand = async (...args) => {
  const [command, ...restArgs] = args;
  
  // Handle SCRIPT LOAD command specifically for Redis v5
  if (command === 'SCRIPT' && restArgs[0] === 'LOAD') {
    // For Redis v5, send as ['SCRIPT', 'LOAD', script]
    return await client.sendCommand(['SCRIPT', 'LOAD', restArgs[1]]);
  }
  
  // For other commands, send as is
  return await client.sendCommand(args);
};

const createLimiter = (maxRequests) => rateLimit({
  windowMs: 3 * 60 * 1000, // 3min
  max: maxRequests,
  keyGenerator: (req) => {
    const userId = req.user?.id || 'anonymous';
    const ip = rateLimit.ipKeyGenerator(req.ip);
    return `${ip}:${userId}`;
  },
  message: {
    error: 'Too many requests from this IP',
    message: 'Please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: customSendCommand,
    prefix: 'rl:',
  }),
  skip: async (req) => {
    try {
      await client.ping();
      return false;
    } catch (err) {
      console.error(`Redis unavailable, skipping rate limit: ${err}`);
      return true;
    }
  },
});

const basicLimiter = createLimiter(20);  // For GET requests
const strictLimiter = createLimiter(5);  // For POST/PUT/DELETE requests

module.exports = {
  basicLimiter,
  strictLimiter,
  testLimiter: createLimiter(100), // for testing
};