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
 * Enqueue Agent Run (Mock/Stub matching Python implementation)
 * POST /api/v1/twin/runs
 */
const enqueueAgentRun = async (req, res) => {
  try {
    const { session_id, message } = req.body;
    const run_id = `run_${crypto.randomUUID().replace(/-/g, '')}`;
    
    return res.status(200).json({
      run_id,
      status: 'queued',
      session_id,
      message
    });
  } catch (error) {
    console.error('enqueueAgentRun error:', error);
    return res.status(500).json({ success: false, message: 'Failed to enqueue run' });
  }
};

/**
 * Polling Endpoint (Mock to satisfy frontend expectations if needed)
 * GET /api/v1/twin/runs/:runId
 */
const getAgentRun = async (req, res) => {
  try {
    // Return a dummy completion since we aren't running an actual async worker for now
    // This matches the frontend's expectation in DigitalTwinChatScreen.jsx
    return res.status(200).json({
      id: req.params.runId,
      status: 'completed',
      result: 'The twin agent has received your instructions. Synchronization complete.'
    });
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
