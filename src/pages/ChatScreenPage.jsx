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
            onClick={() => navigate('/heal-me')}
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
            End Session & Heal Me ✨
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
