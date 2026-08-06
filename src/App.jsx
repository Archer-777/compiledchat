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
import GlobalNavbar from './components/layout/GlobalNavbar';
import './styles/index.css';

function ChatRedirect() {
  React.useEffect(() => {
    let firstName = '';
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem('@spiritual_register_user');
        if (raw) {
          const parsed = JSON.parse(raw);
          firstName = parsed.firstName || (parsed.full_name ? parsed.full_name.split(' ')[0] : '');
        }
      }
    } catch (e) {}
    const query = firstName ? `?firstName=${encodeURIComponent(firstName)}` : '';
    window.location.href = `http://localhost:8081${query}`;
  }, []);
  return (
    <div style={{ background: '#050510', color: '#00e5ff', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      Redirecting to AI Chat Screen (Port 8081)...
    </div>
  );
}

function GlobalSplashOverlay() {
  const [showSplash, setShowSplash] = React.useState(true);
  const [fadeOut, setFadeOut] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => setShowSplash(false), 500);
    }, 2400);

    return () => clearTimeout(timer);
  }, []);

  if (!showSplash) return null;

  return (
    <div
      onClick={() => {
        setFadeOut(true);
        setTimeout(() => setShowSplash(false), 300);
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999999,
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: fadeOut ? 'none' : 'auto',
      }}
    >
      <SplashPage isOverlay={true} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <GlobalSplashOverlay />
      <GlobalNavbar />
      <Routes>
        <Route path="/chat" element={<ChatRedirect />} />
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
