import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getUserData } from '@/utils/storage';

const NAV_ITEMS = [
  { path: '/chat', label: '💬 Chat' },
  { path: '/scan', label: '✨ Scan' },
  { path: '/heal-me', label: '🔮 Sanctuary' },
  { path: '/healing', label: '🧘 Chakras' },
  { path: '/travel', label: '✈️ Travel' },
  { path: '/digital-twin', label: '👤 Digital Twin', requiresUser: true },
  { path: '/soul-matrix', label: '🌌 Soul Matrix' },
  { path: '/supercharge', label: '⚡ Supercharge' },
];

export default function GlobalNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const data = await getUserData();
      if (data) {
        setUserData(data);
      }
    };
    checkUser();
  }, [location.pathname]);

  // Automatically close slide-out drawer when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Display top navbar if user exists or is on returning user pages
  if (!userData && !['/digital-twin', '/soul-matrix'].includes(location.pathname)) {
    return null;
  }

  const handleNavigation = (item) => {
    setMenuOpen(false);
    if (item.path === '/chat') {
      const firstName = userData?.firstName || (userData?.full_name ? userData.full_name.split(' ')[0] : '');
      const query = firstName ? `?firstName=${encodeURIComponent(firstName)}` : '';
      window.location.href = `https://compiledchat.vercel.app/${query}`;
    } else {
      navigate(item.path);
    }
  };

  return (
    <>
      {/* ── Compact Top Header Bar ── */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          background: 'rgba(5, 5, 16, 0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6)',
        }}
      >
        {/* Brand Title & User Info */}
        <div
          onClick={() => {
            setMenuOpen(false);
            navigate('/digital-twin');
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
          }}
        >
          <img
            src="/logo.png"
            alt="Next Archer Logo"
            style={{ width: '30px', height: '30px', borderRadius: '50%' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '14px', fontWeight: '800', color: '#00e5ff', letterSpacing: '1px', fontFamily: 'Poppins, sans-serif' }}>
              NEXT ARCHER
            </span>
            {userData && (
              <span style={{ fontSize: '10px', color: '#a855f7', fontWeight: '600' }}>
                ✦ {userData.firstName} {userData.lastName}
              </span>
            )}
          </div>
        </div>

        {/* Hamburger Toggle Button (3 lines animating to 'X') */}
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            width: '40px',
            height: '40px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            cursor: 'pointer',
            padding: 0,
            transition: 'all 0.3s ease',
            boxShadow: menuOpen ? '0 0 15px rgba(0, 229, 255, 0.4)' : 'none',
          }}
        >
          <span
            style={{
              width: '20px',
              height: '2px',
              backgroundColor: menuOpen ? '#00e5ff' : '#ffffff',
              borderRadius: '2px',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none',
            }}
          />
          <span
            style={{
              width: '20px',
              height: '2px',
              backgroundColor: menuOpen ? '#00e5ff' : '#ffffff',
              borderRadius: '2px',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              opacity: menuOpen ? 0 : 1,
            }}
          />
          <span
            style={{
              width: '20px',
              height: '2px',
              backgroundColor: menuOpen ? '#00e5ff' : '#ffffff',
              borderRadius: '2px',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none',
            }}
          />
        </button>
      </nav>

      {/* ── Dark Backdrop Overlay ── */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99998,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            transition: 'opacity 0.3s ease',
          }}
        />
      )}

      {/* ── Slide-Out Navigation Drawer (#0d091e) ── */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '310px',
          maxWidth: '85vw',
          backgroundColor: '#0d091e',
          zIndex: 99999,
          boxShadow: '-10px 0 35px rgba(0, 0, 0, 0.8), 0 0 30px rgba(168, 85, 247, 0.15)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          overflowY: 'auto',
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/logo.png" alt="Logo" style={{ width: '26px', height: '26px', borderRadius: '50%' }} />
            <span style={{ fontSize: '13px', fontWeight: '800', color: '#00e5ff', letterSpacing: '1px', fontFamily: 'Poppins, sans-serif' }}>
              NAVIGATION
            </span>
          </div>

          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#ffffff',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s ease',
            }}
          >
            ✕
          </button>
        </div>

        {/* User Card inside Drawer */}
        {userData && (
          <div
            style={{
              margin: '16px 20px 8px 20px',
              padding: '12px 16px',
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(6, 182, 212, 0.15))',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #a855f7, #06b6d4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                color: '#ffffff',
                fontSize: '14px',
              }}
            >
              {userData.firstName ? userData.firstName[0].toUpperCase() : 'A'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#ffffff' }}>
                {userData.firstName} {userData.lastName}
              </span>
              <span style={{ fontSize: '10px', color: '#a855f7', fontWeight: '500' }}>
                {userData.email || 'Authenticated User'}
              </span>
            </div>
          </div>
        )}

        {/* Nav Items List */}
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            const isLocked = item.requiresUser && !userData;

            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '14px',
                  fontSize: '13px',
                  fontWeight: isActive ? '700' : '500',
                  color: isActive ? '#ffffff' : '#cbd5e1',
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(168,85,247,0.35), rgba(6,182,212,0.35))'
                    : 'rgba(255, 255, 255, 0.03)',
                  border: isActive
                    ? '1.5px solid rgba(168,85,247,0.6)'
                    : '1px solid rgba(255, 255, 255, 0.06)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.25s ease',
                  boxShadow: isActive ? '0 0 20px rgba(168, 85, 247, 0.25)' : 'none',
                }}
              >
                <span>{item.label}</span>

                {isLocked ? (
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: '700',
                      color: '#f59e0b',
                      background: 'rgba(245, 158, 11, 0.15)',
                      border: '1px solid rgba(245, 158, 11, 0.4)',
                      borderRadius: '8px',
                      padding: '2px 8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    🔒 Locked
                  </span>
                ) : isActive ? (
                  <span style={{ fontSize: '11px', color: '#00e5ff', fontWeight: '800' }}>● Active</span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Drawer Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: '#64748b',
          }}
        >
          <span>SPIRITUALIZE AI v1.0</span>
          <span style={{ color: '#10b981', fontWeight: '600' }}>● System Online</span>
        </div>
      </aside>
    </>
  );
}
