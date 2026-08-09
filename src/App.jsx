import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/react';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';
import SplashPage from './pages/SplashPage';
import AuraScannerPage from './pages/AuraScannerPage';
import HealMePage from './pages/HealMePage';
import HealingPage from './pages/HealingPage';
import DigitalTwinPage from './pages/DigitalTwinPage';
import SoulMatrixPage from './pages/SoulMatrixPage';
import SuperchargePage from './pages/SuperchargePage';
import RegisterPage from './pages/RegisterPage';
import DigitalTwinChatScreen from './pages/DigitalTwinChatScreen';
import GlobalNavbar from './components/layout/GlobalNavbar';
import './styles/index.css';

// Helper to check if a valid user session exists in localStorage
export const checkIsAuthenticated = () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem('@active_auth_session');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.email) {
          return true;
        }
      }
    }
  } catch (e) {}
  return false;
};

// Global Logout Helper: Clears session and strictly resets to Archer (Guest Mode)
export const handleLogout = (navigate) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('@active_auth_session');
      window.localStorage.removeItem('@spiritual_register_user');
      window.localStorage.removeItem('user_profile');
      window.localStorage.removeItem('@telemetry_analysis_result');
      // Reset to Archer Guest Mode
      const guestSession = { firstName: 'Archer', lastName: '', fullName: 'Archer', isGuest: true };
      window.localStorage.setItem('@active_auth_session', JSON.stringify(guestSession));
    }
  } catch (e) {}
  if (navigate) {
    navigate('/scan');
  } else if (typeof window !== 'undefined') {
    window.location.href = '/scan';
  }
};

/**
 * ClerkUserSync — Listens to Clerk's useUser() hook and syncs user identity
 * to localStorage caches and Supabase DB tables on sign-in.
 */
function ClerkUserSync() {
  const { isSignedIn, user } = useUser();

  useEffect(() => {
    if (!isSignedIn || !user) return;

    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    const email = user.primaryEmailAddress?.emailAddress || '';

    if (!email) return;

    const userObj = {
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`.trim(),
      email,
      isGuest: false,
    };

    // Populate local session caches
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('@active_auth_session', JSON.stringify(userObj));
        window.localStorage.setItem('@spiritual_register_user', JSON.stringify(userObj));
      }
    } catch (e) {}

    // Auto-upsert to Supabase users & user_profiles tables
    if (isSupabaseConfigured) {
      (async () => {
        try {
          // Note: full_name is a GENERATED ALWAYS column in PostgreSQL, so do not pass full_name directly
          await supabase.from('users').upsert([{
            email,
            first_name: firstName,
            last_name: lastName,
            password_hash: '',
            updated_at: new Date().toISOString(),
          }], { onConflict: 'email' });
        } catch (e) {
          console.warn('ClerkUserSync users upsert notice:', e);
        }

        try {
          await supabase.from('user_profiles').upsert([{
            email,
            first_name: firstName,
            last_name: lastName,
            updated_at: new Date().toISOString(),
          }], { onConflict: 'email' });
        } catch (e) {
          // user_profiles table may not exist if using users/user_dashboard schema V2
        }
      })();
    }
  }, [isSignedIn, user]);

  return null;
}

function ChatRedirect() {
  React.useEffect(() => {
    let email = '';
    let firstName = '';
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem('@active_auth_session') || window.localStorage.getItem('@spiritual_register_user');
        if (raw) {
          const parsed = JSON.parse(raw);
          email = parsed.email || '';
          firstName = parsed.firstName || parsed.first_name || (parsed.full_name ? parsed.full_name.split(' ')[0] : '');
        }
      }
    } catch (e) {}

    const params = new URLSearchParams();
    if (email) params.set('email', email);
    if (firstName) params.set('firstName', firstName);
    const qStr = params.toString();
    const query = qStr ? `?${qStr}` : '';
    window.location.href = `https://chat.sai.nextarcher.com/${query}`;
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
  const [showSplash, setShowSplash] = React.useState(true);

  return (
    <BrowserRouter>
      {showSplash && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 999999,
          backgroundColor: '#000000',
        }}>
          <SplashPage isOverlay={true} onFinish={() => setShowSplash(false)} />
        </div>
      )}
      <ClerkUserSync />
      <Routes>
        <Route path="/" element={<Navigate to="/scan" replace />} />
        <Route path="/scan" element={<AuraScannerPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Protected Routes: Require valid profile, strictly fallback to /scan if unauthenticated */}
        <Route path="/soul-matrix" element={<ProtectedRoute><SoulMatrixPage /></ProtectedRoute>} />
        <Route path="/digital-twin" element={<ProtectedRoute><DigitalTwinPage /></ProtectedRoute>} />
        <Route path="/twin-chat" element={<ProtectedRoute><DigitalTwinChatScreen /></ProtectedRoute>} />

        {/* Universal Public Flow Routes */}
        <Route path="/chat" element={<ChatRedirect />} />
        <Route path="/heal-me" element={<HealMePage />} />
        <Route path="/healing" element={<HealingPage />} />
        <Route path="/supercharge" element={<SuperchargePage />} />
        
        <Route path="*" element={<Navigate to="/scan" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
