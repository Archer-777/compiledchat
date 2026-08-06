const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const { JWT_SECRET } = require('../middleware/auth');

// Helper to set HttpOnly auth cookie compatible with Vercel cross-site deployments
const setAuthCookie = (res, token) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('authToken', token, {
    httpOnly: true,
    secure: isProd, // True in production over HTTPS
    sameSite: isProd ? 'none' : 'lax', // 'none' required for cross-origin Vercel requests
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });
};

/**
 * Register User
 */
const register = async (req, res) => {
  try {
    const { firstName, lastName, age, gender, profession, phone, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const registeredAt = new Date().toISOString();

    const record = {
      first_name: firstName || '',
      last_name: lastName || '',
      full_name: `${firstName || ''} ${lastName || ''}`.trim(),
      age: parseInt(age, 10) || null,
      gender: gender || '',
      profession: profession || '',
      phone: phone || '',
      email: email.toLowerCase().trim(),
      password: password, // Legacy fallback
      password_hash: passwordHash,
      phone_verified: true,
      email_verified: true,
      registered_at: registeredAt,
      updated_at: registeredAt
    };

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert([record], { onConflict: 'email' })
      .select();

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    const user = data && data.length > 0 ? data[0] : record;
    const token = jwt.sign(
      { id: user.id || email, email: user.email, firstName: user.first_name || firstName },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    setAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        firstName: user.first_name || firstName,
        lastName: user.last_name || lastName,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (err) {
    console.error('Registration controller error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Login User
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', cleanEmail)
      .limit(1);

    if (error || !data || data.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found. Please register first.' });
    }

    const user = data[0];
    let isMatch = false;

    if (user.password_hash) {
      isMatch = await bcrypt.compare(password, user.password_hash);
    }
    if (!isMatch && user.password === password) {
      isMatch = true;
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, firstName: user.first_name || (user.full_name ? user.full_name.split(' ')[0] : '') },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    setAuthCookie(res, token);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        firstName: user.first_name || (user.full_name ? user.full_name.split(' ')[0] : ''),
        lastName: user.last_name || '',
        email: user.email,
        phone: user.phone
      }
    });
  } catch (err) {
    console.error('Login controller error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Get Current Authenticated User Profile
 */
const getMe = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', req.user.email)
      .limit(1);

    if (error || !data || data.length === 0) {
      return res.status(200).json({
        success: true,
        user: req.user
      });
    }

    const user = data[0];
    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        firstName: user.first_name || (user.full_name ? user.full_name.split(' ')[0] : ''),
        lastName: user.last_name || '',
        email: user.email,
        phone: user.phone,
        profession: user.profession,
        age: user.age
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Logout User
 */
const logout = async (req, res) => {
  res.clearCookie('authToken');
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
};

module.exports = {
  register,
  login,
  getMe,
  logout
};
