const supabase = require('../config/supabase');
const crypto = require('crypto');

/**
 * Get Twin Profile
 * GET /api/v1/twin/profile
 */
const getTwinProfile = async (req, res) => {
  try {
    const user_id = req.user.sub || req.user.id;
    const first_name = req.user.first_name || req.user.firstName || 'User';
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
    const user_id = req.user.sub || req.user.id;
    const first_name = req.user.first_name || req.user.firstName || 'User';
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
    const user_id = req.user?.sub || req.user?.id || 'guest';
    
    // Forward to the actual Digital Twin Python API
    const twinApiRes = await fetch('http://65.2.37.177:8000/runs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user_id}`
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
 * Polling Endpoint (Proxies to Digital Twin API)
 * GET /api/v1/twin/runs/:runId
 */
const getAgentRun = async (req, res) => {
  try {
    const runId = req.params.runId;
    const user_id = req.user?.sub || req.user?.id || 'guest';

    const twinApiRes = await fetch(`http://65.2.37.177:8000/runs/${runId}`, {
      headers: {
        'Authorization': `Bearer ${user_id}`
      }
    });

    if (!twinApiRes.ok) {
      console.error(`Twin API returned status ${twinApiRes.status}`);
      return res.status(twinApiRes.status).json({ success: false, message: 'Digital Twin API error' });
    }

    const data = await twinApiRes.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('getAgentRun error:', error);
    return res.status(500).json({ success: false, message: 'Failed to check run' });
  }
};

module.exports = {
  getTwinProfile,
  updateTwinProfile,
  enqueueAgentRun,
  getAgentRun
};
