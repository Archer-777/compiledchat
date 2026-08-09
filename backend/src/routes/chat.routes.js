const express = require('express');
const router = express.Router();
const { chatCompletion, getChatHistory, sessionMessages, saiStream, analyzeSession, getLatestTelemetry, syncUserProxy, syncSessionProxy, getSessionsProxy, getMessagesProxy } = require('../controllers/chatController');
const { optionalAuth } = require('../middleware/auth');

router.post('/completions', optionalAuth, chatCompletion);
router.get('/history', optionalAuth, getChatHistory);
router.post('/sessions/:sessionId/messages', optionalAuth, sessionMessages);
router.post('/sai/stream', optionalAuth, saiStream);
router.post('/sai/analyze', optionalAuth, analyzeSession);
router.get('/sai/telemetry', optionalAuth, getLatestTelemetry);

// Proxies for Supabase DB Operations (bypasses RLS using Service Key)
router.post('/sync-user', optionalAuth, syncUserProxy);
router.post('/sync-session', optionalAuth, syncSessionProxy);
router.get('/sessions', optionalAuth, getSessionsProxy);
router.get('/sessions/:sessionId/messages-proxy', optionalAuth, getMessagesProxy);

module.exports = router;
