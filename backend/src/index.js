const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const corsMiddleware = require('./config/cors');
const authRoutes = require('./routes/auth.routes');
const chatRoutes = require('./routes/chat.routes');
const otpRoutes = require('./routes/otp.routes');

const app = express();
const PORT = process.env.PORT || 4000;

// Security & Parsing Middlewares
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(corsMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(morgan('dev'));

// API Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'Next Archer Production Backend API',
    timestamp: new Date().toISOString(),
    aiEngine: 'Grok API (xAI / Groq)',
    version: '1.0.0'
  });
});

// API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/v1/otp', otpRoutes);

// Global 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API Endpoint Not Found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Next Archer Production Backend Server running on port ${PORT}`);
  console.log(`⚡ Grok AI Engine initialized with API Key.`);
});
