const http = require('http');
const app = require('./app');
const { PORT } = require('../config');
const { setupSocket } = require('./utils/socket');
const NotificationHandlers = require('./handlers/notification.handlers');

const httpServer = http.createServer(app);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// setup Socket.IO
const io = setupSocket(httpServer);
console.log('Socket.io initialized successfully');

new NotificationHandlers(io);