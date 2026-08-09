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
                const res = await fetch('http://localhost:4000/api/v1/chat/sai/analyze', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ messages: [{ sender: 'user', text: 'End Session analysis request' }] }),
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
            End Session & Soul Matrix ✨
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
