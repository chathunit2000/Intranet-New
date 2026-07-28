require('dotenv').config();
const mysql = require('mysql2/promise');


const DEFAULT_SERVICE_NO = process.env.INTRANET_SERVICE_NO || '6609';
const DEFAULT_PASSWORD = process.env.INTRANET_PASSWORD || '6609';

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'intranet_app',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'intranet',
  });

  try {
    console.log('Seeding demo data...');

    // --- Employee + login user -------------------------------------------------
    const [existingEmployee] = await connection.query(
      'SELECT id FROM employees WHERE service_no = ?',
      [DEFAULT_SERVICE_NO]
    );

    let employeeId;
    if (existingEmployee.length > 0) {
      employeeId = existingEmployee[0].id;
    } else {
      const [result] = await connection.query(
        `INSERT INTO employees (service_no, full_name, division, salary_scale, pass_no, employment_type, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [DEFAULT_SERVICE_NO, 'A.B.C.Perera', 'Executive', 'S10', 'BPA 008899', 'Permanent', 'Active']
      );
      employeeId = result.insertId;
    }

    // -------------------- Login User (tbllogin2) --------------------
const [existingLogin] = await connection.query(
  'SELECT userID FROM tbllogin2 WHERE SSN = ?',
  [DEFAULT_SERVICE_NO]
);

if (existingLogin.length === 0) {
  await connection.query(
    `
    INSERT INTO tbllogin2
    (
      SSN,
      password,
      userType,
      empName,
      division_id
    )
    VALUES (?, ?, ?, ?, ?)
    `,
    [
      DEFAULT_SERVICE_NO,
      '',                 // Password column not used
      1,                  // Change to the correct user type if needed
      'A.B.C.Perera',
      1                   // Change to the correct division ID if needed
    ]
  );
}

    // --- Today's attendance -----------------------------------------------------
    const today = new Date().toISOString().slice(0, 10);
    await connection.query(
      `INSERT INTO attendances (employee_id, work_date, check_in, check_out, status)
       VALUES (?, ?, '08:27:00', '16:35:00', 'Present')
       ON DUPLICATE KEY UPDATE check_in = VALUES(check_in), check_out = VALUES(check_out)`,
      [employeeId, today]
    );

    // --- Updates -----------------------------------------------------------------
    const [[{ count: updatesCount }]] = await connection.query('SELECT COUNT(*) AS count FROM updates');
    if (updatesCount === 0) {
      await connection.query(
        `INSERT INTO updates (title, icon, color, sort_order, is_new, is_active) VALUES ?`,
        [[
          ['Leave Management System', 'calendar', 'orange', 1, 0, 1],
          ['e-Directory', 'phone', 'orange', 2, 0, 1],
          ['ERP Learning Hub', 'gear', 'orange', 3, 0, 1],
        ]]
      );
    }

    // --- Pending actions -----------------------------------------------------------
    const [[{ count: pendingCount }]] = await connection.query(
      'SELECT COUNT(*) AS count FROM pending_actions WHERE employee_id = ?',
      [employeeId]
    );
    if (pendingCount === 0) {
      await connection.query(
        `INSERT INTO pending_actions (employee_id, title, link_url, is_resolved) VALUES ?`,
        [[
          [employeeId, 'Pending 01', '#', 0],
          [employeeId, 'Pending 02', '#', 0],
        ]]
      );
    }

    // --- Quick links -----------------------------------------------------------------
    const [[{ count: linksCount }]] = await connection.query('SELECT COUNT(*) AS count FROM quick_links');
    if (linksCount === 0) {
      const links = [
        ['AASL Web', 'globe', 'https://www.airport.lk/'],
        ['Office e-Mail', 'mail', '#'],
        ['Change Domain User Account Password', 'lock', '#'],
        ['IT Help Desk', 'monitor', '#'],
        ['FTP', 'folder', '#'],
        ['Civil Aviation Training Division', 'briefcase', '#'],
        ['IT Services', 'headset', '#'],
        ['AASL IT Policies', 'shield', '/it-policies'],
        ['e-Directory', 'phone', '#'],
        ['Procument Management', 'case', '#'],
        ['Complaint Management System', 'chat', '#'],
        ['Sik Route Login', 'route', '#'],
        ['User Credential Management System', 'user', '#'],
        ['Leave Management System', 'calendar', '#'],
        ['Vehicle Management System', 'car', '#'],
        ['Tenderboard Progress', 'megaphone', '#'],
        ['ERP Learning Hub', 'gear', '#'],
        ['Knowledge Hub', 'book', '#'],
      ].map(([title, icon, url], index) => [title, icon, url, index + 1, 1]);

      await connection.query(
        `INSERT INTO quick_links (title, icon, url, sort_order, is_active) VALUES ?`,
        [links]
      );
    }

    await connection.query(
      "UPDATE quick_links SET url = '/erp-learning-hub' WHERE title = 'ERP Learning Hub'"
    );

    // --- Document groups + documents --------------------------------------------------
    const [[{ count: groupCount }]] = await connection.query('SELECT COUNT(*) AS count FROM document_groups');
    if (groupCount === 0) {
      const groups = [
        { title: 'Company Medical Scheme Documents', docs: ['Benefit Schedule 2025/2026', 'Tests Price List of Medical Check up Packages 2025/2026'] },
        { title: 'Annual Action Plan / Procurement / Tender Board', docs: ['Annual Action Plan 2025', 'Master Procurement Plan', 'Tender Board'] },
        { title: 'Documentation', docs: ['News Letter - RUNWAY', 'BIA Destination Green'] },
      ];

      for (let i = 0; i < groups.length; i += 1) {
        const [groupResult] = await connection.query(
          'INSERT INTO document_groups (title, sort_order) VALUES (?, ?)',
          [groups[i].title, i + 1]
        );
        const docRows = groups[i].docs.map((title, index) => [groupResult.insertId, title, index + 1]);
        await connection.query('INSERT INTO documents (group_id, title, sort_order) VALUES ?', [docRows]);
      }
    }

    console.log('Seed complete.');
    console.log(`Demo login -> service_no: ${DEFAULT_SERVICE_NO}, password: ${DEFAULT_PASSWORD}`);
  } finally {
    await connection.end();
  }
}

seed().catch((err) => {
  console.error('Seeding failed:', err.message);
  process.exit(1);
});
