const supabase = require('../config/supabase');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const TWIN_JWT_SECRET = process.env.TWIN_JWT_SECRET || 'twin-local-test-secret-key-32-chars-long';

const isUuid = (val) => typeof val === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

/**
 * Ensures a valid signed JWT token containing human-readable claims:
 * { sub: "<email/username>", name: "<name>", preferred_username: "<username>", exp: <timestamp>, iat: <timestamp> }
 * is prepared for all upstream Digital Twin API calls.
 */
function getOrGenerateTwinJwt(req) {
  let authHeader = req.headers['authorization'] || req.query?.token || '';
  let token = authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : authHeader.trim();
  const nowSec = Math.floor(Date.now() / 1000);

  // 1. If incoming token is already a 3-part signed JWT
  if (token && token.split('.').length === 3) {
    try {
      const decoded = jwt.decode(token);
      if (decoded && decoded.sub) {
        // If sub is a raw UUID, replace with human-readable email/name if available
        let humanSub = decoded.sub;
        if (isUuid(humanSub)) {
          humanSub = decoded.email || decoded.preferred_username || decoded.name || (req.user?.email) || (req.user?.firstName) || humanSub;
        }

        const claims = {
          sub: String(humanSub),
          name: decoded.name || req.user?.firstName || 'Alex',
          preferred_username: decoded.preferred_username || decoded.name || 'Alex',
          email: decoded.email || req.user?.email || '',
          user_id: decoded.user_id || req.user?.id || '',
          iat: decoded.iat || nowSec,
          exp: (decoded.exp && decoded.exp > nowSec + 60) ? decoded.exp : (nowSec + 30 * 24 * 60 * 60)
        };

        return jwt.sign(claims, TWIN_JWT_SECRET, { algorithm: 'HS256' });
      }
    } catch (e) {}
  }

  // 2. Derive user identity from request context or create valid JWT
  let userSub = req.user?.email || req.user?.preferred_username || req.user?.firstName;
  if (!userSub && req.user?.sub && !isUuid(req.user.sub)) {
    userSub = req.user.sub;
  }
  if (!userSub && token && !token.includes('.') && !isUuid(token)) {
    userSub = token;
  }
  if (!userSub) {
    userSub = 'user_guest_archer';
  }

  const userName = req.user?.firstName || req.user?.name || req.user?.fullName || (token && !token.includes('.') ? token : 'Alex');
  const userEmail = req.user?.email || '';

  return jwt.sign({
    sub: String(userSub),
    name: String(userName),
    preferred_username: String(userName),
    email: userEmail,
    user_id: req.user?.id || '',
    iat: nowSec,
    exp: nowSec + (30 * 24 * 60 * 60) // 30 days valid
  }, TWIN_JWT_SECRET, { algorithm: 'HS256' });
}

/**
 * Get Twin Profile
 * GET /api/v1/twin/profile
 */
const getTwinProfile = async (req, res) => {
  try {
    const user_id = req.user?.sub || req.user?.id || 'guest';
    const first_name = req.user?.first_name || req.user?.firstName || 'User';
    const expected_twin_name = `${first_name}_2.0`;

    let twin_data = null;
    
    if (supabase) {
      const { data, error } = await supabase
        .from('digital_twins')
        .select('*')
        .eq('user_id', user_id)
        .single();
        
      if (data) {
        twin_data = data;
      }
    }

    if (!twin_data) {
      twin_data = {
        user_id,
        twin_name: expected_twin_name,
        photo_url: null,
        bw_filter: 'dramatic',
        sacred_ring: 'halo',
        glow_intensity: 85
      };
    }

    return res.status(200).json({ twin: twin_data });
  } catch (error) {
    console.error('getTwinProfile error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch twin profile' });
  }
};

/**
 * Update Twin Profile
 * PUT /api/v1/twin/profile
 */
const updateTwinProfile = async (req, res) => {
  try {
    const user_id = req.user?.sub || req.user?.id || 'guest';
    const first_name = req.user?.first_name || req.user?.firstName || 'User';
    const expected_twin_name = `${first_name}_2.0`;

    const {
      photo_url = null,
      bw_filter = 'dramatic',
      sacred_ring = 'halo',
      glow_intensity = 85
    } = req.body;

    const payload = {
      user_id,
      twin_name: expected_twin_name,
      photo_url,
      bw_filter,
      sacred_ring,
      glow_intensity
    };

    if (supabase) {
      const { error } = await supabase
        .from('digital_twins')
        .upsert([payload], { onConflict: 'user_id' });
        
      if (error) {
        console.error('Supabase upsert error:', error);
        return res.status(500).json({ success: false, message: 'Database update failed' });
      }
    }

    return res.status(200).json({ status: 'updated', twin: payload });
  } catch (error) {
    console.error('updateTwinProfile error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update twin profile' });
  }
};

/**
 * Enqueue Agent Run (Proxies to Digital Twin API)
 * POST /api/v1/twin/runs
 */
const enqueueAgentRun = async (req, res) => {
  try {
    const { session_id, message } = req.body;
    const jwtToken = getOrGenerateTwinJwt(req);
    
    // Forward to the actual Digital Twin Python API with verified JWT
    const twinApiRes = await fetch('http://65.2.37.177:8000/runs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      },
      body: JSON.stringify({ session_id, message })
    });

    if (!twinApiRes.ok) {
      console.error(`Twin API returned status ${twinApiRes.status}`);
      return res.status(twinApiRes.status).json({ success: false, message: 'Digital Twin API error' });
    }

    const data = await twinApiRes.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('enqueueAgentRun error:', error);
    return res.status(500).json({ success: false, message: 'Failed to enqueue run' });
  }
};

/**
 * Get Agent Run Status (Proxies to Digital Twin API)
 * GET /api/v1/twin/runs/:runId
 */
const getAgentRun = async (req, res) => {
  try {
    const { runId } = req.params;
    const jwtToken = getOrGenerateTwinJwt(req);

    const twinApiRes = await fetch(`http://65.2.37.177:8000/runs/${runId}`, {
      headers: {
        'Authorization': `Bearer ${jwtToken}`
      }
    });

    if (!twinApiRes.ok) {
      console.error(`Twin API returned status ${twinApiRes.status}`);
      return res.status(twinApiRes.status).json({ success: false, message: 'Twin API run fetch failed' });
    }

    const data = await twinApiRes.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('getAgentRun error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch run status' });
  }
};

/**
 * Download a generated file from a Twin Session
 * GET /api/v1/twin/sessions/:sessionId/files/:fileName
 */
const downloadTwinFile = async (req, res) => {
  try {
    const { sessionId, fileName } = req.params;
    const jwtToken = getOrGenerateTwinJwt(req);
    
    const twinApiRes = await fetch(`http://65.2.37.177:8000/sessions/${sessionId}/files/${encodeURIComponent(fileName)}`, {
      headers: {
        'Authorization': `Bearer ${jwtToken}`
      }
    });

    if (!twinApiRes.ok) {
      console.error(`Twin API file download returned status ${twinApiRes.status}`);
      return res.status(twinApiRes.status).json({ success: false, message: 'File not found on Twin API' });
    }

    // Set correct headers for binary download
    twinApiRes.headers.forEach((value, name) => {
      res.setHeader(name, value);
    });

    // Stream to client
    const { Readable } = require('stream');
    if (twinApiRes.body) {
      const webStream = Readable.fromWeb(twinApiRes.body);
      webStream.on('error', (err) => {
        console.warn('downloadTwinFile stream error:', err.message);
        if (!res.writableEnded) res.end();
      });
      webStream.pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    console.error('downloadTwinFile error:', error);
    return res.status(500).json({ success: false, message: 'Failed to download file' });
  }
};

/**
 * Stream Agent Run Events (SSE)
 * GET /api/v1/twin/runs/:runId/events
 */
const streamAgentEvents = async (req, res) => {
  try {
    const { runId } = req.params;
    const jwtToken = getOrGenerateTwinJwt(req);
    const lastEventId = req.headers['last-event-id'] || '';

    const headers = {
      'Authorization': `Bearer ${jwtToken}`
    };
    if (lastEventId) {
      headers['Last-Event-ID'] = lastEventId;
    }

    const twinApiRes = await fetch(`http://65.2.37.177:8000/runs/${runId}/events`, {
      headers
    });

    if (!twinApiRes.ok) {
      return res.status(twinApiRes.status).json({ success: false, message: 'Twin API event stream failed' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const { Readable } = require('stream');
    if (twinApiRes.body) {
      const webStream = Readable.fromWeb(twinApiRes.body);
      webStream.on('error', (err) => {
        console.warn('streamAgentEvents stream error:', err.message);
        if (!res.writableEnded) res.end();
      });
      webStream.pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    console.error('streamAgentEvents error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: 'Failed to stream events' });
    }
    if (!res.writableEnded) res.end();
  }
};

module.exports = {
  getTwinProfile,
  updateTwinProfile,
  enqueueAgentRun,
  getAgentRun,
  streamAgentEvents,
  downloadTwinFile
};
