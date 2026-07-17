const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const asyncHandler = require('../middleware/asyncHandler');
const {
  fetchDashboard,
  attendanceHistory,
  erpLearningHub,
} = require('../controllers/dashboardController');

const router = express.Router();

router.get('/dashboard', authenticate, asyncHandler(fetchDashboard));
router.get('/attendance/history', authenticate, asyncHandler(attendanceHistory));
router.get('/erp-learning-hub', authenticate, asyncHandler(erpLearningHub));

module.exports = router;
