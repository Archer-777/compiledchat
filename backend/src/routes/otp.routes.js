const express = require('express');
const router = express.Router();
const { sendPhoneOTP } = require('../controllers/otpController');

router.post('/send-phone-otp', sendPhoneOTP);

module.exports = router;
