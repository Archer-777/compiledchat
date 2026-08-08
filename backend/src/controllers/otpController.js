require('dotenv').config();

const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY || 'pjgNOCe9TSqQ5zwbIBsZFdkXaYGPVcuMyf2KR438niWvm1rDU0xjI24yBTlCuPVzeiOGwK1h9rQFApb7';

const PREDEFINED_TEST_OTP = '123456';

/**
 * Send Quick Phone OTP (Dev Mock Mode Active — Real Fast2SMS API call skipped)
 */
const sendPhoneOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required.' });
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ success: false, message: 'Invalid 10-digit phone number.' });
    }

    const otpCode = PREDEFINED_TEST_OTP;
    console.log(`[MOCK OTP SERVER] Predefined OTP ${otpCode} active for ${cleanPhone} (Fast2SMS API skipped).`);

    return res.status(200).json({
      success: true,
      message: `Predefined OTP ${otpCode} active for ${cleanPhone}. Real SMS API call skipped.`,
      otp: otpCode
    });
  } catch (err) {
    console.error('OTP controller error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to send SMS OTP.',
      error: err.message
    });
  }
};

module.exports = {
  sendPhoneOTP
};
