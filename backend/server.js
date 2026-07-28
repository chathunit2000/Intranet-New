const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const healthRoutes = require('./routes/healthRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 8000;

const ALLOWED_ORIGINS = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim());

app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
app.use(express.json());

app.use('/api', healthRoutes);
app.use('/api', authRoutes);
app.use('/api', dashboardRoutes);

app.use('/api', (req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.use(errorHandler);

function createServer() {
  return app.listen(0);
}

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Node backend listening on port ${PORT}`);
    console.log(`Allowed frontend origins: ${ALLOWED_ORIGINS.join(', ')}`);
  });
}

module.exports = { app, createServer };
