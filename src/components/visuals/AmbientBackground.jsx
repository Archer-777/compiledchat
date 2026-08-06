import React from 'react';
import '@/styles/aurora.css';

export default function AmbientBackground({ children }) {
  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', backgroundColor: '#050510', overflow: 'hidden' }}>
      {/* Dynamic Animated Aurora Blobs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div className="aurora-blob aurora-blob--violet" style={{ top: '-10%', left: '-10%' }} />
        <div className="aurora-blob aurora-blob--indigo" style={{ top: '30%', right: '-15%' }} />
        <div className="aurora-blob aurora-blob--gold" style={{ bottom: '-15%', left: '20%' }} />
      </div>

      {/* Main Page Content */}
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
}
