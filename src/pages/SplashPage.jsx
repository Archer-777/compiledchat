import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AmbientBackground from '@/components/visuals/AmbientBackground';
import './SplashPage.css';

export default function SplashPage({ isOverlay = false, onFinish }) {
  const navigate = useNavigate();

  const getTargetRoute = () => {
    return '/scan';
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const route = getTargetRoute();
      if (onFinish) onFinish(route);
      else navigate(route);
    }, 2800);

    return () => clearTimeout(timer);
  }, [navigate, onFinish]);

  const handlePress = () => {
    const route = getTargetRoute();
    if (onFinish) onFinish(route);
    else navigate(route);
  };

  return (
    <div style={{ backgroundColor: '#000000', minHeight: '100vh', width: '100%' }}>
      <div className="splash-container" onClick={handlePress} style={{ backgroundColor: '#000000' }}>
        <div className="splash-centered-content">
          {/* Main Logo Image (2.svg) */}
          <div className="splash-logo-container">
            <img
              src="/2.svg"
              alt="Spiritualize AI Logo"
              style={{
                width: '260px',
                height: 'auto',
                maxHeight: '260px',
                objectFit: 'contain',
              }}
            />
          </div>

          {/* Title and Subtitle Text Group */}
          <div className="splash-text-container">
            <h1 className="splash-title-text">SPIRITUALIZE AI</h1>
            <p className="splash-subtitle-text">Thought Realisation</p>
          </div>

          {/* Staggered Wave Loading Indicator */}
          <div className="splash-footer-container">
            <div className="splash-wave-row">
              <div className="splash-wave-item">
                <svg height="35" width="28" viewBox="0 0 28 35">
                  <path d="M 6 8 L 20 17.5 L 6 27" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="splash-wave-item">
                <svg height="35" width="28" viewBox="0 0 28 35">
                  <path d="M 6 8 L 20 17.5 L 6 27" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="splash-wave-item">
                <svg height="35" width="28" viewBox="0 0 28 35">
                  <path d="M 22 8 L 8 17.5 L 22 27" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="splash-wave-item">
                <svg height="48" width="16" viewBox="0 0 16 48">
                  <path d="M 3 3 H 12 V 45 H 3" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter" />
                </svg>
              </div>
              <div className="splash-wave-item">
                <svg height="35" width="28" viewBox="0 0 28 35">
                  <path d="M 6 8 L 20 17.5 L 6 27" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
