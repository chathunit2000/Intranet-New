const pool = require('../db/pool');

// Find user by SSN (used during login)
async function findUserBySSN(ssn) {
  const [rows] = await pool.query(
    `
    SELECT
      t.userID,
      t.SSN,
      t.password,
      t.userType,
      t.empName,
      t.division_id,
      e.id AS employee_id,
      e.service_no,
      e.full_name,
      e.division,
      e.salary_scale,
      e.pass_no,
      e.employment_type,
      e.status,
      e.avatar_path
    FROM tbllogin2 AS t
    LEFT JOIN employees AS e ON e.service_no = t.SSN
    WHERE t.SSN = ?
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
      t.userID,
      t.SSN,
      t.password,
      t.userType,
      t.empName,
      t.division_id,
      e.id AS employee_id,
      e.service_no,
      e.full_name,
      e.division,
      e.salary_scale,
      e.pass_no,
      e.employment_type,
      e.status,
      e.avatar_path
    FROM tbllogin2 AS t
    LEFT JOIN employees AS e ON e.service_no = t.SSN
    WHERE t.userID = ?
    `,
    [userId]
  );

  return rows[0] || null;
}

module.exports = {
  findUserBySSN,
  findUserById,
};