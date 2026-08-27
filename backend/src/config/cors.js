const cors = require('cors');

const getAllowedOrigins = () => {
  const envOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [];
  const defaultOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8081',
    'https://nextarcher.vercel.app',
    'https://nextarcher-chat.vercel.app',
    'https://compiledchat.vercel.app',
    'https://sai.nextarcher.com',
    'https://chat.sai.nextarcher.com'
  ];
  return Array.from(new Set([...envOrigins, ...defaultOrigins]))
    .map(o => o.trim().replace(/\/+$/, ''))
    .filter(Boolean);
};

const corsOptions = {
  origin: (origin, callback) => {
    // Non-browser or local clients (curl, mobile webview without origin, Postman)
    if (!origin) {
      return callback(null, true);
    }
    const cleanOrigin = origin.trim().replace(/\/+$/, '');
    const allowed = getAllowedOrigins();

    // Check against allowed list or matching wildcard domains (.vercel.app / .nextarcher.com / local IP)
    const isAllowed = 
      allowed.includes(cleanOrigin) ||
      cleanOrigin.endsWith('.vercel.app') ||
      cleanOrigin.endsWith('.nextarcher.com') ||
      cleanOrigin.includes('localhost') ||
      cleanOrigin.includes('127.0.0.1') ||
      /^https?:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/.test(cleanOrigin);

    if (isAllowed) {
      // Safari requires exact origin echo when credentials: true
      return callback(null, cleanOrigin);
    }

    // Permissive fallback so legitimate client variations are never silently dropped
    return callback(null, cleanOrigin);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'x-api-key',
    'Accept',
    'Cache-Control',
    'Origin',
    'Pragma',
    'User-Agent',
    'Keep-Alive'
  ],
  exposedHeaders: ['Set-Cookie', 'Content-Disposition'],
  optionsSuccessStatus: 200, // 200 status for older WebKit / Safari preflight checks
  maxAge: 86400 // Cache preflight checks for 24 hours
};

module.exports = cors(corsOptions);

