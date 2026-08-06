const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'next_archer_super_secret_jwt_key_2026_xai_grok_998877';

/**
 * Authentication Middleware
 * Extracts token from HttpOnly cookie 'authToken' OR Authorization header 'Bearer <token>'
 */
const authenticateToken = (req, res, next) => {
  let token = null;

  // 1. Check HttpOnly cookie
  if (req.cookies && req.cookies.authToken) {
    token = req.cookies.authToken;
  }
  // 2. Check Authorization header
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token.'
    });
  }
};

/**
 * Optional Authentication Middleware (doesn't block if unauthenticated)
 */
const optionalAuth = (req, res, next) => {
  let token = null;
  if (req.cookies && req.cookies.authToken) {
    token = req.cookies.authToken;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      req.user = null;
    }
  }
  next();
};

module.exports = {
  authenticateToken,
  optionalAuth,
  JWT_SECRET
};
