const socketio = require('socket.io');

function setupSocket(server) {
  const io = socketio(server, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('joinPostRoom', (postId) => {
      socket.join(`post_${postId}`);
      console.log(`User joined post room: post_${postId}`);
    });

    socket.on('joinCommentRoom', (commentId) => {
      socket.join(`comment_${commentId}`);
      console.log(`User joined comment room: comment_${commentId}`);
    });

    socket.on('joinNotificationRoom', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`User joined notification room: user_${userId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  return io;
}

module.exports = { setupSocket };