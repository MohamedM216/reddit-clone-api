const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const pool = require('./utils/db')

// Route imports
const authRoutes = require('./routes/auth.routes');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// db connection check
app.get('/dbconn', async (req, res) => {
  try {
    await pool.query('SELECT NOW()');
    res.status(200).json({ status: 'Database connected successfully' });
  } catch(error) {
    'Database connection error:', error
    res.status(500).json({ message: 'Database connection error: ' + error });
  }
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

module.exports = app;