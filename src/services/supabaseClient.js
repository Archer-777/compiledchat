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
const SUPABASE_ANON_KEY = getEnvVar('VITE_SUPABASE_PUBLISHABLE_KEY', getEnvVar('VITE_SUPABASE_ANON_KEY', getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3bW55b21sZmNoYXphcGtvaGZ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTU1MTgzNCwiZXhwIjoyMTAxMTI3ODM0fQ.n-t9bJZ3juSlIK2OrJRrsSRQhZkbaLZFfNs_Zu8ELuY')));

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
