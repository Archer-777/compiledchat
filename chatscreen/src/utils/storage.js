const SUPABASE_URL = 'https://qwmnyomlfchazapkohfy.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3bW55b21sZmNoYXphcGtvaGZ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTU1MTgzNCwiZXhwIjoyMTAxMTI3ODM0fQ.n-t9bJZ3juSlIK2OrJRrsSRQhZkbaLZFfNs_Zu8ELuY';

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
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
        },
      });
      let data = res.ok ? await res.json() : [];
      if (!data || data.length === 0) {
        endpoint = `${SUPABASE_URL}/rest/v1/user_profiles?email=eq.${encodeURIComponent(cleanEmail)}&select=*`;
        res = await fetch(endpoint, {
          headers: {
            'apikey': SERVICE_KEY,
            'Authorization': `Bearer ${SERVICE_KEY}`,
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
    // 1. Fetch user by email
    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(email)}&select=id`, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0 && data[0].id && isValidUUID(data[0].id)) {
        return data[0].id;
      }
    }

    // 2. If not found in users table, upsert user row
    const newId = generateUUID();
    const createRes = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation,resolution=merge-duplicates',
      },
      body: JSON.stringify([{
        id: newId,
        email: email,
        first_name: userData?.firstName || 'Archer',
        last_name: userData?.lastName || '',
      }]),
    });

    if (createRes.ok) {
      const created = await createRes.json();
      if (created && created.length > 0 && created[0].id) {
        return created[0].id;
      }
    }
    return newId;
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

    // 1. Upsert session into Supabase DB
    const sessRes = await fetch(`${SUPABASE_URL}/rest/v1/chat_sessions`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify([sessionPayload]),
    });

    if (!sessRes.ok) {
      console.error('Supabase chat_sessions save error:', await sessRes.text());
    }

    // 2. Upsert messages into Supabase DB
    if (Array.isArray(session.messages) && session.messages.length > 0) {
      const msgPayload = session.messages.map((msg) => ({
        id: isValidUUID(msg.id) ? msg.id : generateUUID(),
        session_id: validSessionId,
        user_id: userId,
        role: (msg.sender === 'user' || msg.sender === 'human' || msg.role === 'user') ? 'user' : 'assistant',
        content: msg.text || msg.content || '',
        created_at: new Date().toISOString(),
      }));

      const msgRes = await fetch(`${SUPABASE_URL}/rest/v1/chat_messages`, {
        method: 'POST',
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify(msgPayload),
      });

      if (!msgRes.ok) {
        console.error('Supabase chat_messages save error:', await msgRes.text());
      }
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

    let endpoint = `${SUPABASE_URL}/rest/v1/chat_sessions?user_id=eq.${encodeURIComponent(userId)}&order=created_at.desc`;

    const res = await fetch(endpoint, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
      },
    });

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
    const endpoint = `${SUPABASE_URL}/rest/v1/chat_messages?session_id=eq.${encodeURIComponent(sessionId)}&order=created_at.asc`;
    const res = await fetch(endpoint, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
      },
    });

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
