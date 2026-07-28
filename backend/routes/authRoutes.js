const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { authenticate } = require('../middleware/authMiddleware');
const {
  login,
  logout,
  changePassword,
  fetchMe,
} = require('../controllers/authController');

const router = express.Router();

router.post('/login', asyncHandler(login));
router.post('/logout', authenticate, logout);
router.post('/change-password', authenticate, asyncHandler(changePassword));
router.get('/me', authenticate, fetchMe);

module.exports = router;
