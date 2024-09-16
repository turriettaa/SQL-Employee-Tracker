const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function query(text, params) {
    const client = await pool.connect();
    try {
      const result = await client.query(text, params);
      return result.rows;
    } catch (err) {
      console.error('Database query error:', err);
      throw err; // Re-throw the error for handling in the calling function
    } finally {
      client.release();
    }
  }

  function end() {
    return pool.end();
  }
  
module.exports = {
  query,
};