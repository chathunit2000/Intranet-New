const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { findUserByServiceNo, findUserById } = require('../services/userService');

const JWT_SECRET = process.env.JWT_SECRET || 'intranet-dev-secret';
const JWT_EXPIRES_IN = '8h';

async function login(req, res) {
  const { service_no, password } = req.body || {};
  if (!service_no || !password) {
    return res.status(400).json({ message: 'Service number and password are required' });
  }

  const user = await findUserByServiceNo(service_no);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ message: 'Invalid service number or password' });
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  return res.json({
    token,
    must_change_password: Boolean(user.must_change_password),
  });
}

function logout(req, res) {
  return res.json({ message: 'Logged out' });
}

async function changePassword(req, res) {
  const { current_password, new_password, new_password_confirmation } = req.body || {};
  const user = req.user;

  if (!current_password || !new_password || !new_password_confirmation) {
    return res.status(400).json({ message: 'Current and new passwords are required' });
  }

  if (!bcrypt.compareSync(current_password, user.password_hash)) {
    return res.status(400).json({ message: 'Current password is incorrect' });
  }

  if (new_password.length < 8 || new_password !== new_password_confirmation) {
    return res.status(400).json({ message: 'New password is invalid' });
  }

  const newHash = bcrypt.hashSync(new_password, 10);
  await require('../db/pool').query(
    'UPDATE users SET password_hash = ?, must_change_password = 0 WHERE id = ?',
    [newHash, user.id]
  );

  return res.json({ message: 'Password updated' });
}

function fetchMe(req, res) {
  return res.json({
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
}

module.exports = {
  login,
  logout,
  changePassword,
  fetchMe,
};
