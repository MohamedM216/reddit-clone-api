const { setupSocket } = require('./utils/socket');
const app = require('./app');
const { PORT } = require('../config');

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const io = setupSocket(server);
app.set('io', io);