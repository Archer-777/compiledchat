const express = require('express');
const router = express.Router();
const { chatCompletion, getChatHistory } = require('../controllers/chatController');
const { optionalAuth } = require('../middleware/auth');

router.post('/completions', optionalAuth, chatCompletion);
router.get('/history', optionalAuth, getChatHistory);

module.exports = router;
