const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { health } = require('../controllers/healthController');

const router = express.Router();

router.get('/health', asyncHandler(health));

module.exports = router;
