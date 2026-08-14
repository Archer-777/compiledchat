import { getBackendUrl } from '../config/urls';

const SUPABASE_URL = 'https://qwmnyomlfchazapkohfy.supabase.co';
const SUPABASE_ANON_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY)
  ? import.meta.env.VITE_SUPABASE_ANON_KEY
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3bW55b21sZmNoYXphcGtvaGZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1NTE4MzQsImV4cCI6MjEwMTEyNzgzNH0.dfL1HAxw3WFRCwW7eYI7wF2pW5QEf7-LEqkbIzFKxCE';

const BACKEND_URL = getBackendUrl();

const USER_DATA_KEY = '@spiritual_register_user';
const ACTIVE_AUTH_KEY = '@active_auth_session';

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

      if (!activeEmail && typeof window.location !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        activeEmail = urlParams.get('email') || '';
      }
    }
  } catch (error) {
    console.error('Error reading local user data:', error);
  }

  if (activeEmail) {
    try {
      const cleanEmail = activeEmail.toLowerCase().trim();
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
      console.warn('Backend sync-user check in getUserData notice:', e);
    }

    if (localData && localData.email) {
      return { ...localData, isGuest: false };
    }
    return {
      id: localData?.id || generateUUID(),
      firstName: localData?.firstName || 'Archer',
      lastName: localData?.lastName || '',
      fullName: localData?.fullName || 'Archer',
      email: activeEmail,
      isGuest: false,
    };
  }

  if (localData && localData.email) {
    return { ...localData, isGuest: false };
  }

  return {
    firstName: 'Archer',
    lastName: '',
    fullName: 'Archer',
    isGuest: true,
  };
};

/**
 * Helper to get or create a valid user_id UUID from Supabase users table
 */
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

    // 1. Local Cache Backup for seamless refresh recovery
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(`@chat_session_msgs_${validSessionId}`, JSON.stringify(session.messages || []));

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
      console.warn('Local chat cache notice in chatscreen:', cacheErr);
    }

    // 2. Upsert session and messages via Backend Proxy
    try {
      await fetch(`${BACKEND_URL}/api/v1/chat/sync-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionPayload,
          msgPayload,
          email: userEmail,
        })
      });
    } catch (proxyErr) {
      console.warn('Backend sync-session notice in chatscreen:', proxyErr);
    }

    // 3. Dispatch event so RECENT CHATS sidebar reloads immediately
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('chat-sessions-changed', { detail: { chatType, sessionId: validSessionId } }));
    }
  } catch (err) {
    console.error('Error saving chat session in chatscreen:', err);
  }
};

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

    // 2. Fetch from Backend
    let endpoint = `${BACKEND_URL}/api/v1/chat/sessions?user_id=${encodeURIComponent(userId || '')}&email=${encodeURIComponent(userEmail || '')}&session_type=${encodeURIComponent(filterType || '')}`;
    const res = await fetch(endpoint);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const remoteList = data.map((row) => ({
          id: row.id,
          chatType: row.session_type || row.status || 'spiritual',
          title: row.title || 'Chat Session',
          time: new Date(row.created_at || row.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          createdAt: row.created_at || row.updated_at,
        }));

        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(cacheKey, JSON.stringify(remoteList.slice(0, 50)));
          }
        } catch (e) {}

        return remoteList;
      }
    }
  } catch (e) {
    console.warn('getChatSessions error in chatscreen:', e);
  }

  return cachedList;
};

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
          sender: row.role === 'assistant' ? 'ai' : 'user',
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
    console.warn('getChatMessagesForSession notice in chatscreen:', e);
  }

  return [];
};
