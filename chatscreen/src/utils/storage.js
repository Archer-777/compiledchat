const SUPABASE_URL = 'https://qwmnyomlfchazapkohfy.supabase.co';
const SUPABASE_ANON_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY)
  ? import.meta.env.VITE_SUPABASE_ANON_KEY
  : 'sb_publishable_C0TgaPZQ0Y88i1oJkx9HTA_VqtDnJUv';

const BACKEND_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BACKEND_URL)
  ? import.meta.env.VITE_BACKEND_URL
  : 'https://compiledchat-production.up.railway.app';

const CHAT_SESSIONS_KEY = '@spiritual_chat_sessions';
const USER_DATA_KEY = '@spiritual_register_user';

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

  if (activeEmail) {
    try {
      const cleanEmail = activeEmail.toLowerCase().trim();
      let endpoint = `${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(cleanEmail)}&select=*`;
      let res = await fetch(endpoint, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });
      let data = res.ok ? await res.json() : [];
      if (!data || data.length === 0) {
        endpoint = `${SUPABASE_URL}/rest/v1/user_profiles?email=eq.${encodeURIComponent(cleanEmail)}&select=*`;
        res = await fetch(endpoint, {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
        });
        data = res.ok ? await res.json() : [];
      }
      if (data && data.length > 0) {
        const row = data[0];
        const userObj = {
          id: row.id || localData?.id,
          firstName: row.first_name || (row.full_name ? row.full_name.split(' ')[0] : 'Archer'),
          lastName: row.last_name || (row.full_name ? row.full_name.split(' ').slice(1).join(' ') : ''),
          fullName: row.full_name || `${row.first_name || 'Archer'} ${row.last_name || ''}`.trim(),
          email: row.email || activeEmail,
          isGuest: false,
        };
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(USER_DATA_KEY, JSON.stringify(userObj));
            window.localStorage.setItem('@active_auth_session', JSON.stringify(userObj));
          }
        } catch (e) {}
        return userObj;
      }
    } catch (e) {
      console.warn('Supabase DB fetch error in getUserData:', e);
    }
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
    return generateUUID();
  } catch (err) {
    console.error('getOrCreateUserId error:', err);
  }
  return null;
};

export const saveChatSession = async (session, chatType = 'spiritual') => {
  if (!session) return;
  const validSessionId = isValidUUID(session.id) ? session.id : generateUUID();

  try {
    const userData = await getUserData();
    const userId = await getOrCreateUserId(userData);

    if (!userId) {
      console.warn('saveChatSession: No valid user_id found');
      return;
    }

    const titleText = session.title || (session.messages && session.messages.find(m => m.sender === 'user' || m.role === 'user')?.text) || (chatType === 'twin' ? 'Digital Twin Chat' : 'Spiritual Chat');

    const sessionPayload = {
      id: validSessionId,
      user_id: userId,
      title: (titleText || 'New Chat').substring(0, 100),
      status: 'active',
      session_type: chatType,
      updated_at: new Date().toISOString(),
    };

    // Upsert session and messages via Backend Proxy
    const proxyRes = await fetch(`${BACKEND_URL}/api/v1/chat/sync-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionPayload,
        msgPayload: (Array.isArray(session.messages) && session.messages.length > 0) ? session.messages.map((msg) => ({
          id: isValidUUID(msg.id) ? msg.id : generateUUID(),
          session_id: validSessionId,
          user_id: userId,
          role: (msg.sender === 'user' || msg.sender === 'human' || msg.role === 'user') ? 'user' : 'assistant',
          content: msg.text || msg.content || '',
          created_at: new Date().toISOString(),
        })) : []
      })
    });

    if (!proxyRes.ok) {
      console.error('Backend proxy sync-session error:', await proxyRes.text());
    }

    // Dispatch event so RECENT CHATS sidebar reloads immediately from Supabase DB!
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('chat-sessions-changed', { detail: { chatType } }));
    }
  } catch (err) {
    console.error('Error saving chat session to Supabase DB:', err);
  }
};

export const getChatSessions = async (emailOverride = null, filterType = null) => {
  try {
    const userData = await getUserData(emailOverride);
    const userId = await getOrCreateUserId(userData);

    if (!userId) {
      return [];
    }

    let endpoint = `${BACKEND_URL}/api/v1/chat/sessions?user_id=${encodeURIComponent(userId)}`;

    const res = await fetch(endpoint);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        let list = data.map((row) => ({
          id: row.id,
          chatType: row.session_type || row.status || 'spiritual',
          title: row.title || 'Chat Session',
          time: new Date(row.created_at || row.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          createdAt: row.created_at || row.updated_at,
        }));

        if (filterType) {
          list = list.filter((item) => {
            if (filterType === 'spiritual') {
              return item.chatType !== 'twin';
            }
            return item.chatType === filterType;
          });
        }
        return list;
      }
    }
  } catch (e) {
    console.error('getChatSessions Supabase DB error:', e);
  }

  return [];
};

export const getChatMessagesForSession = async (sessionId) => {
  if (!sessionId) return [];

  try {
    const endpoint = `${BACKEND_URL}/api/v1/chat/sessions/${encodeURIComponent(sessionId)}/messages-proxy`;
    const res = await fetch(endpoint);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((row) => ({
          id: row.id,
          sender: row.role === 'assistant' ? 'ai' : 'user',
          text: row.content,
        }));
      }
    }
  } catch (e) {
    console.warn('getChatMessagesForSession Supabase DB notice:', e);
  }

  return [];
};
