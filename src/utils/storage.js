import { supabase, isSupabaseConfigured } from '../services/supabaseClient.js';

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

  // 2. Save to Supabase DB (users table and user_profiles table)
  if (isSupabaseConfigured) {
    try {
      // Do not include full_name in users record as full_name is a GENERATED ALWAYS column in PostgreSQL
      const userRecord = {
        first_name: data.firstName || '',
        last_name: data.lastName || '',
        age: parseInt(data.age, 10) || null,
        gender: data.gender || '',
        profession: data.profession || '',
        phone: data.phone || '',
        email: data.email || '',
        password_hash: data.password || '',
        phone_verified: Boolean(data.phoneVerified),
        email_verified: Boolean(data.emailVerified),
        updated_at: registeredAt,
      };

      const { error } = await supabase
        .from('users')
        .upsert([userRecord], { onConflict: 'email' });

      if (!error) {
        supabaseSuccess = true;
      } else {
        try {
          const profileRecord = {
            ...userRecord,
            full_name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
            platform: 'registration',
            registered_at: registeredAt
          };
          const { error: profileErr } = await supabase
            .from('user_profiles')
            .upsert([profileRecord], { onConflict: 'email' });
          if (!profileErr) {
            supabaseSuccess = true;
          } else {
            supabaseError = error.message;
          }
        } catch (pe) {
          supabaseError = error.message;
        }
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

export const DEFAULT_GUEST_USER = {
  firstName: 'Archer',
  lastName: '',
  fullName: 'Archer',
  isGuest: true,
};

export const clearAllLocalStorageCache = () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    }
  } catch (e) {
    console.error('Error clearing localStorage cache:', e);
  }
};

export const getUserData = async (emailTarget = null) => {
  let activeEmail = emailTarget || '';
  let localData = null;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const activeAuthRaw = window.localStorage.getItem('@active_auth_session');
      const regUserRaw = window.localStorage.getItem(USER_DATA_KEY);
      const userProfRaw = window.localStorage.getItem('user_profile');

      let parsedObj = null;
      if (activeAuthRaw) {
        try { parsedObj = JSON.parse(activeAuthRaw); } catch (e) {}
      }
      if (!parsedObj && regUserRaw) {
        try { parsedObj = JSON.parse(regUserRaw); } catch (e) {}
      }
      if (!parsedObj && userProfRaw) {
        try { parsedObj = JSON.parse(userProfRaw); } catch (e) {}
      }

      if (parsedObj) {
        localData = parsedObj;
        if (!activeEmail) {
          activeEmail = parsedObj.email || '';
        }
      }

      if (!activeEmail && typeof window.location !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        activeEmail = urlParams.get('email') || '';
      }
    }
  } catch (error) {
    console.error('Error reading local user data:', error);
  }

  // 1. Primary: Fetch registered user profile from Supabase DB ('users' / 'user_profiles' table) by email
  if (isSupabaseConfigured && activeEmail) {
    try {
      let { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', activeEmail.toLowerCase().trim());

      if ((error || !data || data.length === 0)) {
        const res = await supabase
          .from('user_profiles')
          .select('*')
          .eq('email', activeEmail.toLowerCase().trim());
        data = res.data;
        error = res.error;
      }

      if (!error && data && data.length > 0) {
        const row = data[0];
        const userObj = {
          id: row.id,
          firstName: row.first_name || (row.full_name ? row.full_name.split(' ')[0] : 'Archer'),
          lastName: row.last_name || (row.full_name ? row.full_name.split(' ').slice(1).join(' ') : ''),
          fullName: row.full_name || `${row.first_name || 'Archer'} ${row.last_name || ''}`.trim(),
          age: row.age ? String(row.age) : '',
          gender: row.gender || '',
          profession: row.profession || '',
          phone: row.phone || '',
          email: row.email || activeEmail,
          password: row.password || row.password_hash || '',
          phoneVerified: Boolean(row.phone_verified),
          emailVerified: Boolean(row.email_verified),
          registeredAt: row.registered_at || row.created_at || row.updated_at,
          isGuest: false,
        };
        // Keep local storage in sync with Supabase DB
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(USER_DATA_KEY, JSON.stringify(userObj));
          }
        } catch (e) {}
        return userObj;
      }
    } catch (e) {
      console.warn('Supabase DB fetch error in getUserData:', e);
    }
  }

  // 2. Secondary: If local user session is explicitly authenticated with email, return local session
  if (localData && localData.email && localData.isGuest === false) {
    return { ...localData, isGuest: false };
  }

  // 3. Fallback: If localData exists with email, treat as authenticated user
  if (localData && localData.email) {
    return { ...localData, isGuest: false };
  }

  // 4. Arriving user default: Guest mode with name Archer
  return DEFAULT_GUEST_USER;
};

export const clearUserData = async () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
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

  // 2. Update Supabase DB (users table)
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('users')
        .update({ password_hash: newPassword, updated_at: new Date().toISOString() })
        .eq('email', email.toLowerCase().trim());

      if (!error) {
        supabaseSuccess = true;
      }
    } catch (err) {
      console.error('Supabase password reset error:', err);
    }
  }

  return { success: localSuccess || supabaseSuccess };
};

const CHAT_SESSIONS_KEY = '@spiritual_chat_sessions';

const fetchUserIdForEmail = async (email, userData = null) => {
  if (!isSupabaseConfigured || !email) return null;
  const cleanEmail = email.toLowerCase().trim();
  try {
    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('email', cleanEmail)
      .limit(1);
    if (data && data.length > 0 && data[0].id) {
      return data[0].id;
    }

    // Upsert new user row in Supabase DB users table
    const newId = generateUUID();
    const { data: created } = await supabase
      .from('users')
      .upsert([{
        id: newId,
        email: cleanEmail,
        first_name: userData?.firstName || 'Archer',
        last_name: userData?.lastName || '',
      }], { onConflict: 'email' })
      .select('id');

    if (created && created.length > 0) {
      return created[0].id;
    }
    return newId;
  } catch (e) {
    console.error('fetchUserIdForEmail error:', e);
  }
  return null;
};

export const generateUUID = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const isValidUUID = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

export const saveChatSession = async (session, chatType = 'spiritual') => {
  if (!session) return;
  const validSessionId = isValidUUID(session.id) ? session.id : generateUUID();
  try {
    const userData = await getUserData();
    const activeEmail = userData?.email || '';
    if (!activeEmail) return;

    let userId = userData.id;
    if (!userId || !isValidUUID(userId)) {
      userId = await fetchUserIdForEmail(activeEmail, userData);
    }
    if (!userId) return;

    const titleText = session.title || (session.messages && session.messages.find(m => m.sender === 'user' || m.role === 'user')?.text) || (chatType === 'twin' ? 'Digital Twin Chat' : 'Spiritual Chat');

    if (isSupabaseConfigured) {
      await supabase.from('chat_sessions').upsert([{
        id: validSessionId,
        user_id: userId,
        title: (titleText || 'New Chat').substring(0, 100),
        status: 'active',
        session_type: chatType,
        updated_at: new Date().toISOString(),
      }], { onConflict: 'id' });

      if (Array.isArray(session.messages) && session.messages.length > 0) {
        const msgPayload = session.messages.map((msg) => ({
          id: isValidUUID(msg.id) ? msg.id : generateUUID(),
          session_id: validSessionId,
          user_id: userId,
          role: (msg.sender === 'user' || msg.sender === 'human' || msg.role === 'user') ? 'user' : 'assistant',
          content: msg.text || msg.content || '',
          created_at: new Date().toISOString(),
        }));
        await supabase.from('chat_messages').upsert(msgPayload, { onConflict: 'id' });
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('chat-sessions-changed', { detail: { chatType } }));
    }
  } catch (err) {
    console.error('Error saving chat session:', err);
  }
};

export const getChatSessions = async (emailOverride = null, filterType = null) => {
  try {
    const userData = await getUserData(emailOverride);
    const activeEmail = userData?.email || '';
    if (!activeEmail) return [];

    let userId = userData.id;
    if (!userId || !isValidUUID(userId)) {
      userId = await fetchUserIdForEmail(activeEmail, userData);
    }
    if (!userId) return [];

    if (isSupabaseConfigured) {
      let query = supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (filterType) {
        query = query.eq('session_type', filterType);
      }

      const { data, error } = await query;

      if (!error && Array.isArray(data)) {
        return data.map((row) => ({
          id: row.id,
          chatType: row.session_type || row.status || 'spiritual',
          title: row.title || 'Chat Session',
          time: new Date(row.created_at || row.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          createdAt: row.created_at || row.updated_at,
        }));
      }
    }
  } catch (e) {
    console.warn('getChatSessions Supabase notice:', e);
  }

  return [];
};

export const getChatMessagesForSession = async (sessionId) => {
  if (!sessionId) return [];
  
  // 1. Try local storage first
  try {
    const sessions = await getChatSessions();
    const target = sessions.find((s) => s.id === sessionId);
    if (target && target.messages && target.messages.length > 0) {
      return target.messages;
    }
  } catch (e) {}

  // 2. Fetch from Supabase chat_messages table
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((row) => ({
          id: row.id,
          sender: row.role === 'assistant' ? 'ai' : 'user',
          text: row.content,
        }));
      }
    } catch (e) {
      console.warn('getChatMessagesForSession Supabase notice:', e);
    }
  }

  return [];
};
