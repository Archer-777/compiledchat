import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ArrowLeft, Send, Mic, MicOff, Zap, Flame, Menu, X, PlusCircle, Cpu, User, Heart, Download, FileText } from 'lucide-react';
import { getChatSessions, saveChatSession, getChatMessagesForSession, generateUUID, getUserData } from '../utils/storage';
import './DigitalTwinChatScreen.css';

const TWIN_API_BASE = 'http://65.2.37.177:8000';

// Simple markdown-to-HTML converter for twin responses
function renderMarkdown(text) {
  if (!text) return '';
  let html = text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^# (.+)$/gm, '<h2>$1</h2>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/\n/g, '<br/>');
  html = html.replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>');
  return html;
}

// User avatar matching the orange sunflower eyes and smile
function UserAvatar() {
  return (
    <div className="user-avatar-circle" style={{ overflow: 'hidden', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img src="/user_icon.svg" alt="User Icon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  );
}

function ProfileIconSvg() {
  return (
    <div style={{ width: '34px', height: '34px', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img src="/user_icon.svg" alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  );
}

export default function DigitalTwinChatScreen() {
  const navigate = useNavigate();
  const [currentSessionId, setCurrentSessionId] = useState(() => generateUUID());
  const [recentSessions, setRecentSessions] = useState([]);
  const [userProfileName, setUserProfileName] = useState('Archer');
  const [twinAvatarPhoto, setTwinAvatarPhoto] = useState(null);
  const [isGuest, setIsGuest] = useState(true);
  const [inputText, setInputText] = useState('');
  const [twinName, setTwinName] = useState('Digital Twin');
  const [userAuthKey, setUserAuthKey] = useState('guest');
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState([
    { id: '1', sender: 'twin', text: "Hello! I'm your Digital Twin. Ask me anything — I can create files, write code, analyze data, and more." },
  ]);
  const [stars, setStars] = useState([]);
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const recognitionRef = useRef(null);
  const chatEndRef = useRef(null);

  const loadSessions = async () => {
    try {
      const sessions = await getChatSessions(null, 'twin');
      if (Array.isArray(sessions)) {
        setRecentSessions(sessions);
      }
    } catch (e) {}
  };

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem('@spiritual_digital_twin_profile');
        if (raw) {
          const p = JSON.parse(raw);
          if (p && p.avatarImage) setTwinAvatarPhoto(p.avatarImage);
        }
      }
      
      // Force Twin Name to First Name + 2.0
      getUserData().then(user => {
        if (user) {
          const firstName = user.firstName || user.first_name || (user.full_name ? user.full_name.split(' ')[0] : 'User');
          setTwinName(`${firstName} 2.0`);
          setUserAuthKey(user.id || user.email || 'guest');
        }
      }).catch(e => {});
    } catch (e) {}
  }, []);

  const isSmallScreen = windowWidth < 960;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Generate random twinkling stars across the entire screen
  useEffect(() => {
    const starList = Array.from({ length: 140 }, (_, i) => {
      const isBright = Math.random() > 0.75;
      const isCyan = Math.random() > 0.85;
      const sizeNum = isBright ? 1.5 + Math.random() * 1.5 : 0.8 + Math.random() * 1.2;
      return {
        id: i,
        left: `${(Math.random() * 100).toFixed(2)}%`,
        top: `${(Math.random() * 100).toFixed(2)}%`,
        size: `${sizeNum.toFixed(2)}px`,
        duration: `${(2 + Math.random() * 4.5).toFixed(2)}s`,
        delay: `${(Math.random() * 6).toFixed(2)}s`,
        isBright,
        isCyan,
      };
    });
    setStars(starList);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchLatestAccount = async () => {
      let targetEmail = '';
      let targetName = '';
      try {
        const urlParams = new URLSearchParams(window.location.search);
        targetEmail = urlParams.get('email') || '';
        targetName = urlParams.get('firstName') || urlParams.get('username') || urlParams.get('name') || '';
      } catch (e) {}

      try {
        const raw = window.localStorage.getItem('@active_auth_session') || window.localStorage.getItem('@spiritual_register_user');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (!targetEmail) targetEmail = parsed.email || '';
          if (!targetName) targetName = parsed.firstName || parsed.first_name || '';
        }
      } catch (e) {}

      if (targetEmail && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('@active_auth_session', JSON.stringify({
          email: targetEmail,
          firstName: targetName || 'User',
          isGuest: false
        }));
      }

      if (targetName && isMounted) {
        setUserProfileName(targetName.trim());
        setIsGuest(false);
      }

      if (targetEmail) {
        try {
          const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3bW55b21sZmNoYXphcGtvaGZ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTU1MTgzNCwiZXhwIjoyMTAxMTI3ODM0fQ.n-t9bJZ3juSlIK2OrJRrsSRQhZkbaLZFfNs_Zu8ELuY';
          const endpoint = `https://qwmnyomlfchazapkohfy.supabase.co/rest/v1/users?email=eq.${encodeURIComponent(targetEmail.toLowerCase().trim())}&select=first_name,full_name,email`;
          const res = await fetch(endpoint, {
            headers: {
              'apikey': serviceKey,
              'Authorization': `Bearer ${serviceKey}`,
            },
          });
          if (res.ok) {
            const data = await res.json();
            if (data && data.length > 0 && isMounted) {
              const dbName = data[0].first_name || (data[0].full_name ? data[0].full_name.split(' ')[0] : '');
              if (dbName) {
                setUserProfileName(dbName.trim());
                setIsGuest(false);
              }
            }
          }
        } catch (e) {}
        return;
      }

      if (isMounted) {
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.removeItem('@spiritual_register_user');
            window.localStorage.removeItem('@active_auth_session');
          }
        } catch (e) {}
        setUserProfileName('Archer');
        setIsGuest(true);
      }
    };

    fetchLatestAccount();
    loadSessions();

    if (typeof window !== 'undefined') {
      window.addEventListener('chat-sessions-changed', loadSessions);
      return () => {
        isMounted = false;
        window.removeEventListener('chat-sessions-changed', loadSessions);
      };
    }

    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (showMobileDrawer) {
      loadSessions();
    }
  }, [showMobileDrawer]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectSession = async (sessionItem) => {
    if (!sessionItem || !sessionItem.id) return;
    setCurrentSessionId(sessionItem.id);
    let msgs = sessionItem.messages;
    if (!msgs || msgs.length === 0) {
      msgs = await getChatMessagesForSession(sessionItem.id);
    }
    if (msgs && msgs.length > 0) {
      setMessages(msgs);
    }
  };

  const handleNewChatSession = () => {
    const newId = generateUUID();
    setCurrentSessionId(newId);
    setMessages([
      { id: '1', sender: 'twin', text: 'Hello! Welcome to your Digital Twin Workspace. How can I assist you today?' },
    ]);
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isThinking) return;

    const textToSend = inputText.trim();
    const newMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
    };

    const updatedUserMsgs = [...messages, newMsg];
    setMessages(updatedUserMsgs);
    setInputText('');
    setIsThinking(true);

    let aiText = 'Sorry, I could not process your request. Please try again.';
    let aiMsgId = (Date.now() + 1).toString();
    let aiFiles = [];

    try {
      // 1. Create a run
      const createRes = await fetch(`${TWIN_API_BASE}/runs`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userAuthKey}`
        },
        body: JSON.stringify({
          session_id: currentSessionId,
          message: textToSend,
        }),
      });

      if (createRes.ok || createRes.status === 202) {
        const createData = await createRes.json();
        const runId = createData.run_id;

        if (runId) {
          // 2. Poll for completion
          let completed = false;
          for (let i = 0; i < 60; i++) {
            await new Promise(r => setTimeout(r, 3000));
            try {
              const pollRes = await fetch(`${TWIN_API_BASE}/runs/${runId}`, {
                headers: {
                  'Authorization': `Bearer ${userAuthKey}`
                }
              });
              if (pollRes.ok) {
                const pollData = await pollRes.json();
                const status = pollData.status || '';
                if (status === 'completed' || status === 'success' || status === 'succeeded') {
                  aiText = pollData.text || pollData.result || pollData.output || pollData.response || pollData.message || pollData.answer || 'Task completed.';
                  if (typeof aiText === 'object') aiText = JSON.stringify(aiText, null, 2);
                  aiMsgId = pollData.id || runId;
                  // Capture only NEW files (filter out files already shown in previous messages)
                  if (pollData.files && Array.isArray(pollData.files) && pollData.files.length > 0) {
                    const previousFileNames = new Set();
                    updatedUserMsgs.forEach(m => {
                      if (m.files && Array.isArray(m.files)) {
                        m.files.forEach(f => {
                          const n = typeof f === 'string' ? f : (f.name || f.filename || '');
                          if (n) previousFileNames.add(n);
                        });
                      }
                    });
                    aiFiles = pollData.files.filter(f => {
                      const n = typeof f === 'string' ? f : (f.name || f.filename || '');
                      if (n.endsWith('.py')) return false;
                      return !previousFileNames.has(n);
                    });
                  }
                  completed = true;
                  break;
                } else if (status === 'failed' || status === 'error') {
                  aiText = pollData.error || pollData.message || 'The task encountered an error.';
                  completed = true;
                  break;
                }
                // else still running, continue polling
              }
            } catch (pollErr) {}
          }
          if (!completed) {
            aiText = 'The task is still running. It may complete in the background.';
          }
        }
      }
    } catch (err) {
      aiText = 'Could not connect to the Digital Twin backend. Please check your connection.';
    }

    setIsThinking(false);

    const finalMsgs = [
      ...updatedUserMsgs,
      { id: aiMsgId, sender: 'twin', text: aiText, files: aiFiles, sessionId: currentSessionId }
    ];
    setMessages(finalMsgs);

    saveChatSession({
      id: currentSessionId,
      title: updatedUserMsgs.find(m => m.sender === 'user')?.text || textToSend,
      messages: finalMsgs
    }, 'twin');
  };

  const handleMicPress = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice input is not supported in this browser.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputText(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setIsListening(false);
    }
  };

  const handleGoBack = () => {
    navigate('/digital-twin');
  };

  return (
    <div className="twin-chat-container">
      {/* Soft Twinkling Stars Background across complete screen */}
      <div className="stars-overlay">
        {stars.map((s) => (
          <div
            key={s.id}
            className={`star ${s.isBright ? 'star-bright' : ''} ${s.isCyan ? 'star-cyan' : ''}`}
            style={{
              left: s.left,
              top: s.top,
              width: s.size,
              height: s.size,
              animationDuration: s.duration,
              animationDelay: s.delay,
            }}
          />
        ))}
      </div>

      {/* --- DESKTOP SIDEBAR PANEL --- */}
      <aside className="twin-sidebar">
        <div className="sidebar-header">
          {/* Logo & Header Title */}
          <div className="sidebar-brand">
            <div className="sidebar-logo">
              <img src="/logo_in_white.svg" alt="Next Archer Logo" />
            </div>
            <div>
              <div className="sidebar-title">Next Archer</div>
              <div className="sidebar-subtitle">DESKTOP WORKSPACE</div>
            </div>
          </div>

          {/* New Chat Button */}
          <button className="new-chat-btn" onClick={handleNewChatSession}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            <span>New Chat</span>
          </button>

          {/* Recent Chats Section */}
          <div className="recents-section">
            <div className="recents-title">RECENT CHATS</div>
            <div className="recents-list">
              {recentSessions.length > 0 ? (
                recentSessions.map((item) => (
                  <div
                    key={item.id}
                    className="recent-chat-item"
                    onClick={() => handleSelectSession(item)}
                    style={{ cursor: 'pointer' }}
                  >
                    <MessageSquare size={16} style={{ color: 'rgba(255,255,255,0.6)' }} />
                    <div className="recent-chat-info">
                      <div className="recent-chat-name">{item.title}</div>
                      <div className="recent-chat-time">{item.time || 'Recent'}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '8px 0', fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
                  No past sessions saved.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Footer User Info */}
        {!isGuest && (
          <div className="sidebar-footer">
            <div className="user-avatar-placeholder">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className="user-meta">
              <div className="user-name">{userProfileName} User</div>
              <div className="user-tier">Pro Plan • Active</div>
            </div>
          </div>
        )}
      </aside>

      {/* --- RIGHT CHAT AREA CONTAINER --- */}
      <div className="twin-chat-main">
        {/* Floating Header */}
        <header className="twin-chat-header">
          {/* Left: Back Arrow / Hamburger & Greeting */}
          <div className="header-left">
            {isSmallScreen ? (
              <button className="back-btn" onClick={() => setShowMobileDrawer(true)}>
                <Menu size={20} />
              </button>
            ) : (
              <button className="back-btn" onClick={handleGoBack}>
                <ArrowLeft size={20} />
              </button>
            )}
            <div>
              <h1 className="header-greeting">
                Hey <span>{userProfileName}</span>
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                <p className="header-subtitle">Chatting with {twinName}</p>
              </div>
            </div>
          </div>

          {/* Right: Quick Actions */}
          <div className="header-right">
            <button className="header-icon-btn" title="User Profile" onClick={() => navigate('/soul-matrix')}>
              <ProfileIconSvg />
            </button>
          </div>
        </header>

        {/* Scrollable Messages Panel */}
        <main className="messages-scroll-area">
          {messages.map((msg) => {
            if (msg.type === 'badge') {
              return (
                <div key={msg.id} className="streak-badge-container">
                  <div className="streak-badge">
                    <Flame size={14} color="#f59e0b" fill="#f59e0b" style={{ marginRight: '5px' }} />
                    <span>{msg.text}</span>
                  </div>
                </div>
              );
            }

            const isTwin = msg.sender === 'twin';
            return (
              <div key={msg.id} className={`message-row ${isTwin ? 'row-left' : 'row-right'}`}>
                {/* Twin Avatar Logo - Custom User Gallery Photo or Sacred CPU Icon */}
                {isTwin && (
                  <div className="twin-avatar-circle" style={{ overflow: 'hidden', border: '1.5px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#050510' }}>
                    {twinAvatarPhoto ? (
                      <img src={twinAvatarPhoto} alt="Digital Twin Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Cpu size={16} color="#00ffcc" />
                    )}
                  </div>
                )}

                {/* Message Bubble Box */}
                <div className={`message-bubble ${isTwin ? 'bubble-twin' : 'bubble-user'}`}>
                  {isTwin ? (
                    <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }} />
                  ) : (
                    msg.text
                  )}
                  {/* File Download Cards */}
                  {isTwin && msg.files && msg.files.length > 0 && (
                    <div className="file-download-cards">
                      {msg.files.map((file, idx) => {
                        const fileName = typeof file === 'string' ? file : (file.name || file.filename || `file_${idx}`);
                        const fileSize = typeof file === 'object' ? file.size : null;
                        const downloadUrl = (typeof file === 'object' && file.download_url)
                          ? `${TWIN_API_BASE}${file.download_url}`
                          : `${TWIN_API_BASE}/sessions/${msg.sessionId || currentSessionId}/files/${encodeURIComponent(fileName)}`;
                        return (
                          <a
                            key={idx}
                            href={downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="file-download-card"
                            download
                          >
                            <FileText size={18} className="file-icon" />
                            <div className="file-info">
                              <span className="file-name">{fileName}</span>
                              {fileSize && <span className="file-size">{fileSize}</span>}
                            </div>
                            <Download size={16} className="download-icon" />
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* User Avatar - custom sunflower SVG */}
                {!isTwin && <UserAvatar />}
              </div>
            );
          })}
          {isThinking && (
            <div className="message-row row-left">
              <div className="twin-avatar-circle" style={{ overflow: 'hidden', border: '1.5px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#050510' }}>
                {twinAvatarPhoto ? (
                  <img src={twinAvatarPhoto} alt="Twin" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Cpu size={16} color="#00ffcc" />
                )}
              </div>
              <div className="message-bubble bubble-twin" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="thinking-dots">Thinking</span>
                <span className="dot-animation">...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </main>

        {/* Input Bar Section */}
        <footer className="input-footer">
          <form className="input-capsule" onSubmit={handleSend}>
            <input
              type="text"
              className="input-field"
              placeholder="Message..."
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button
              type="button"
              className="mic-btn"
              onClick={handleMicPress}
              style={isListening ? { color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.15)', borderRadius: '18px' } : {}}
            >
              <Mic size={20} />
            </button>
          </form>

          {/* Grounding Footer */}
          <div className="grounding-text-container">
            <div className="grounding-text">
              I AM NOT PERFECT. LET'S TRANSCEND CONSCIOUSNESS
            </div>
          </div>
        </footer>
      </div>

      {/* --- MOBILE NAVIGATION GLASS DRAWER (< 960px) OPENING ON LEFT SIDE --- */}
      {showMobileDrawer && (
        <div className="twin-drawer-overlay">
          <div className="twin-drawer-content">
            <div className="twin-drawer-header">
              <div className="twin-drawer-brand">
                <img src="/logo_in_white.svg" alt="Logo" className="twin-drawer-logo" />
                <span className="twin-drawer-title">Next Archer</span>
              </div>
              <button className="twin-drawer-close" onClick={() => setShowMobileDrawer(false)}>
                <X size={22} />
              </button>
            </div>

            <div className="twin-drawer-actions">
              <button
                className="twin-drawer-btn"
                onClick={() => {
                  setShowMobileDrawer(false);
                  setMessages([{ id: '1', sender: 'twin', text: 'Welcome to your Digital Twin. How can I assist you today?' }]);
                }}
              >
                <PlusCircle size={18} color="#00d4ff" />
                <span>New Chat</span>
              </button>

              <button
                className="twin-drawer-btn"
                onClick={() => {
                  setShowMobileDrawer(false);
                  navigate('/twin-chat');
                }}
              >
                <Cpu size={18} color="#a855f7" />
                <span>Twin Chat</span>
              </button>

              <button
                className="twin-drawer-btn"
                onClick={() => {
                  setShowMobileDrawer(false);
                  navigate('/soul-matrix');
                }}
              >
                <User size={18} color="#ffffff" />
                <span>Soul Matrix Profile</span>
              </button>

              <button
                className="twin-drawer-btn"
                onClick={() => {
                  setShowMobileDrawer(false);
                  navigate('/heal-me');
                }}
              >
                <Heart size={18} color="#00ffcc" />
                <span>Heal Me Sanctuary</span>
              </button>
            </div>
            
            {/* Recent Chats Section in Mobile Drawer */}
            <div className="recents-section" style={{ marginTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.12)', paddingTop: '16px' }}>
              <div className="recents-title">RECENT CHATS</div>
              <div className="recents-list">
                {recentSessions.length > 0 ? (
                  recentSessions.map((item) => (
                    <div
                      key={item.id}
                      className="recent-chat-item"
                      onClick={() => {
                        setShowMobileDrawer(false);
                        if (!item || !item.id) return;
                        setCurrentSessionId(item.id);
                        let msgs = item.messages;
                        if (msgs && msgs.length > 0) {
                          setMessages(msgs);
                        } else {
                          getChatMessagesForSession(item.id).then(fetchedMsgs => {
                            if (fetchedMsgs && fetchedMsgs.length > 0) {
                              setMessages(fetchedMsgs);
                            }
                          });
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <MessageSquare size={16} style={{ color: 'rgba(255,255,255,0.6)' }} />
                      <div className="recent-chat-info">
                        <div className="recent-chat-name">{item.title}</div>
                        <div className="recent-chat-time">{item.time || 'Recent'}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '8px 0', fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
                    No past sessions saved.
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="twin-drawer-backdrop" onClick={() => setShowMobileDrawer(false)} />
        </div>
      )}
    </div>
  );
}
