import { createClient } from '@supabase/supabase-js';

const getEnvVar = (key, fallback) => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return fallback;
};

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
const SUPABASE_URL = getEnvVar('VITE_SUPABASE_URL', getEnvVar('EXPO_PUBLIC_SUPABASE_URL', 'https://qwmnyomlfchazapkohfy.supabase.co'));
const SUPABASE_ANON_KEY = getEnvVar('VITE_SUPABASE_ANON_KEY', getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY', 'sb_publishable_C0TgaPZQ0Y88i1oJkx9HTA_VqtDnJUv'));

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes('your-supabase-project'));

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: safeWebStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export default supabase;
