import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getUserData } from '@/utils/storage';

const NAV_ITEMS = [
  { path: '/chat', label: '💬 Chat' },
  { path: '/scan', label: '✨ Scan' },
  { path: '/heal-me', label: '🔮 Sanctuary' },
  { path: '/healing', label: '🧘 Chakras' },
  { path: '/travel', label: '✈️ Travel' },
  { path: '/digital-twin', label: '👤 Digital Twin' },
  { path: '/soul-matrix', label: '🌌 Soul Matrix' },
  { path: '/supercharge', label: '⚡ Supercharge' },
];

export default function GlobalNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const data = await getUserData();
      if (data) {
        setUserData(data);
      }
    };
    checkUser();
  }, [location.pathname]);

  // Automatically displays sticky navbar if user exists or is on returning user pages
  if (!userData && !['/digital-twin', '/soul-matrix'].includes(location.pathname)) {
    return null;
  }

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: 'rgba(5, 5, 16, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6)',
      }}
    >
      {/* Brand & User info */}
      <div
        onClick={() => navigate('/digital-twin')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
        }}
      >
        <img
          src="/logo.png"
          alt="Next Archer Logo"
          style={{ width: '28px', height: '28px', borderRadius: '50%' }}
        />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '13px', fontWeight: '800', color: '#00e5ff', letterSpacing: '1px', fontFamily: 'Poppins, sans-serif' }}>
            NEXT ARCHER
          </span>
          {userData && (
            <span style={{ fontSize: '10px', color: '#a855f7', fontWeight: '600' }}>
              ✦ {userData.firstName} {userData.lastName}
            </span>
          )}
        </div>
      </div>

      {/* Nav Links */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          overflowX: 'auto',
          padding: '2px 4px',
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => {
                if (item.path === '/chat') {
                  const firstName = userData?.firstName || (userData?.full_name ? userData.full_name.split(' ')[0] : '');
                  const query = firstName ? `?firstName=${encodeURIComponent(firstName)}` : '';
                  window.location.href = `http://localhost:8081${query}`;
                } else {
                  navigate(item.path);
                }
              }}
              style={{
                fontSize: '11px',
                fontWeight: isActive ? '700' : '500',
                color: isActive ? '#ffffff' : '#9ca3af',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(168,85,247,0.4), rgba(6,182,212,0.4))'
                  : 'rgba(255,255,255,0.03)',
                border: isActive
                  ? '1px solid rgba(168,85,247,0.6)'
                  : '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '5px 10px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? '0 0 12px rgba(168,85,247,0.3)' : 'none',
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
