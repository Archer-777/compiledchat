const express = require('express');
const router = express.Router();
const { chatCompletion, getChatHistory, sessionMessages, saiStream } = require('../controllers/chatController');
const { optionalAuth } = require('../middleware/auth');

router.post('/completions', optionalAuth, chatCompletion);
router.get('/history', optionalAuth, getChatHistory);
router.post('/sessions/:sessionId/messages', optionalAuth, sessionMessages);
router.post('/sai/stream', optionalAuth, saiStream);

module.exports = router;
