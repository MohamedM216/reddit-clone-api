const app = require('./app');
const { PORT } = require('../config');
const { setupSocket } = require('./utils/socket');
const { setupNotificationHandlers } = require('./handlers/notification.handlers');

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// setup Socket.IO
const io = setupSocket(server);
app.set('io', io); 

console.log('Socket.io initialized successfully');

setupNotificationHandlers();

module.exports = { server, io };