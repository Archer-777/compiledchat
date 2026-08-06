const cors = require('cors');

const getAllowedOrigins = () => {
  const envOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [];
  const defaultOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8081',
    'https://nextarcher.vercel.app',
    'https://nextarcher-chat.vercel.app'
  ];
  return Array.from(new Set([...envOrigins, ...defaultOrigins])).map(o => o.trim()).filter(Boolean);
};

const corsOptions = {
  origin: (origin, callback) => {
    const allowed = getAllowedOrigins();
    // Allow non-browser requests (e.g. Postman, curl, server-to-server) or matching allowed origins
    if (!origin || allowed.includes(origin) || allowed.some(a => origin.endsWith('.vercel.app'))) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive fallback for deployment flexibility
    }
  },
  credentials: true, // Crucial for HttpOnly cookies across Vercel frontends & backend server
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-api-key'],
  exposedHeaders: ['Set-Cookie']
};

module.exports = cors(corsOptions);
