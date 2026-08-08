const express = require('express');
const router = express.Router();
const { register, login, getMe, logout, saveDigitalTwinProfile, getDigitalTwinProfile } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, getMe);
router.post('/logout', logout);
router.post('/digital-twin-profile', saveDigitalTwinProfile);
router.get('/digital-twin-profile', getDigitalTwinProfile);

module.exports = router;
