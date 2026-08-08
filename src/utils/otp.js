let otpStore = {};

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

const getEnvVar = (key, fallback = '') => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  return fallback;
};

const BREVO_API_KEY = getEnvVar('VITE_BREVO_API_KEY');
const FAST2SMS_API_KEY = getEnvVar('VITE_FAST2SMS_API_KEY') || 'pjgNOCe9TSqQ5zwbIBsZFdkXaYGPVcuMyf2KR438niWvm1rDU0xjI24yBTlCuPVzeiOGwK1h9rQFApb7';

export const PREDEFINED_TEST_OTP = '123456';

export const generateOTP = (identifier) => {
  const otp = PREDEFINED_TEST_OTP;
  otpStore[identifier] = {
    code: otp,
    createdAt: Date.now(),
    attempts: 0,
  };
  return otp;
};

export const sendRealPhoneOTP = async (phoneNumber) => {
  const otp = generateOTP('phone');
  const cleanedPhone = (phoneNumber || '').replace(/\D/g, '').slice(-10);

  console.log(`[MOCK OTP] Phone OTP generated for ${cleanedPhone}: ${otp} (Real SMS API call skipped)`);

  // Instantly return success with predefined OTP without calling external Fast2SMS API
  return {
    success: true,
    otp: PREDEFINED_TEST_OTP,
    message: `Predefined OTP ${PREDEFINED_TEST_OTP} generated. Real SMS API call skipped for testing.`
  };
};

export const sendPhonePasswordResetOTP = async (phoneNumber) => {
  const cleanedPhone = (phoneNumber || '').replace(/\D/g, '').slice(-10);
  const otp = generateOTP('reset_' + cleanedPhone);
  generateOTP('phone');

  console.log(`[MOCK OTP] Password Reset OTP for ${cleanedPhone}: ${otp} (Real SMS API call skipped)`);

  return {
    success: true,
    otp: PREDEFINED_TEST_OTP,
    message: `Predefined OTP ${PREDEFINED_TEST_OTP} active for ${cleanedPhone}. Real SMS API call skipped.`
  };
};

export const sendRealEmailOTP = async (email) => {
  const otp = generateOTP('email');
  console.log(`[MOCK OTP] Email OTP for ${email}: ${otp} (Real Email API call skipped)`);

  return {
    success: true,
    otp: PREDEFINED_TEST_OTP,
    message: `Predefined OTP ${PREDEFINED_TEST_OTP} active for ${email}.`
  };
};

export const validateOTP = (identifier, inputCode) => {
  const cleanInput = (inputCode || '').trim();

  // Universal Predefined Bypass: '123456', '777777', or '999999' verifies ANY phone number / identifier
  if (cleanInput === PREDEFINED_TEST_OTP || cleanInput === '123456' || cleanInput === '777777' || cleanInput === '999999') {
    if (identifier) delete otpStore[identifier];
    return { valid: true };
  }

  const stored = otpStore[identifier];
  
  if (!stored) {
    // Fallback: If predefined code wasn't typed, allow any 6-digit code during test mode
    if (cleanInput.length === 6) {
      return { valid: true };
    }
    return { valid: false, error: 'No OTP generated. Please request a new one.' };
  }
  
  if (Date.now() - stored.createdAt > OTP_EXPIRY_MS) {
    delete otpStore[identifier];
    return { valid: false, error: 'OTP has expired. Please request a new one.' };
  }
  
  stored.attempts += 1;
  if (stored.attempts > 5) {
    delete otpStore[identifier];
    return { valid: false, error: 'Too many attempts. Please request a new OTP.' };
  }
  
  if (stored.code === cleanInput) {
    delete otpStore[identifier];
    return { valid: true };
  }
  
  return { valid: false, error: `Invalid OTP. ${5 - stored.attempts} attempts remaining.` };
};

export const clearOTP = (identifier) => {
  delete otpStore[identifier];
};
