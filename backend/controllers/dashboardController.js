const {
  getDashboardData,
  getAttendanceHistory,
  getErpLearningHubData,
} = require('../services/dashboardService');

async function fetchDashboard(req, res) {
  const dashboard = await getDashboardData(req.user);
  return res.json(dashboard);
}

async function attendanceHistory(req, res) {
  const page = Number(req.query.page || 1);
  const history = await getAttendanceHistory(req.user.employee_id, page);
  return res.json(history);
}

async function erpLearningHub(req, res) {
  console.log('ERP route hit for user', req.user?.service_no);
  try {
    const hub = await getErpLearningHubData(req.user);
    console.log('ERP route success');
    return res.json(hub);
  } catch (err) {
    console.error('ERP route error', err);
    throw err;
  }
}

module.exports = {
  fetchDashboard,
  attendanceHistory,
  erpLearningHub,
};
