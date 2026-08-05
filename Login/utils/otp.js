import { Platform } from 'react-native';

let otpStore = {};

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const BREVO_API_KEY = process.env.EXPO_PUBLIC_BREVO_API_KEY || '';
const FAST2SMS_API_KEY = process.env.EXPO_PUBLIC_FAST2SMS_API_KEY || '';

export const generateOTP = (identifier) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[identifier] = {
    code: otp,
    createdAt: Date.now(),
    attempts: 0,
  };
  return otp;
};

export const sendRealPhoneOTP = async (phoneNumber) => {
  const otp = generateOTP('phone');
  const cleanedPhone = phoneNumber.replace(/\D/g, '').slice(-10);

  const isWeb = Platform.OS === 'web';
  const url = isWeb
    ? 'http://localhost:3001/api/fast2sms'
    : 'https://www.fast2sms.com/dev/bulkV2';

  const headers = isWeb
    ? { 'x-api-key': FAST2SMS_API_KEY, 'Content-Type': 'application/json' }
    : { 'authorization': FAST2SMS_API_KEY, 'Content-Type': 'application/json' };

  try {
    // 1. Try OTP route
    let response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        route: 'otp',
        variables_values: otp,
        numbers: cleanedPhone,
      }),
    });

    let data = await response.json();

    // 2. If status_code is 996 (needs website verification), fallback to Quick SMS route 'q'
    if (data && data.status_code === 996) {
      response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          route: 'q',
          message: `Your Next Archer verification OTP code is ${otp}`,
          language: 'english',
          flash: 0,
          numbers: cleanedPhone,
        }),
      });
      data = await response.json();
    }

    if (data && (data.return === true || data.status_code === 200)) {
      return { success: true, otp, data };
    } else {
      return { success: false, otp, error: (data && data.message) ? data.message : 'Fast2SMS delivery notice' };
    }
  } catch (err) {
    console.error('Fast2SMS fetch error:', err);
    return { success: false, otp, error: err.message };
  }
};

export const sendRealEmailOTP = async (email) => {
  const otp = generateOTP('email');

  const isWeb = Platform.OS === 'web';
  const url = isWeb
    ? 'http://localhost:3001/api/brevo'
    : 'https://api.brevo.com/v3/smtp/email';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'Next Archer', email: 'raj@nextarcher.com' },
        to: [{ email }],
        subject: '🏹 Next Archer — Your OTP Verification Code',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; background-color: #000000; color: #ffffff; padding: 30px; border-radius: 12px; max-width: 480px; margin: 0 auto; border: 1px solid #333333;">
            <h1 style="text-align: center; font-size: 24px; letter-spacing: 2px; color: #ffffff; margin-bottom: 8px;">NEXT ARCHER</h1>
            <p style="text-align: center; color: #888888; font-style: italic; font-size: 13px; margin-top: 0;">Begin Within</p>
            <hr style="border: none; border-top: 1px solid #222222; margin: 20px 0;" />
            <p style="font-size: 14px; color: #cccccc; text-align: center;">Your verification code is:</p>
            <div style="background-color: #121212; border: 1px dashed #ffffff; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #ffffff;">${otp}</span>
            </div>
            <p style="font-size: 12px; color: #666666; text-align: center;">This code will expire in 5 minutes. Do not share it with anyone.</p>
          </div>
        `,
      }),
    });

    const data = await response.json();
    if (data && data.messageId) {
      return { success: true, otp, data };
    } else {
      return { success: false, otp, error: (data && data.message) || 'Brevo email delivery error' };
    }
  } catch (err) {
    return { success: false, otp, error: err.message };
  }
};

export const validateOTP = (identifier, inputCode) => {
  const stored = otpStore[identifier];
  
  if (!stored) {
    return { valid: false, error: 'No OTP generated. Please request a new one.' };
  }
  
  // Check expiry
  if (Date.now() - stored.createdAt > OTP_EXPIRY_MS) {
    delete otpStore[identifier];
    return { valid: false, error: 'OTP has expired. Please request a new one.' };
  }
  
  // Check max attempts
  stored.attempts += 1;
  if (stored.attempts > 5) {
    delete otpStore[identifier];
    return { valid: false, error: 'Too many attempts. Please request a new OTP.' };
  }
  
  // Validate
  if (stored.code === inputCode) {
    delete otpStore[identifier];
    return { valid: true };
  }
  
  return { valid: false, error: `Invalid OTP. ${5 - stored.attempts} attempts remaining.` };
};

export const clearOTP = (identifier) => {
  delete otpStore[identifier];
};
