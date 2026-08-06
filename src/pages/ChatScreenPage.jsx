import React, { useState } from 'react';
import './ChatScreenPage.css';

export default function ChatScreenPage() {
  const [activeTab, setActiveTab] = useState('dark');
  const [iframeLoaded, setIframeLoaded] = useState(false);

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
          src="http://localhost:8081"
          title="Next Archer Chat Screen"
          className="chatscreen-iframe"
          onLoad={() => setIframeLoaded(true)}
        />
      </main>
    </div>
  );
}
