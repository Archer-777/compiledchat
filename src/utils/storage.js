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
      window.localStorage.removeItem(USER_DATA_KEY);
      window.localStorage.removeItem('@active_auth_session');
      window.localStorage.removeItem('@spiritual_chat_sessions');
      window.localStorage.removeItem('@spiritual_chat_history');
    }
  } catch (e) {}
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

const fetchUserIdForEmail = async (email) => {
  if (!isSupabaseConfigured || !email) return null;
  try {
    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .limit(1);
    if (data && data.length > 0) {
      return data[0].id;
    }
  } catch (e) {}
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
    let sessions = await getChatSessions(null, null);
    const index = sessions.findIndex((s) => s.id === validSessionId || s.id === session.id);
    const userData = await getUserData();
    const activeEmail = userData?.email || '';
    const updatedSession = {
      id: validSessionId,
      chatType: chatType,
      userEmail: activeEmail,
      title: session.title || (session.messages && session.messages.find(m => m.sender === 'user')?.text) || (chatType === 'twin' ? 'Digital Twin Chat' : 'Spiritual Chat'),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      messages: session.messages || [],
      updatedAt: new Date().toISOString()
    };

    if (index >= 0) {
      sessions[index] = { ...sessions[index], ...updatedSession };
    } else {
      sessions.unshift(updatedSession);
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(sessions.slice(0, 50)));
      window.dispatchEvent(new CustomEvent('chat-sessions-changed', { detail: { chatType } }));
    }

    // Sync to Supabase DB if user is logged in
    if (isSupabaseConfigured && userData && userData.email) {
      let userId = userData.id;
      if (!userId) {
        userId = await fetchUserIdForEmail(userData.email);
      }
      if (userId && isValidUUID(userId)) {
        try {
          await supabase.from('chat_sessions').upsert([{
            id: validSessionId,
            user_id: userId,
            title: updatedSession.title,
            status: chatType,
            updated_at: new Date().toISOString(),
          }], { onConflict: 'id' });

          // Save messages to chat_messages table
          if (Array.isArray(session.messages)) {
            for (const msg of session.messages) {
              const msgId = isValidUUID(msg.id) ? msg.id : generateUUID();
              await supabase.from('chat_messages').upsert([{
                id: msgId,
                session_id: validSessionId,
                user_id: userId,
                role: (msg.sender === 'user' || msg.sender === 'human') ? 'user' : 'assistant',
                content: msg.text,
                created_at: new Date().toISOString()
              }], { onConflict: 'id' });
            }
          }
        } catch (e) {
          console.warn('Supabase chat session save notice:', e);
        }
      }
    }
  } catch (err) {
    console.error('Error saving chat session:', err);
  }
};

export const getChatSessions = async (emailOverride = null, filterType = null) => {
  let sessions = [];
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(CHAT_SESSIONS_KEY);
      if (raw) {
        sessions = JSON.parse(raw) || [];
      }
    }
  } catch (e) {
    console.error('Error reading chat sessions:', e);
  }

  // Query Supabase DB if logged in
  try {
    const userData = await getUserData(emailOverride);
    const activeEmail = userData?.email || '';

    if (activeEmail) {
      sessions = sessions.filter(s => s.userEmail === activeEmail);
    } else {
      sessions = sessions.filter(s => !s.userEmail);
    }

    if (isSupabaseConfigured && activeEmail) {
      let userId = userData.id;
      if (!userId) {
        userId = await fetchUserIdForEmail(activeEmail);
      }

      if (userId) {
        const { data, error } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const dbSessions = data.map((row) => ({
            id: row.id,
            chatType: row.status === 'twin' ? 'twin' : (row.title?.includes('Twin') ? 'twin' : 'spiritual'),
            title: row.title || 'Chat Session',
            time: new Date(row.created_at || row.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            createdAt: row.created_at || row.updated_at,
          }));

          const merged = [...dbSessions];
          sessions.forEach((s) => {
            if (!merged.some((m) => m.id === s.id)) {
              merged.push(s);
            }
          });
          sessions = merged;
        }
      }
    }
  } catch (e) {
    console.warn('getChatSessions Supabase notice:', e);
  }

  if (filterType) {
    return sessions.filter(s => {
      const sType = s.chatType || s.session_type || (s.title?.toLowerCase().includes('twin') ? 'twin' : 'spiritual');
      if (filterType === 'spiritual') {
        return sType !== 'twin';
      }
      return sType === filterType;
    });
  }

  return sessions;
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
