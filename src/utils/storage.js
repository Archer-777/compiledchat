import { supabase, isSupabaseConfigured } from '../services/supabaseClient.js';
import { getBackendUrl } from '../config/urls.js';

const USER_DATA_KEY = '@spiritual_register_user';
const ACTIVE_AUTH_KEY = '@active_auth_session';
const BACKEND_URL = getBackendUrl();

export const DEFAULT_GUEST_USER = {
  firstName: 'Archer',
  lastName: '',
  fullName: 'Archer',
  isGuest: true,
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

export const saveUserData = async (data) => {
  const registeredAt = new Date().toISOString();
  const payload = {
    ...data,
    fullName: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
    registeredAt,
    isGuest: false,
  };

  let localSuccess = false;
  let supabaseSuccess = false;
  let supabaseError = null;

  // 1. Cache user object locally under both keys for seamless persistence
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(USER_DATA_KEY, JSON.stringify(payload));
      window.localStorage.setItem(ACTIVE_AUTH_KEY, JSON.stringify(payload));
      window.localStorage.setItem('user_profile', JSON.stringify(payload));
    }
    localSuccess = true;
  } catch (error) {
    console.error('Error saving local user data:', error);
  }

  // 2. Sync with Supabase via backend proxy
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/chat/sync-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: payload.id || generateUUID(),
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
      })
    });
    if (res.ok) {
      const dbUserArr = await res.json();
      if (Array.isArray(dbUserArr) && dbUserArr.length > 0 && dbUserArr[0].id) {
        payload.id = dbUserArr[0].id;
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(USER_DATA_KEY, JSON.stringify(payload));
          window.localStorage.setItem(ACTIVE_AUTH_KEY, JSON.stringify(payload));
        }
      }
      supabaseSuccess = true;
    }
  } catch (err) {
    console.warn('Backend sync-user notice during saveUserData:', err);
  }

  // 3. Direct Supabase fallback
  if (!supabaseSuccess && isSupabaseConfigured && payload.email) {
    try {
      const userRecord = {
        first_name: data.firstName || '',
        last_name: data.lastName || '',
        age: parseInt(data.age, 10) || null,
        gender: data.gender || '',
        profession: data.profession || '',
        phone: data.phone || '',
        email: data.email || '',
        phone_verified: Boolean(data.phoneVerified),
        email_verified: Boolean(data.emailVerified),
        updated_at: registeredAt,
      };

      const { error } = await supabase
        .from('users')
        .upsert([userRecord], { onConflict: 'email' });

      if (!error) {
        supabaseSuccess = true;
      }
    } catch (err) {
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
      const activeAuthRaw = window.localStorage.getItem(ACTIVE_AUTH_KEY);
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

      if (!activeEmail && typeof window !== 'undefined' && window.location) {
        const urlParams = new URLSearchParams(window.location.search);
        activeEmail = urlParams.get('email') || '';
      }
    }
  } catch (error) {
    console.error('Error reading local user data:', error);
  }

  // 1. If an active email is found, verify/refresh from backend & Supabase DB
  if (activeEmail) {
    const cleanEmail = activeEmail.toLowerCase().trim();
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/chat/sync-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          firstName: localData?.firstName || 'Archer',
          lastName: localData?.lastName || '',
        })
      });

      if (res.ok) {
        const dbArr = await res.json();
        if (Array.isArray(dbArr) && dbArr.length > 0) {
          const row = dbArr[0];
          const userObj = {
            id: row.id || localData?.id || generateUUID(),
            firstName: row.first_name || localData?.firstName || 'Archer',
            lastName: row.last_name || localData?.lastName || '',
            fullName: `${row.first_name || localData?.firstName || 'Archer'} ${row.last_name || localData?.lastName || ''}`.trim(),
            email: row.email || cleanEmail,
            isGuest: false,
          };

          try {
            if (typeof window !== 'undefined' && window.localStorage) {
              window.localStorage.setItem(USER_DATA_KEY, JSON.stringify(userObj));
              window.localStorage.setItem(ACTIVE_AUTH_KEY, JSON.stringify(userObj));
            }
          } catch (e) {}

          return userObj;
        }
      }
    } catch (e) {
      console.warn('Backend sync-user check notice:', e);
    }

    // Direct fallback if backend check is offline
    if (localData && localData.email) {
      return { ...localData, isGuest: false };
    }
    return {
      id: localData?.id || generateUUID(),
      firstName: localData?.firstName || 'Archer',
      lastName: localData?.lastName || '',
      fullName: localData?.fullName || 'Archer',
      email: cleanEmail,
      isGuest: false,
    };
  }

  // 2. If existing localData has a valid name/login and not explicitly guest
  if (localData && localData.email) {
    return { ...localData, isGuest: false };
  }

  if (localData && localData.firstName && localData.firstName !== 'Archer' && localData.isGuest !== true) {
    return { ...localData, isGuest: false };
  }

  // 3. Arriving user default (Guest Mode)
  return DEFAULT_GUEST_USER;
};

export const clearUserData = async () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(USER_DATA_KEY);
      window.localStorage.removeItem(ACTIVE_AUTH_KEY);
      window.localStorage.removeItem('user_profile');
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
        window.localStorage.setItem(ACTIVE_AUTH_KEY, JSON.stringify(updated));
      }
      localSuccess = true;
    }
  } catch (e) {
    console.error('Error updating local password:', e);
  }

  // 2. Update Supabase DB (users table)
  if (isSupabaseConfigured && email) {
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

export const getOrCreateUserId = async (userData) => {
  if (userData && userData.id && isValidUUID(userData.id)) {
    return userData.id;
  }

  const email = userData?.email ? userData.email.toLowerCase().trim() : '';
  if (!email) {
    return null;
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/chat/sync-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: generateUUID(),
        email: email,
        firstName: userData?.firstName || 'Archer',
        lastName: userData?.lastName || ''
      })
    });
    
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0 && data[0].id) {
        return data[0].id;
      }
    }
  } catch (err) {
    console.error('getOrCreateUserId error:', err);
  }
  return generateUUID();
};

/**
 * Save Chat Session & Messages
 * - Separates chatType ('twin' vs 'spiritual' / 'sai')
 * - Links with authenticated user account
 * - Caches in localStorage for instant offline/refresh recovery
 * - Syncs to Supabase DB via backend proxy
 */
export const saveChatSession = async (session, chatType = 'spiritual') => {
  if (!session) return;
  const validSessionId = isValidUUID(session.id) ? session.id : generateUUID();

  try {
    const userData = await getUserData();
    const userId = await getOrCreateUserId(userData);
    const userEmail = userData?.email || '';

    const titleText = session.title || (session.messages && session.messages.find(m => m.sender === 'user' || m.role === 'user')?.text) || (chatType === 'twin' ? 'Digital Twin Chat' : 'Spiritual Chat');

    const sessionPayload = {
      id: validSessionId,
      user_id: userId || generateUUID(),
      title: (titleText || 'New Chat').substring(0, 100),
      status: 'active',
      session_type: chatType,
      updated_at: new Date().toISOString(),
    };

    const msgPayload = (Array.isArray(session.messages) && session.messages.length > 0)
      ? session.messages.map((msg) => ({
          id: isValidUUID(msg.id) ? msg.id : generateUUID(),
          session_id: validSessionId,
          user_id: userId || sessionPayload.user_id,
          role: (msg.sender === 'user' || msg.sender === 'human' || msg.role === 'user') ? 'user' : 'assistant',
          content: typeof msg.text === 'string' ? msg.text : (msg.content || JSON.stringify(msg)),
          created_at: new Date().toISOString(),
        }))
      : [];

    // 1. Local Cache Backup (Keyed by chatType and user) for instant refresh retention
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        // Save full messages payload for this session ID
        window.localStorage.setItem(`@chat_session_msgs_${validSessionId}`, JSON.stringify(session.messages || []));

        // Update list of sessions in cache
        const cacheKey = `@chat_sessions_${chatType}_${userEmail ? userEmail.toLowerCase().trim() : 'guest'}`;
        const rawExisting = window.localStorage.getItem(cacheKey);
        let list = rawExisting ? JSON.parse(rawExisting) : [];
        const existingIdx = list.findIndex(s => s.id === validSessionId);
        const itemObj = {
          id: validSessionId,
          chatType: chatType,
          title: sessionPayload.title,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          createdAt: sessionPayload.updated_at,
          messages: session.messages,
        };
        if (existingIdx >= 0) {
          list[existingIdx] = itemObj;
        } else {
          list.unshift(itemObj);
        }
        window.localStorage.setItem(cacheKey, JSON.stringify(list.slice(0, 50)));
      }
    } catch (cacheErr) {
      console.warn('Local chat cache notice:', cacheErr);
    }

    // 2. Persist to Supabase DB via Backend Proxy
    try {
      await fetch(`${BACKEND_URL}/api/v1/chat/sync-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionPayload,
          msgPayload,
          email: userEmail
        })
      });
    } catch (proxyErr) {
      console.warn('Backend sync-session notice:', proxyErr);
    }

    // 3. Dispatch cross-component event so sidebar reloads
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('chat-sessions-changed', { detail: { chatType, sessionId: validSessionId } }));
    }
  } catch (err) {
    console.error('Error saving chat session:', err);
  }
};

/**
 * Get Chat Sessions
 * - Separates 'twin' from 'spiritual'/'sai'
 * - Filters by logged-in user account
 * - Returns cached immediately and updates from DB
 */
export const getChatSessions = async (emailOverride = null, filterType = null) => {
  let cachedList = [];
  try {
    const userData = await getUserData(emailOverride);
    const userEmail = userData?.email ? userData.email.toLowerCase().trim() : (emailOverride ? emailOverride.toLowerCase().trim() : 'guest');
    const userId = userData?.id;

    const cacheKey = `@chat_sessions_${filterType || 'all'}_${userEmail}`;

    // 1. Read Local Cache
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(cacheKey);
      if (raw) {
        try {
          cachedList = JSON.parse(raw);
        } catch (e) {}
      }
    }

    // 2. Fetch from Backend / Supabase DB
    const endpoint = `${BACKEND_URL}/api/v1/chat/sessions?user_id=${encodeURIComponent(userId || '')}&email=${encodeURIComponent(userEmail || '')}&session_type=${encodeURIComponent(filterType || '')}`;
    const res = await fetch(endpoint);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const mergedList = data.map((row) => {
          const cachedMatch = cachedList.find(c => c.id === row.id);
          return {
            id: row.id,
            chatType: row.session_type || row.status || 'spiritual',
            title: row.title || 'Chat Session',
            time: new Date(row.created_at || row.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            createdAt: row.created_at || row.updated_at,
            messages: cachedMatch?.messages || null,
          };
        });

        // Update local cache without wiping messages
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(cacheKey, JSON.stringify(mergedList.slice(0, 50)));
          }
        } catch (e) {}

        return mergedList;
      }
    }
  } catch (e) {
    console.warn('getChatSessions notice:', e);
  }

  return cachedList;
};

/**
 * Get Chat Messages for a Session
 * - Recovers from local cache first for instant UX
 * - Syncs from Supabase DB via backend proxy
 */
export const getChatMessagesForSession = async (sessionId) => {
  if (!sessionId) return [];

  // 1. Check Local Cache first
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const cached = window.localStorage.getItem(`@chat_session_msgs_${sessionId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    }
  } catch (e) {}

  // 2. Fetch from Backend Proxy
  try {
    const endpoint = `${BACKEND_URL}/api/v1/chat/sessions/${encodeURIComponent(sessionId)}/messages-proxy`;
    const res = await fetch(endpoint);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const msgs = data.map((row) => ({
          id: row.id,
          sender: (row.role === 'assistant' || row.role === 'twin') ? 'twin' : 'user',
          text: row.content,
        }));

        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(`@chat_session_msgs_${sessionId}`, JSON.stringify(msgs));
          }
        } catch (e) {}

        return msgs;
      }
    }
  } catch (e) {
    console.warn('getChatMessagesForSession notice:', e);
  }

  return [];
};
