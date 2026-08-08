import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mic, Flame, MessageSquare, Menu, X, PlusCircle, Cpu, User, Heart, Zap } from 'lucide-react';
import './DigitalTwinChatScreen.css';

// User avatar matching the orange sunflower eyes and smile
function UserAvatar() {
  return (
    <div className="user-avatar-circle">
      <svg width="28" height="28" viewBox="0 0 32 32">
        <circle cx="10" cy="11" r="4.5" fill="#ff9500" />
        <circle cx="10" cy="11" r="2" fill="#000000" />
        <circle cx="22" cy="11" r="4.5" fill="#ff9500" />
        <circle cx="22" cy="11" r="2" fill="#000000" />
        <path
          d="M 8 20 Q 16 26 24 20"
          fill="none"
          stroke="#ff9500"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

// Custom profile icon matching person-circle-outline
function ProfileIconSvg() {
  return (
    <svg width="22" height="22" viewBox="0 0 512 512" fill="currentColor">
      <path d="M258.9,330.36c-79.62,0-144,64.39-144,144a16,16,0,0,0,16,16h256a16,16,0,0,0,16-16C402.9,394.75,338.52,330.36,258.9,330.36Z" />
      <circle cx="258.9" cy="170.36" r="80" />
    </svg>
  );
}

export default function DigitalTwinChatScreen() {
  const navigate = useNavigate();
  const [userProfileName, setUserProfileName] = useState('Archer');
  const [isGuest, setIsGuest] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([
    { id: '1', sender: 'twin', text: 'Hello! How are you today?' },
    { id: '2', sender: 'user', text: 'Hi' },
    { id: '3', sender: 'twin', text: 'This would be a normal conversation within 30 words.' },
    { id: '4', type: 'badge', text: 'Conversation Streak From User' },
    { id: '5', sender: 'twin', text: 'Knowledge base response for enlightening pleasant surprises and neuron enlightenment' },
  ]);
  const [stars, setStars] = useState([]);
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const recognitionRef = useRef(null);
  const chatEndRef = useRef(null);

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

  // Sync profile name
  useEffect(() => {
    const fetchLatestAccount = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const nameFromUrl = urlParams.get('firstName') || urlParams.get('username') || urlParams.get('name') || '';
        if (nameFromUrl) {
          setUserProfileName(nameFromUrl.trim());
          setIsGuest(false);
          return;
        }
      } catch (e) {}

      try {
        const raw = window.localStorage.getItem('@spiritual_register_user');
        if (raw) {
          const parsed = JSON.parse(raw);
          const localName = parsed.firstName || parsed.first_name || (parsed.full_name ? parsed.full_name.split(' ')[0] : '');
          if (localName) {
            setUserProfileName(localName.trim());
            if (parsed.isGuest === false || parsed.email) {
              setIsGuest(false);
            }
            return;
          }
        }
      } catch (e) {}
    };

    fetchLatestAccount();
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText.trim(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    // Simulated Digital Twin Response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'twin',
          text: 'My digital twin consciousness has received your message. I am aligning with your energy stream.',
        },
      ]);
    }, 1000);
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
              <img src="/nextarcherlogo.jpeg" alt="Logo" />
            </div>
            <div>
              <div className="sidebar-title">Next Archer</div>
              <div className="sidebar-subtitle">DESKTOP WORKSPACE</div>
            </div>
          </div>

          {/* New Chat Button */}
          <button
            className="new-chat-btn"
            onClick={() => {
              setMessages([
                {
                  id: '1',
                  sender: 'twin',
                  text: 'Welcome to your Digital Twin. How can I assist you today?',
                },
              ]);
            }}
          >
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
              <div className="recent-chat-item">
                <MessageSquare size={16} style={{ color: 'rgba(255,255,255,0.6)' }} />
                <div className="recent-chat-info">
                  <div className="recent-chat-name">Morning Alignment</div>
                  <div className="recent-chat-time">Today</div>
                </div>
              </div>
              <div className="recent-chat-item">
                <MessageSquare size={16} style={{ color: 'rgba(255,255,255,0.6)' }} />
                <div className="recent-chat-info">
                  <div className="recent-chat-name">Deep Focus & Clarity</div>
                  <div className="recent-chat-time">Yesterday</div>
                </div>
              </div>
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
                <p className="header-subtitle">NIGHT AMBIENT</p>
                <div className="timer-pill-unlimited">
                  <Zap size={11} color="#00e5ff" />
                  <span>⚡ UNLIMITED</span>
                </div>
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
                {/* Twin Avatar - simple black circle */}
                {isTwin && <div className="twin-avatar-circle" />}

                {/* Message Bubble Box */}
                <div className={`message-bubble ${isTwin ? 'bubble-twin' : 'bubble-user'}`}>
                  {msg.text}
                </div>

                {/* User Avatar - custom sunflower SVG */}
                {!isTwin && <UserAvatar />}
              </div>
            );
          })}
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
                <img src="/nextarcherlogo.jpeg" alt="Logo" className="twin-drawer-logo" />
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
          </div>
          <div className="twin-drawer-backdrop" onClick={() => setShowMobileDrawer(false)} />
        </div>
      )}
    </div>
  );
}
