import { supabase, isSupabaseConfigured } from '@/services/supabaseClient';

const USER_DATA_KEY = '@spiritual_register_user';

export const saveUserData = async (data) => {
  const registeredAt = new Date().toISOString();
  const payload = {
    ...data,
    fullName: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
    registeredAt,
  };

  let localSuccess = false;
  let supabaseSuccess = false;
  let supabaseError = null;

  // 1. Explicitly clear previous session cache before setting new user object
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(USER_DATA_KEY);
      const jsonValue = JSON.stringify(payload);
      window.localStorage.setItem(USER_DATA_KEY, jsonValue);
    }
    localSuccess = true;
  } catch (error) {
    console.error('Error saving local user data:', error);
  }

  // 2. Save to Supabase DB (user_profiles table)
  if (isSupabaseConfigured) {
    try {
      const record = {
        full_name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
        first_name: data.firstName || '',
        last_name: data.lastName || '',
        age: parseInt(data.age, 10) || null,
        gender: data.gender || '',
        profession: data.profession || '',
        phone: data.phone || '',
        email: data.email || '',
        password: data.password || '',
        phone_verified: Boolean(data.phoneVerified),
        email_verified: Boolean(data.emailVerified),
        platform: 'registration',
        updated_at: registeredAt,
        registered_at: registeredAt,
      };

      const { data: insertedData, error } = await supabase
        .from('user_profiles')
        .upsert([record], { onConflict: 'email' })
        .select();

      if (error) {
        console.warn('Supabase save user_profiles error, attempting fallback insert:', error.message);
        const { error: insertErr } = await supabase
          .from('user_profiles')
          .insert([record]);
        if (!insertErr) {
          supabaseSuccess = true;
        } else {
          supabaseError = insertErr.message;
        }
      } else {
        supabaseSuccess = true;
      }
    } catch (err) {
      console.error('Supabase connection exception during user registration:', err);
      supabaseError = err.message;
    }
  }

  return {
    success: localSuccess || supabaseSuccess,
    syncedSupabase: supabaseSuccess,
    error: supabaseError,
    data: payload,
  };
};

export const getUserData = async () => {
  let activeEmail = '';
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const webVal = window.localStorage.getItem(USER_DATA_KEY);
      if (webVal != null) {
        const parsed = JSON.parse(webVal);
        activeEmail = parsed.email || '';
      }
    }
  } catch (error) {
    console.error('Error reading local user data:', error);
  }

  // 1. Primary: Fetch active registered user profile from Supabase Database
  if (isSupabaseConfigured) {
    try {
      let query = supabase.from('user_profiles').select('*');
      if (activeEmail) {
        query = query.eq('email', activeEmail);
      } else {
        query = query.order('registered_at', { ascending: false }).limit(1);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        const row = data[0];
        const userObj = {
          firstName: row.first_name || (row.full_name ? row.full_name.split(' ')[0] : ''),
          lastName: row.last_name || (row.full_name ? row.full_name.split(' ').slice(1).join(' ') : ''),
          fullName: row.full_name || `${row.first_name || ''} ${row.last_name || ''}`.trim(),
          age: row.age ? String(row.age) : '',
          gender: row.gender || '',
          profession: row.profession || '',
          phone: row.phone || '',
          email: row.email || '',
          password: row.password || '',
          phoneVerified: Boolean(row.phone_verified),
          emailVerified: Boolean(row.email_verified),
          registeredAt: row.registered_at || row.updated_at,
        };
        // Sync active user to localStorage
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(USER_DATA_KEY, JSON.stringify(userObj));
          }
        } catch (e) {}
        return userObj;
      }
    } catch (e) {
      console.warn('Error fetching user data from Supabase DB:', e);
    }
  }

  // 2. Fallback to web localStorage if DB query is unavailable
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const webVal = window.localStorage.getItem(USER_DATA_KEY);
      if (webVal != null) return JSON.parse(webVal);
    }
  } catch (error) {
    console.error('Error reading local user data:', error);
  }

  return null;
};

export const clearUserData = async () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(USER_DATA_KEY);
    }
    return { success: true };
  } catch (error) {
    console.error('Error clearing user data:', error);
    return { success: false, error: error.message };
  }
};

export const resetUserPassword = async (email, newPassword) => {
  let localSuccess = false;
  let supabaseSuccess = false;

  // 1. Update localStorage
  try {
    const existing = await getUserData();
    if (existing) {
      const updated = { ...existing, password: newPassword };
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(USER_DATA_KEY, JSON.stringify(updated));
      }
      localSuccess = true;
    }
  } catch (e) {
    console.error('Error updating local password:', e);
  }

  // 2. Update Supabase DB (user_profiles table)
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ password: newPassword, updated_at: new Date().toISOString() })
        .eq('email', email);

      if (!error) {
        supabaseSuccess = true;
      }
    } catch (err) {
      console.error('Supabase password reset error:', err);
    }
  }

  return { success: localSuccess || supabaseSuccess };
};
