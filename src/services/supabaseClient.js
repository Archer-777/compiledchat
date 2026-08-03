import { createClient } from '@supabase/supabase-js';

// Polyfill URL safely if in native environment
if (typeof window === 'undefined' || !window.URL) {
  try {
    require('react-native-url-polyfill/auto');
  } catch (_) {}
}

const safeWebStorage = {
  getItem: (key) => (typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem(key) : null),
  setItem: (key, val) => {
    if (typeof window !== 'undefined' && window.localStorage) window.localStorage.setItem(key, val);
  },
  removeItem: (key) => {
    if (typeof window !== 'undefined' && window.localStorage) window.localStorage.removeItem(key);
  },
};

// Live Supabase project credentials
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://qwmnyomlfchazapkohfy.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_KEY || 'sb_publishable_C0TgaPZQ0Y88i1oJkx9HTA_VqtDnJUv';

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes('your-supabase-project'));

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: safeWebStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
