const express = require('express');
const router = express.Router();
const { getTwinProfile, updateTwinProfile, enqueueAgentRun, getAgentRun } = require('../controllers/twinController');
const { optionalAuth } = require('../middleware/auth');

router.get('/profile', optionalAuth, getTwinProfile);
router.put('/profile', optionalAuth, updateTwinProfile);
router.post('/runs', optionalAuth, enqueueAgentRun);
router.get('/runs/:runId', optionalAuth, getAgentRun);

module.exports = router;
