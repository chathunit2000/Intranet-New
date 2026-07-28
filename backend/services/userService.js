const pool = require('../db/pool');

// Find user by SSN (used during login)
async function findUserBySSN(ssn) {
  const [rows] = await pool.query(
    `
    SELECT
      userID,
      SSN,
      password,
      userType,
      empName,
      division_id
    FROM tbllogin2
    WHERE SSN = ?
    `,
    [ssn]
  );

  return rows[0] || null;
}

// Find user by ID (used after login/auth middleware)
async function findUserById(userId) {
  const [rows] = await pool.query(
    `
    SELECT
      userID,
      SSN,
      password,
      userType,
      empName,
      division_id
    FROM tbllogin2
    WHERE userID = ?
    `,
    [userId]
  );

  return rows[0] || null;
}

module.exports = {
  findUserBySSN,
  findUserById,
};