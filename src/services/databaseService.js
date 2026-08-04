import { supabase, isSupabaseConfigured } from './supabaseClient';

// Safe storage helper for web & local persistence
const safeStorage = {
  getItem: async (key) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    return null;
  },
  setItem: async (key, val) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, val);
    }
  },
  removeItem: async (key) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  }
};

const LOCAL_AURA_KEY = 'spiritualize_user_aura';

// Helper to extract 128-D vector descriptor array
const extractDescriptor = (sig) => {
  if (!sig) return null;
  if (sig instanceof Float32Array) return Array.from(sig);
  if (Array.isArray(sig) && sig.length === 128) return sig;
  if (typeof sig === 'object' && !Array.isArray(sig)) {
    if (sig.descriptor) return extractDescriptor(sig.descriptor);
  }
  if (typeof sig === 'string') {
    try { return extractDescriptor(JSON.parse(sig)); } catch (_) {}
  }
  return null;
};

/**
 * Database Service providing unified access to Supabase with automatic offline/localStorage fallback.
 * Production-ready for 1,000+ to 100,000+ users via pgvector HNSW indexing & Storage Buckets.
 */
export const databaseService = {
  /**
   * Check connection status to Supabase backend
   */
  async checkConnection() {
    if (!isSupabaseConfigured) {
      return { connected: false, mode: 'local', message: 'Supabase URL/Key missing. Using local storage mode.' };
    }

    try {
      const { data, error } = await supabase.from('user_auras').select('id').limit(1);
      if (error && error.code !== 'PGRST116') {
        return { connected: false, mode: 'configured_offline', message: error.message };
      }
      return { connected: true, mode: 'supabase', message: 'Connected to Supabase PostgreSQL' };
    } catch (err) {
      return { connected: false, mode: 'local', message: err.message };
    }
  },

  /**
   * Save an Aura scan result to Supabase (and cache locally)
   * High performance: Uploads image to Storage CDN and embeds 128-D vector
   */
  async saveAuraScan({ image, signature, frequency = '432Hz - 963Hz', resonanceScore = 98.4 }) {
    const rawVector = extractDescriptor(signature);

    const payload = {
      id: 'aura_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      image,
      signature,
      frequency,
      resonance_score: resonanceScore,
      created_at: new Date().toISOString(),
    };

    // 1. Cache in AsyncStorage / localStorage for instant offline access
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(LOCAL_AURA_KEY, JSON.stringify(payload));
        
        const existingListStr = window.localStorage.getItem('spiritualize_user_auras_list');
        const list = existingListStr ? JSON.parse(existingListStr) : [];
        list.unshift({ ...payload, image: null }); // Keep local storage lightweight
        window.localStorage.setItem('spiritualize_user_auras_list', JSON.stringify(list.slice(0, 10)));
      }
      await safeStorage.setItem(LOCAL_AURA_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('Local storage cache error:', e);
    }

    // 2. Upload image to Supabase Storage Bucket & save vector record
    if (isSupabaseConfigured) {
      try {
        let imageUrl = null;

        // Convert base64 image data to blob and upload to 'aura_scans' storage bucket
        if (image && typeof image === 'string' && image.startsWith('data:image')) {
          try {
            const mimeMatch = image.match(/data:(image\/\w+);base64,/);
            const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
            const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: mime });
            const fileName = `scan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}.jpg`;

            const { data: uploadData, error: uploadErr } = await supabase.storage
              .from('aura_scans')
              .upload(fileName, blob, { contentType: mime, upsert: true });

            if (!uploadErr && uploadData) {
              const { data: urlData } = supabase.storage.from('aura_scans').getPublicUrl(fileName);
              if (urlData && urlData.publicUrl) {
                imageUrl = urlData.publicUrl;
              }
            }
          } catch (err) {
            console.warn('[DB Storage] Upload image error:', err);
          }
        }

        const dbRecord = {
          image_url: imageUrl || (image && image.startsWith('http') ? image : null),
          image_data: imageUrl ? null : image, // Save raw base64 only if storage upload fails
          signature: typeof signature === 'object' ? JSON.stringify(signature) : signature,
          embedding: rawVector && rawVector.length === 128 ? rawVector : null,
          frequency: frequency,
          resonance_score: resonanceScore,
        };

        const { data, error } = await supabase
          .from('user_auras')
          .insert([dbRecord])
          .select();

        if (error) {
          console.warn('Supabase insert aura error:', error.message);
          return { success: true, source: 'local', data: payload };
        }

        return { success: true, source: 'supabase', data: data[0] };
      } catch (err) {
        console.warn('Supabase save error:', err);
      }
    }

    return { success: true, source: 'local', data: payload };
  },

  /**
   * Match a 128-D face descriptor against all stored profiles.
   * High performance: Uses Supabase PostgreSQL pgvector RPC match function (< 5ms server side).
   * Fallback: Client-side Euclidean distance calculation.
   */
  async findMatchingAuraScan(currentDescriptor) {
    if (!currentDescriptor) return { match: false, score: 0, aura: null };

    const curDesc = extractDescriptor(currentDescriptor);
    if (!curDesc || curDesc.length !== 128) {
      console.warn('[DB] Current descriptor is not a valid 128-D vector');
      return { match: false, score: 0, aura: null };
    }

    const MATCH_THRESHOLD = 0.6;

    // 1. Server-side pgvector distance search via match_aura_scan RPC function
    if (isSupabaseConfigured) {
      try {
        const { data: rpcMatches, error: rpcError } = await supabase.rpc('match_aura_scan', {
          query_embedding: curDesc,
          match_threshold: MATCH_THRESHOLD,
          match_count: 1,
        });

        if (!rpcError && rpcMatches && rpcMatches.length > 0) {
          const matchedRow = rpcMatches[0];
          const confidence = Math.max(0, Math.round((1 - matchedRow.distance / MATCH_THRESHOLD) * 100));
          console.log(`[DB pgvector RPC] Match found! Distance: ${matchedRow.distance.toFixed(4)}, Confidence: ${confidence}%`);
          return {
            match: true,
            score: confidence,
            aura: {
              id: matchedRow.id,
              image: matchedRow.image_url || matchedRow.image_data,
              signature: matchedRow.signature,
              frequency: matchedRow.frequency,
              resonanceScore: matchedRow.resonance_score,
            },
          };
        }
      } catch (err) {
        console.warn('[DB pgvector RPC] Error or RPC not configured:', err);
      }
    }

    // 2. Metadata-only query fallback (avoids fetching large base64 image strings)
    let savedAuras = [];

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('user_auras')
          .select('id, image_url, signature, frequency, resonance_score, created_at')
          .order('created_at', { ascending: false })
          .limit(100);

        if (!error && data && data.length > 0) {
          savedAuras = data.map((d) => ({
            id: d.id,
            image: d.image_url,
            signature: d.signature,
            frequency: d.frequency,
            resonanceScore: d.resonance_score,
            created_at: d.created_at,
          }));
        }
      } catch (err) {
        console.warn('[DB] Supabase fetch error:', err);
      }
    }

    // Local Storage fallback
    if (savedAuras.length === 0) {
      try {
        let stored = null;
        if (typeof window !== 'undefined' && window.localStorage) {
          stored = window.localStorage.getItem('spiritualize_user_auras_list');
        }
        if (stored) {
          savedAuras = JSON.parse(stored);
        }
      } catch (e) {
        console.warn('[DB] Local storage read error:', e);
      }
    }

    if (savedAuras.length === 0) {
      return { match: false, score: 0, aura: null };
    }

    console.log(`[DB Fallback] Comparing against ${savedAuras.length} stored aura profile(s)`);

    const euclidean = (v1, v2) => {
      let sum = 0;
      for (let i = 0; i < 128; i++) {
        const diff = (v1[i] || 0) - (v2[i] || 0);
        sum += diff * diff;
      }
      return Math.sqrt(sum);
    };

    let bestMatch = null;
    let bestDistance = Infinity;

    for (const saved of savedAuras) {
      const savedDesc = extractDescriptor(saved.signature);
      if (!savedDesc || savedDesc.length !== 128) continue;

      const dist = euclidean(curDesc, savedDesc);

      if (dist < bestDistance) {
        bestDistance = dist;
        bestMatch = saved;
      }
    }

    if (bestDistance < MATCH_THRESHOLD && bestMatch) {
      const confidence = Math.max(0, Math.round((1 - bestDistance / MATCH_THRESHOLD) * 100));
      console.log(`[DB Fallback] MATCH FOUND! Distance: ${bestDistance.toFixed(4)}, Confidence: ${confidence}%`);
      return { match: true, score: confidence, aura: bestMatch };
    }

    console.log(`[DB Fallback] No match. Best distance: ${bestDistance.toFixed(4)}`);
    return { match: false, score: 0, aura: null };
  },

  /**
   * Clear stored aura profiles for testing
   */
  async clearAuraScans() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(LOCAL_AURA_KEY);
        window.localStorage.removeItem('spiritualize_user_auras_list');
      }
      await safeStorage.removeItem(LOCAL_AURA_KEY);
      await safeStorage.removeItem('spiritualize_user_auras_list');
    } catch (e) {
      console.warn('Error clearing local aura cache:', e);
    }
  },

  /**
   * Fetch the latest Aura scan from Supabase (or local storage fallback)
   */
  async fetchLatestAuraScan() {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('user_auras')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1);

        if (!error && data && data.length > 0) {
          const aura = data[0];
          return {
            source: 'supabase',
            aura: {
              image: aura.image_url || aura.image_data,
              signature: aura.signature,
              frequency: aura.frequency,
              resonanceScore: aura.resonance_score,
              timestamp: aura.created_at,
            },
          };
        }
      } catch (err) {
        console.warn('Error fetching aura from Supabase:', err);
      }
    }

    // Fallback to local storage
    try {
      let stored = null;
      if (typeof window !== 'undefined' && window.localStorage) {
        stored = window.localStorage.getItem(LOCAL_AURA_KEY);
      }
      if (!stored) {
        stored = await safeStorage.getItem(LOCAL_AURA_KEY);
      }

      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          source: 'local',
          aura: parsed,
        };
      }
    } catch (e) {
      console.warn('Error reading local aura:', e);
    }

    return { source: 'none', aura: null };
  },

  /**
   * Fetch list of micro tasks from Supabase or default set
   */
  async fetchMicroTasks() {
    const defaultTasks = [
      {
        id: '1',
        title: 'Under 10-Min Micro Tasks',
        desc: 'Complete quick AI tasks to build steady passive earnings.',
        completed: false,
      },
      {
        id: '2',
        title: 'Automated Yield',
        desc: 'Earn rewards automatically as AI models run in background.',
        completed: false,
      },
      {
        id: '3',
        title: 'Quantum Resonance Check',
        desc: 'Perform daily aura resonance scan to unlock tier 2 bonuses.',
        completed: true,
      },
    ];

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('micro_tasks').select('*').order('created_at', { ascending: true });
        if (!error && data && data.length > 0) {
          return { source: 'supabase', tasks: data };
        }
      } catch (err) {
        console.warn('Error fetching tasks from Supabase:', err);
      }
    }

    return { source: 'default', tasks: defaultTasks };
  },

  /**
   * Save authorized social profile (Instagram / Snapchat) linked with Aura Scanner image to database
   */
  async saveAuthorizedUserProfile({ platform, userProfile }) {
    // 1. Fetch latest Aura scan image
    let auraImage = userProfile.auraImage || null;
    if (!auraImage) {
      try {
        const latestAuraRes = await this.fetchLatestAuraScan();
        if (latestAuraRes && latestAuraRes.aura && latestAuraRes.aura.image) {
          auraImage = latestAuraRes.aura.image;
        }
      } catch (err) {
        console.warn('Error fetching latest aura image:', err);
      }
    }

    const recordPayload = {
      id: `auth_${platform}_${Date.now()}`,
      platform,
      name: userProfile.name,
      handle: userProfile.handle,
      age: userProfile.age,
      address: userProfile.address,
      email: userProfile.email,
      token: userProfile.token,
      verified_date: userProfile.verifiedDate || new Date().toISOString(),
      aura_image: auraImage,
      created_at: new Date().toISOString(),
    };

    // 2. Cache locally in window.localStorage and safeStorage
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const storedStr = window.localStorage.getItem('spiritualize_authorized_profiles');
        const stored = storedStr ? JSON.parse(storedStr) : {};
        stored[platform] = recordPayload;
        window.localStorage.setItem('spiritualize_authorized_profiles', JSON.stringify(stored));
      }
      await safeStorage.setItem('spiritualize_authorized_profiles', JSON.stringify(recordPayload));
    } catch (e) {
      console.warn('[DB] Local cache auth profile error:', e);
    }

    // 3. Save to Supabase `user_profiles` database table if configured
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .upsert([{
            platform: platform,
            full_name: userProfile.name,
            username: userProfile.handle,
            age: userProfile.age,
            address: userProfile.address,
            email: userProfile.email,
            access_token: userProfile.token,
            aura_image_url: auraImage,
            updated_at: new Date().toISOString(),
          }])
          .select();

        if (!error && data && data.length > 0) {
          console.log('[DB Supabase] Saved authorized user profile with Aura Scanner picture:', data[0]);
          return { success: true, source: 'supabase', data: data[0], recordPayload };
        }
      } catch (err) {
        console.warn('[DB Supabase] Save user_profiles error:', err);
      }
    }

    return { success: true, source: 'local', data: recordPayload };
  },

  /**
   * Fetch stored authorized social profiles along with linked Aura Scanner image
   */
  async fetchAuthorizedUserProfiles() {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .order('updated_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const res = {};
          data.forEach(item => {
            res[item.platform] = {
              name: item.full_name,
              handle: item.username,
              age: item.age,
              address: item.address,
              email: item.email,
              token: item.access_token,
              verifiedDate: new Date(item.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              auraImage: item.aura_image_url,
            };
          });
          return res;
        }
      } catch (err) {
        console.warn('[DB] Error fetching user_profiles from Supabase:', err);
      }
    }

    // Fallback to local storage
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem('spiritualize_authorized_profiles');
        if (stored) {
          const parsed = JSON.parse(stored);
          const res = {};
          Object.keys(parsed).forEach((k) => {
            const item = parsed[k];
            res[k] = {
              name: item.name,
              handle: item.handle,
              age: item.age,
              address: item.address,
              email: item.email,
              token: item.token,
              verifiedDate: item.verified_date,
              auraImage: item.aura_image,
            };
          });
          return res;
        }
      }
    } catch (e) {}

    return null;
  },
};

export default databaseService;
