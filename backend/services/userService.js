const pool = require('../db/pool');

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

module.exports = {
  findUserByServiceNo,
  findUserById,
};
