const pool = require('../db/pool');

async function health(req, res) {
  await pool.query('SELECT 1');
  res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
}

module.exports = { health };
