const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../db/pool');

const { findUserBySSN } = require('../services/userService');

const JWT_SECRET = process.env.JWT_SECRET || 'intranet-dev-secret';
const JWT_EXPIRES_IN = '8h';

async function login(req, res) {
  const { ssn, password } = req.body || {};

  if (!ssn || !password) {
    return res.status(400).json({
      message: 'SSN and password are required'
    });
  }

  const user = await findUserBySSN(ssn);

  if (!user) {
    return res.status(401).json({
      message: 'Invalid SSN or password'
    });
  }

  let validPassword = false;
  if (user.password) {
    validPassword = bcrypt.compareSync(password, user.password);
  } else if (password === String(user.SSN)) {
    validPassword = true;
  }

  if (!validPassword) {
    return res.status(401).json({
      message: 'Invalid SSN or password'
    });
  }

  if (!user.password && password === String(user.SSN)) {
    const passwordHash = bcrypt.hashSync(password, 10);
    await pool.query(
      `
      UPDATE tbllogin2
      SET password = ?
      WHERE userID = ?
      `,
      [passwordHash, user.userID]
    );
  }

  const token = jwt.sign(
    {
      userId: user.userID,
      userType: user.userType
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return res.json({
    token,
    user: {
      userID: user.userID,
      SSN: user.SSN,
      empName: user.empName,
      userType: user.userType,
      division_id: user.division_id
    }
  });
}

function logout(req, res) {
  return res.json({
    message: 'Logged out'
  });
}

async function changePassword(req, res) {
  const {
    current_password,
    new_password,
    new_password_confirmation
  } = req.body || {};

  const user = req.user;

  if (!current_password || !new_password || !new_password_confirmation) {
    return res.status(400).json({
      message: 'Current and new passwords are required'
    });
  }

  const validPassword = bcrypt.compareSync(
    current_password,
    user.password
  );

  if (!validPassword) {
    return res.status(400).json({
      message: 'Current password is incorrect'
    });
  }

  if (
    new_password.length < 8 ||
    new_password !== new_password_confirmation
  ) {
    return res.status(400).json({
      message: 'New password is invalid'
    });
  }

  const newHash = bcrypt.hashSync(new_password, 10);

  await pool.query(
    `
    UPDATE tbllogin2
    SET password = ?
    WHERE userID = ?
    `,
    [newHash, user.userID]
  );

  return res.json({
    message: 'Password updated'
  });
}

function fetchMe(req, res) {
  return res.json({
    user: {
      userID: req.user.userID,
      SSN: req.user.SSN,
      empName: req.user.empName,
      userType: req.user.userType,
      division_id: req.user.division_id
    }
  });
}

module.exports = {
  login,
  logout,
  changePassword,
  fetchMe,
};