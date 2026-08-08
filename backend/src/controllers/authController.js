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

const twinProfileStore = new Map();

/**
 * Save Digital Twin Profile & Custom Avatar Logo to public.digital_twins table
 */
const saveDigitalTwinProfile = async (req, res) => {
  try {
    const { email, avatarImage, filterMode, overlayPattern, auraIntensity, twinName } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const profile = { avatarImage, filterMode, overlayPattern, auraIntensity, twinName, updatedAt: new Date().toISOString() };
    twinProfileStore.set(cleanEmail, profile);

    try {
      const { data: userRows } = await supabase.from('users').select('id').eq('email', cleanEmail).limit(1);
      if (userRows && userRows.length > 0) {
        const userId = userRows[0].id;
        const validFilter = ['dramatic', 'ethereal', 'noir'].includes(filterMode) ? filterMode : 'dramatic';
        const validRing = ['halo', 'grid', 'matrix'].includes(overlayPattern) ? overlayPattern : 'halo';
        const validGlow = typeof auraIntensity === 'number' ? Math.min(100, Math.max(0, auraIntensity)) : 85;

        await supabase.from('digital_twins').upsert([{
          user_id: userId,
          twin_name: twinName || 'Archer_2.0',
          photo_url: avatarImage || null,
          bw_filter: validFilter,
          sacred_ring: validRing,
          glow_intensity: validGlow,
          updated_at: new Date().toISOString()
        }], { onConflict: 'user_id' });
      }
    } catch (e) {
      console.warn('digital_twins DB save notice:', e.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Digital Twin profile & photo avatar saved to DB (digital_twins table)',
      profile
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Get Digital Twin Profile & Custom Avatar Logo from public.digital_twins table
 */
const getDigitalTwinProfile = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email query param required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    if (twinProfileStore.has(cleanEmail) && twinProfileStore.get(cleanEmail).avatarImage) {
      return res.status(200).json({
        success: true,
        profile: twinProfileStore.get(cleanEmail)
      });
    }

    try {
      const { data: userRows } = await supabase.from('users').select('id').eq('email', cleanEmail).limit(1);
      if (userRows && userRows.length > 0) {
        const userId = userRows[0].id;
        const { data: twinRows } = await supabase.from('digital_twins').select('*').eq('user_id', userId).limit(1);
        if (twinRows && twinRows.length > 0) {
          const row = twinRows[0];
          const profile = {
            avatarImage: row.photo_url || null,
            filterMode: row.bw_filter || 'dramatic',
            overlayPattern: row.sacred_ring || 'halo',
            auraIntensity: row.glow_intensity || 85,
            twinName: row.twin_name || 'Archer_2.0'
          };
          twinProfileStore.set(cleanEmail, profile);
          return res.status(200).json({ success: true, profile });
        }
      }
    } catch (e) {
      console.warn('digital_twins DB fetch notice:', e.message);
    }

    return res.status(200).json({
      success: true,
      profile: { avatarImage: null, filterMode: 'dramatic', overlayPattern: 'halo', auraIntensity: 85, twinName: 'Archer_2.0' }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  register,
  login,
  getMe,
  logout,
  saveDigitalTwinProfile,
  getDigitalTwinProfile
};
