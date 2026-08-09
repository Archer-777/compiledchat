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

export const saveChatSession = async (session, chatType = 'spiritual') => {
  if (!session) return;
  const validSessionId = isValidUUID(session.id) ? session.id : generateUUID();
  try {
    let sessions = await getChatSessions(null, null);
    const index = sessions.findIndex((s) => s.id === validSessionId || s.id === session.id);
    const updatedSession = {
      id: validSessionId,
      chatType: chatType,
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

    const userData = await getUserData();
    if (userData && userData.email) {
      try {
        const userId = userData.id && isValidUUID(userData.id) ? userData.id : null;
        const sessionPayload = {
          id: validSessionId,
          title: updatedSession.title,
          status: chatType,
          session_type: chatType,
          updated_at: new Date().toISOString(),
        };
        if (userId) {
          sessionPayload.user_id = userId;
        }

        // Upsert session
        await fetch(`${SUPABASE_URL}/rest/v1/chat_sessions`, {
          method: 'POST',
          headers: {
            'apikey': SERVICE_KEY,
            'Authorization': `Bearer ${SERVICE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify([sessionPayload])
        });

        // Upsert messages
        if (Array.isArray(session.messages)) {
          const msgPayload = session.messages.map(msg => {
            const m = {
              id: isValidUUID(msg.id) ? msg.id : generateUUID(),
              session_id: validSessionId,
              role: (msg.sender === 'user' || msg.sender === 'human') ? 'user' : 'assistant',
              content: msg.text,
              created_at: new Date().toISOString()
            };
            if (userId) m.user_id = userId;
            return m;
          });
          
          await fetch(`${SUPABASE_URL}/rest/v1/chat_messages`, {
            method: 'POST',
            headers: {
              'apikey': SERVICE_KEY,
              'Authorization': `Bearer ${SERVICE_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify(msgPayload)
          });
        }
      } catch (e) {
        console.warn('Supabase chat session save notice:', e);
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
    console.error('Error reading local chat sessions:', e);
  }

  try {
    const userData = await getUserData(emailOverride);
    if (userData && userData.email && userData.id) {
      const targetUserId = userData.id;
      const endpoint = `${SUPABASE_URL}/rest/v1/chat_sessions?user_id=eq.${encodeURIComponent(targetUserId)}&order=created_at.desc`;
      const res = await fetch(endpoint, {
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const dbSessions = data.map((row) => ({
            id: row.id,
            chatType: row.status === 'twin' || row.session_type === 'twin' ? 'twin' : (row.title?.toLowerCase().includes('twin') ? 'twin' : 'spiritual'),
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

  try {
    const sessions = await getChatSessions();
    const target = sessions.find((s) => s.id === sessionId);
    if (target && target.messages && target.messages.length > 0) {
      return target.messages;
    }
  } catch (e) {}

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
      if (data && data.length > 0) {
        return data.map((row) => ({
          id: row.id,
          sender: row.role === 'assistant' ? 'ai' : 'user',
          text: row.content,
        }));
      }
    }
  } catch (e) {
    console.warn('getChatMessagesForSession Supabase notice:', e);
  }

  return [];
};
