const { Pool } = require('pg');
const { DB_URL } = require('../../config');

const pool = new Pool({
  connectionString: DB_URL,
  max: 20, // maximum number of clients in the pool
  idleTimeoutMillis: 300000, // how long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 300000, // how long to try connecting before timing out
});

// Handle connection errors
pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool, // export pool for transactions
};