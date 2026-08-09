const express = require('express');
const router = express.Router();
const { getTwinProfile, updateTwinProfile, enqueueAgentRun, getAgentRun, downloadTwinFile } = require('../controllers/twinController');
const { optionalAuth } = require('../middleware/auth');

router.get('/profile', optionalAuth, getTwinProfile);
router.put('/profile', optionalAuth, updateTwinProfile);
router.post('/runs', optionalAuth, enqueueAgentRun);
router.get('/runs/:runId', optionalAuth, getAgentRun);
router.get('/sessions/:sessionId/files/:fileName', optionalAuth, downloadTwinFile);

module.exports = router;
