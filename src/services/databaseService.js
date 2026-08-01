import { supabase, isSupabaseConfigured } from './supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCAL_AURA_KEY = 'spiritualize_user_aura';
const LOCAL_TASKS_KEY = 'spiritualize_micro_tasks';

/**
 * Database Service providing unified access to Supabase with automatic offline/localStorage fallback.
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
   */
  async saveAuraScan({ image, signature, frequency = '432Hz - 963Hz', resonanceScore = 98.4 }) {
    const payload = {
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
      }
      await AsyncStorage.setItem(LOCAL_AURA_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('Local storage cache error:', e);
    }

    // 2. Persist to Supabase if available
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('user_auras')
          .insert([
            {
              image_data: image,
              signature: signature,
              frequency: frequency,
              resonance_score: resonanceScore,
            },
          ])
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
              image: aura.image_data,
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
        stored = await AsyncStorage.getItem(LOCAL_AURA_KEY);
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
};

export default databaseService;
