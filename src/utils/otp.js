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

  const apiKey = FAST2SMS_API_KEY || 'pjgNOCe9TSqQ5zwbIBsZFdkXaYGPVcuMyf2KR438niWvm1rDU0xjI24yBTlCuPVzeiOGwK1h9rQFApb7';
  const url = '/api/fast2sms';
  const headers = {
    'authorization': apiKey,
    'x-api-key': apiKey,
    'Content-Type': 'application/json',
  };

  try {
    // 1. First attempt: Quick SMS route ('q') or OTP route ('otp') direct call
    let response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        route: 'otp',
        variables_values: otp,
        numbers: cleanedPhone,
      }),
    });

    let data = null;
    try {
      data = await response.json();
    } catch (e) {
      console.warn('Fast2SMS response parse notice:', e);
    }

    // 2. Fallback to Quick SMS route ('q') if DLT or OTP route is non-responsive
    if (!data || data.return === false || data.status_code === 996) {
      const qParams = new URLSearchParams({
        authorization: apiKey,
        route: 'q',
        message: `Your Next Archer verification OTP code is ${otp}`,
        language: 'english',
        flash: '0',
        numbers: cleanedPhone,
      }).toString();

      response = await fetch(`${url}?${qParams}`, {
        method: 'GET',
        headers: {
          'authorization': apiKey,
          'x-api-key': apiKey,
        },
      });
      data = await response.json();
    }

    if (data && (data.return === true || data.status_code === 200)) {
      return { success: true, otp, data };
    } else {
      const errMsg = data && data.message ? (Array.isArray(data.message) ? data.message.join(', ') : String(data.message)) : 'Fast2SMS delivery notice';
      return { success: false, otp, error: errMsg };
    }
  } catch (err) {
    console.error('Fast2SMS fetch error:', err);
    // Direct CORS fallback attempt via Fast2SMS GET request
    try {
      const directUrl = `https://www.fast2sms.com/dev/bulkV2?authorization=${encodeURIComponent(apiKey)}&route=q&message=${encodeURIComponent(`Your Next Archer verification OTP code is ${otp}`)}&language=english&flash=0&numbers=${cleanedPhone}`;
      const directRes = await fetch(directUrl, { method: 'GET' });
      const directData = await directRes.json();
      if (directData && (directData.return === true || directData.status_code === 200)) {
        return { success: true, otp, data: directData };
      }
    } catch (directErr) {
      console.warn('Fast2SMS direct fetch notice:', directErr);
    }
    return { success: false, otp, error: err.message };
  }
};

export const sendPhonePasswordResetOTP = async (phoneNumber) => {
  const cleanedPhone = phoneNumber.replace(/\D/g, '').slice(-10);
  return await sendRealPhoneOTP(cleanedPhone);
};

export const sendRealEmailOTP = async (email) => {
  const otp = generateOTP('email');
  const url = 'http://localhost:3001/api/brevo';

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
          <div style="font-family: 'Poppins', sans-serif; background-color: #000000; color: #ffffff; padding: 30px; border-radius: 12px; max-width: 480px; margin: 0 auto; border: 1px solid #333333;">
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
  
  if (Date.now() - stored.createdAt > OTP_EXPIRY_MS) {
    delete otpStore[identifier];
    return { valid: false, error: 'OTP has expired. Please request a new one.' };
  }
  
  stored.attempts += 1;
  if (stored.attempts > 5) {
    delete otpStore[identifier];
    return { valid: false, error: 'Too many attempts. Please request a new OTP.' };
  }
  
  if (stored.code === inputCode) {
    delete otpStore[identifier];
    return { valid: true };
  }
  
  return { valid: false, error: `Invalid OTP. ${5 - stored.attempts} attempts remaining.` };
};

export const clearOTP = (identifier) => {
  delete otpStore[identifier];
};
