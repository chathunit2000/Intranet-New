const pool = require('../db/pool');

async function getDashboardData(user) {
  const today = new Date().toISOString().slice(0, 10);

  const [[attendanceToday], [updates], [pendingActions], [quickLinksRows], [groups], [documents]] =
    await Promise.all([
      pool.query(
        'SELECT id, work_date, check_in, check_out, status FROM attendances WHERE employee_id = ? AND work_date = ? LIMIT 1',
        [user.employee_id, today]
      ),
      pool.query(
        'SELECT id, title, icon, color, is_new, is_active FROM updates WHERE is_active = 1 ORDER BY sort_order ASC'
      ),
      pool.query(
        'SELECT id, title, link_url FROM pending_actions WHERE employee_id = ? AND is_resolved = 0',
        [user.employee_id]
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

  const quick_links = quickLinksRows.map((link) => ({
    ...link,
    url: link.title === 'ERP Learning Hub' && link.url === '#' ? '/erp-learning-hub' : link.url,
  }));

  return {
    profile: {
      full_name: user.full_name,
      division: user.division,
      avatar_url: user.avatar_path,
      service_no: user.service_no,
      salary_scale: user.salary_scale,
      pass_no: user.pass_no,
      employment_type: user.employment_type,
      status: user.status,
    },
    attendance_today: attendanceToday[0] || null,
    updates,
    pending_actions: pendingActions,
    quick_links,
    document_panels: documentPanels,
  };
}

async function getErpLearningHubData(user) {
  const [quickLinksRows] = await pool.query(
    'SELECT id, title, icon, url FROM quick_links WHERE is_active = 1 ORDER BY sort_order ASC'
  );

  return {
    title: 'ERP Learning Hub',
    subtitle: 'Your centralized ERP learning and support center',
    support_extension: '5566',
    alert:
      'Above mentioned employee information are not accurate and must be verified by the HR Division.',
    quote: 'Continuous learning is the key to growth across every business process.',
    sections: [
      {
        id: 1,
        title: 'ERP Setup Guide',
        items: [
          { title: 'System Access Procedures', url: '#', description: 'How to access ERP systems and login guide' },
          { title: 'Password Management', url: '#', description: 'Reset and manage your ERP account credentials' },
        ],
      },
      {
        id: 2,
        title: 'ERP Resources',
        items: [
          { title: 'Training Videos', url: '#', description: 'Watch short tutorials for common ERP tasks' },
          { title: 'ERP Policy Documents', url: '#', description: 'Download ERP guidance and process documents' },
        ],
      },
      {
        id: 3,
        title: 'Related Links',
        items: quickLinksRows.slice(0, 5).map((link) => ({
          title: link.title,
          url: link.url || '#',
        })),
      },
    ],
    footer_note:
      'Above mentioned employee information is not accurate and must be verified by the HR Division.',
  };
}

async function getAttendanceHistory(employeeId, page = 1) {
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

  return {
    data,
    current_page: page,
    per_page: pageSize,
    total,
    last_page: Math.max(1, Math.ceil(total / pageSize)),
  };
}

module.exports = {
  getDashboardData,
  getAttendanceHistory,
  getErpLearningHubData,
};
