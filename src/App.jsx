import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import SplashPage from './pages/SplashPage';
import AuraScannerPage from './pages/AuraScannerPage';
import HealMePage from './pages/HealMePage';
import HealingPage from './pages/HealingPage';
import TravelModePage from './pages/TravelModePage';
import DigitalTwinPage from './pages/DigitalTwinPage';
import SoulMatrixPage from './pages/SoulMatrixPage';
import SuperchargePage from './pages/SuperchargePage';
import RegisterPage from './pages/RegisterPage';
import ChatScreenPage from './pages/ChatScreenPage';
import './styles/index.css';

const PAGES = [
  { path: '/chat', label: '💬 AI Chat Screen' },
  { path: '/', label: '1. Splash' },
  { path: '/scan', label: '2. Aura Scanner' },
  { path: '/heal-me', label: '3. Heal Me' },
  { path: '/healing', label: '4. Chakras' },
  { path: '/travel', label: '5. Travel Mode' },
  { path: '/digital-twin', label: '6. Digital Twin' },
  { path: '/soul-matrix', label: '7. Soul Matrix' },
  { path: '/supercharge', label: '8. Supercharge' },
  { path: '/register', label: '9. Register' },
];

function QuickNavigationToolbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentIndex = PAGES.findIndex((p) => p.path === location.pathname);

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % PAGES.length;
    navigate(PAGES[nextIndex].path);
  };

  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + PAGES.length) % PAGES.length;
    navigate(PAGES[prevIndex].path);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '16px',
        right: '16px',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: 'rgba(10, 10, 26, 0.95)',
        border: '1.5px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '30px',
        padding: '6px 12px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 229, 255, 0.3)',
        backdropFilter: 'blur(10px)',
        maxWidth: '95vw',
        overflowX: 'auto',
      }}
    >
      <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#00e5ff', textTransform: 'uppercase', letterSpacing: '1px', paddingRight: '4px' }}>
        DEV NAV:
      </span>

      {PAGES.map((page) => (
        <button
          key={page.path}
          onClick={() => navigate(page.path)}
          style={{
            fontSize: '11px',
            fontWeight: location.pathname === page.path ? 'bold' : 'normal',
            color: location.pathname === page.path ? '#ffffff' : '#aaaaaa',
            background: location.pathname === page.path ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
            padding: '4px 8px',
            borderRadius: '12px',
            border: location.pathname === page.path ? '1px solid #ffffff' : '1px solid transparent',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s ease',
          }}
        >
          {page.label}
        </button>
      ))}

      <button
        onClick={handlePrev}
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          padding: '4px 10px',
          borderRadius: '14px',
          fontWeight: 'bold',
          fontSize: '11px',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        ◀ Prev
      </button>

      <button
        onClick={handleNext}
        style={{
          background: 'linear-gradient(135deg, #00e5ff, #7c3aed)',
          color: '#ffffff',
          border: 'none',
          padding: '5px 14px',
          borderRadius: '14px',
          fontWeight: 'bold',
          fontSize: '12px',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          boxShadow: '0 0 15px rgba(0, 229, 255, 0.5)',
        }}
      >
        NEXT PAGE ➔
      </button>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <QuickNavigationToolbar />
      <Routes>
        <Route path="/chat" element={<ChatScreenPage />} />
        <Route path="/" element={<SplashPage />} />
        <Route path="/scan" element={<AuraScannerPage />} />
        <Route path="/heal-me" element={<HealMePage />} />
        <Route path="/healing" element={<HealingPage />} />
        <Route path="/travel" element={<TravelModePage />} />
        <Route path="/digital-twin" element={<DigitalTwinPage />} />
        <Route path="/soul-matrix" element={<SoulMatrixPage />} />
        <Route path="/supercharge" element={<SuperchargePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
