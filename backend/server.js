require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('./db/pool');

const app = express();
const PORT = process.env.PORT || 8000;
const JWT_SECRET = process.env.JWT_SECRET || 'intranet-dev-secret';

const ALLOWED_ORIGINS = (process.env.FRONTEND_URL || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((origin) => origin.trim());

app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
app.use(express.json());

// Wraps an async route handler so thrown/rejected errors reach the error handler
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

async function findUserByServiceNo(serviceNo) {
  const [rows] = await pool.query(
    `SELECT u.id, u.employee_id, u.service_no, u.password_hash, u.must_change_password,
            e.full_name, e.division, e.salary_scale, e.pass_no, e.employment_type, e.status, e.avatar_path
     FROM users u
     JOIN employees e ON e.id = u.employee_id
     WHERE u.service_no = ?`,
    [serviceNo]
  );
  return rows[0] || null;
}

async function findUserById(userId) {
  const [rows] = await pool.query(
    `SELECT u.id, u.employee_id, u.service_no, u.password_hash, u.must_change_password,
            e.full_name, e.division, e.salary_scale, e.pass_no, e.employment_type, e.status, e.avatar_path
     FROM users u
     JOIN employees e ON e.id = u.employee_id
     WHERE u.id = ?`,
    [userId]
  );
  return rows[0] || null;
}

async function authenticate(req, res, next) {
  const header = req.get('Authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';

  if (!token) {
    return res.status(401).json({ message: 'Unauthenticated' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await findUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Unauthenticated' });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Unauthenticated' });
  }
}

app.get('/api/health', asyncHandler(async (req, res) => {
  await pool.query('SELECT 1');
  res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
}));

app.post('/api/login', asyncHandler(async (req, res) => {
  const { service_no, password } = req.body || {};
  if (!service_no || !password) {
    return res.status(400).json({ message: 'Service number and password are required' });
  }

  const user = await findUserByServiceNo(service_no);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ message: 'Invalid service number or password' });
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '8h' });

  return res.json({
    token,
    must_change_password: Boolean(user.must_change_password),
  });
}));

app.post('/api/logout', authenticate, (req, res) => {
  res.json({ message: 'Logged out' });
});

app.post('/api/change-password', authenticate, asyncHandler(async (req, res) => {
  const { current_password, new_password, new_password_confirmation } = req.body || {};
  const user = req.user;

  if (!bcrypt.compareSync(current_password, user.password_hash)) {
    return res.status(400).json({ message: 'Current password is incorrect' });
  }

  if (!new_password || new_password.length < 8 || new_password !== new_password_confirmation) {
    return res.status(400).json({ message: 'New password is invalid' });
  }

  const newHash = bcrypt.hashSync(new_password, 10);
  await pool.query(
    'UPDATE users SET password_hash = ?, must_change_password = 0 WHERE id = ?',
    [newHash, user.id]
  );

  return res.json({ message: 'Password updated' });
}));

app.get('/api/me', authenticate, (req, res) => {
  res.json({
    user: { id: req.user.id, service_no: req.user.service_no },
    employee: {
      id: req.user.employee_id,
      service_no: req.user.service_no,
      full_name: req.user.full_name,
      division: req.user.division,
      salary_scale: req.user.salary_scale,
      pass_no: req.user.pass_no,
      employment_type: req.user.employment_type,
      status: req.user.status,
      avatar_path: req.user.avatar_path,
    },
  });
});

app.get('/api/dashboard', authenticate, asyncHandler(async (req, res) => {
  const employeeId = req.user.employee_id;
  const today = new Date().toISOString().slice(0, 10);

  const [[attendanceToday], [updates], [pendingActions], [quickLinks], [groups], [documents]] = await Promise.all([
    pool.query(
      'SELECT id, work_date, check_in, check_out, status FROM attendances WHERE employee_id = ? AND work_date = ? LIMIT 1',
      [employeeId, today]
    ),
    pool.query(
      'SELECT id, title, icon, color, is_new, is_active FROM updates WHERE is_active = 1 ORDER BY sort_order ASC'
    ),
    pool.query(
      'SELECT id, title, link_url FROM pending_actions WHERE employee_id = ? AND is_resolved = 0',
      [employeeId]
    ),
    pool.query(
      'SELECT id, title, icon, url FROM quick_links WHERE is_active = 1 ORDER BY sort_order ASC'
    ),
    pool.query(
      'SELECT id, title, sort_order FROM document_groups ORDER BY sort_order ASC'
    ),
    pool.query(
      'SELECT id, group_id, title, sort_order FROM documents ORDER BY sort_order ASC'
    ),
  ]);

  const documentPanels = groups.map((group) => ({
    id: group.id,
    title: group.title,
    documents: documents
      .filter((doc) => doc.group_id === group.id)
      .map(({ id, title, sort_order }) => ({ id, title, sort_order })),
  }));

  res.json({
    profile: {
      full_name: req.user.full_name,
      division: req.user.division,
      avatar_url: req.user.avatar_path,
      service_no: req.user.service_no,
      salary_scale: req.user.salary_scale,
      pass_no: req.user.pass_no,
      employment_type: req.user.employment_type,
      status: req.user.status,
    },
    attendance_today: attendanceToday[0] || null,
    updates,
    pending_actions: pendingActions,
    quick_links: quickLinks,
    document_panels: documentPanels,
  });
}));

app.get('/api/attendance/history', authenticate, asyncHandler(async (req, res) => {
  const employeeId = req.user.employee_id;
  const page = Number(req.query.page || 1);
  const pageSize = 30;
  const offset = (page - 1) * pageSize;

  const [[{ total }]] = await pool.query(
    'SELECT COUNT(*) AS total FROM attendances WHERE employee_id = ?',
    [employeeId]
  );

  const [data] = await pool.query(
    `SELECT id, work_date, check_in, check_out, status
     FROM attendances
     WHERE employee_id = ?
     ORDER BY work_date DESC
     LIMIT ? OFFSET ?`,
    [employeeId, pageSize, offset]
  );

  res.json({
    data,
    current_page: page,
    per_page: pageSize,
    total,
    last_page: Math.max(1, Math.ceil(total / pageSize)),
  });
}));

// 404 for any unmatched /api route
app.use('/api', (req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// Centralized error handler (catches synchronous throws and async rejections)
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

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
