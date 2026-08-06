import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import SplashPage from './pages/SplashPage';
import AuraScannerPage from './pages/AuraScannerPage';
import HealMePage from './pages/HealMePage';
import HealingPage from './pages/HealingPage';
import TravelModePage from './pages/TravelModePage';
import DigitalTwinPage from './pages/DigitalTwinPage';
import SoulMatrixPage from './pages/SoulMatrixPage';
import SuperchargePage from './pages/SuperchargePage';
import RegisterPage from './pages/RegisterPage';
import GlobalNavbar from './components/layout/GlobalNavbar';
import './styles/index.css';

// Helper to check if a valid user session exists in localStorage
export const checkIsAuthenticated = () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem('@spiritual_register_user');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && (parsed.email || parsed.firstName || parsed.full_name || parsed.fullName)) {
          return true;
        }
      }
    }
  } catch (e) {}
  return false;
};

// Global Logout Helper: Clears session and strictly resets screen state to Aura Scanner (/scan)
export const handleLogout = (navigate) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('@spiritual_register_user');
    }
  } catch (e) {}
  if (navigate) {
    navigate('/scan');
  } else if (typeof window !== 'undefined') {
    window.location.href = '/scan';
  }
};

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
    const chatUrl = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
      ? `https://compiledchat.vercel.app/${query}`
      : `http://localhost:8081${query}`;
    window.location.href = chatUrl;
  }, []);

  return (
    <div style={{ background: '#050510', color: '#00e5ff', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      Redirecting to AI Chat Screen...
    </div>
  );
}

// Root Splash Controller: Checks localStorage auth state after splash finishes
function RootSplashController() {
  const navigate = useNavigate();

  const handleSplashFinish = (targetRoute) => {
    navigate(targetRoute, { replace: true });
  };

  return <SplashPage isOverlay={false} onFinish={handleSplashFinish} />;
}

// Protected Route Wrapper: Strictly redirects unauthenticated users to Aura Scanner (/scan)
function ProtectedRoute({ children }) {
  const isAuthed = checkIsAuthenticated();
  if (!isAuthed) {
    return <Navigate to="/scan" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <GlobalNavbar />
      <Routes>
        <Route path="/" element={<RootSplashController />} />
        <Route path="/scan" element={<AuraScannerPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Protected Routes: Require valid profile, strictly fallback to /scan if unauthenticated */}
        <Route path="/soul-matrix" element={<ProtectedRoute><SoulMatrixPage /></ProtectedRoute>} />
        <Route path="/digital-twin" element={<ProtectedRoute><DigitalTwinPage /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><ChatRedirect /></ProtectedRoute>} />

        {/* Universal Public Flow Routes */}
        <Route path="/heal-me" element={<HealMePage />} />
        <Route path="/healing" element={<HealingPage />} />
        <Route path="/travel" element={<TravelModePage />} />
        <Route path="/supercharge" element={<SuperchargePage />} />
        
        <Route path="*" element={<Navigate to="/scan" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
