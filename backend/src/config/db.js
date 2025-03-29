const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// Create a new pool instance with connection details from environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for connecting to Neon DB
  }
});

// Test the connection
pool.connect()
  .then(() => console.log('Connected to Neon PostgreSQL database'))
  .catch(err => console.error('Database connection error:', err));

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
}; 