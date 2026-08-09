import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChatScreenPage.css';

export default function ChatScreenPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dark');
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'NAVIGATE' && event.data.path) {
        navigate(event.data.path);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [navigate]);

  return (
    <div className="chatscreen-page-container">
      {/* Top Header Bar */}
      <header className="chatscreen-header">
        <div className="chatscreen-header-brand">
          <div className="chatscreen-logo-badge">⚡</div>
          <div>
            <h1 className="chatscreen-header-title">NEXT ARCHER — AI CHAT SCREEN</h1>
            <p className="chatscreen-header-subtitle">Unified Realtime Companion & Visual Engine</p>
          </div>
        </div>

        <div className="chatscreen-header-actions">
          <button
            onClick={async () => {
              try {
                const baseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BACKEND_URL) 
                  ? import.meta.env.VITE_BACKEND_URL.replace(/\/+$/, '') 
                  : 'http://localhost:4000';

                // Read actual chat messages from localStorage
                let realMessages = [];
                let userEmail = '';
                try {
                  const sessionsRaw = window.localStorage.getItem('@spiritual_chat_sessions');
                  if (sessionsRaw) {
                    const sessions = JSON.parse(sessionsRaw);
                    const latest = Array.isArray(sessions) && sessions.length > 0 ? sessions[0] : null;
                    if (latest && Array.isArray(latest.messages) && latest.messages.length > 0) {
                      realMessages = latest.messages;
                    }
                    if (latest?.userEmail) userEmail = latest.userEmail;
                  }
                  if (!userEmail) {
                    const userRaw = window.localStorage.getItem('@spiritual_register_user') || window.localStorage.getItem('@active_auth_session');
                    if (userRaw) {
                      const u = JSON.parse(userRaw);
                      userEmail = u?.email || '';
                    }
                  }
                } catch (lsErr) {}

                // Fallback if no real messages found
                if (realMessages.length === 0) {
                  realMessages = [{ sender: 'user', text: 'User completed a session exploring mindfulness and emotional balance.' }];
                }

                const res = await fetch(`${baseUrl}/api/v1/chat/sai/analyze`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ messages: realMessages, email: userEmail }),
                });
                const data = await res.json();
                if (data && data.telemetry) {
                  if (typeof window !== 'undefined' && window.localStorage) {
                    window.localStorage.setItem('@telemetry_analysis_result', JSON.stringify(data.telemetry));
                  }
                  navigate(`/soul-matrix?telemetry=${encodeURIComponent(JSON.stringify(data.telemetry))}`);
                  return;
                }
              } catch (e) {}
              navigate('/soul-matrix');
            }}
            className="chatscreen-external-btn"
            style={{
              background: 'linear-gradient(135deg, #a855f7, #ec4899)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              marginRight: '10px',
            }}
          >
            End Session & Life on Dashboard ✨
          </button>
          <a
            href="http://localhost:8081"
            target="_blank"
            rel="noopener noreferrer"
            className="chatscreen-external-btn"
          >
            ↗ Open Direct (Port 8081)
          </a>
        </div>
      </header>

      {/* Main App Frame Area */}
      <main className="chatscreen-main-viewport">
        {!iframeLoaded && (
          <div className="chatscreen-loading-overlay">
            <div className="chatscreen-spinner"></div>
            <p>Loading Next Archer Chat Screen (Metro Web)...</p>
          </div>
        )}
        <iframe
          src="/chatscreen-app/"
          title="Next Archer Chat Screen"
          className="chatscreen-iframe"
          onLoad={() => setIframeLoaded(true)}
        />
      </main>
    </div>
  );
}
