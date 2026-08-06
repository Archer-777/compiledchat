import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AmbientBackground from '@/components/visuals/AmbientBackground';
import './SplashPage.css';

export default function SplashPage({ isOverlay = false, onFinish }) {
  const navigate = useNavigate();

  const getTargetRoute = () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem('@spiritual_register_user');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && (parsed.email || parsed.firstName || parsed.full_name || parsed.fullName)) {
            return '/soul-matrix';
          }
        }
      }
    } catch (e) {}
    return '/scan';
  };

  useEffect(() => {
    if (!isOverlay) {
      const timer = setTimeout(() => {
        const route = getTargetRoute();
        if (onFinish) onFinish(route);
        else navigate(route);
      }, 2800);

      return () => clearTimeout(timer);
    }
  }, [navigate, isOverlay, onFinish]);

  const handlePress = () => {
    if (!isOverlay) {
      const route = getTargetRoute();
      if (onFinish) onFinish(route);
      else navigate(route);
    }
  };

  return (
    <AmbientBackground>
      <div className="splash-container" onClick={handlePress}>
        <div className="splash-centered-content">
          {/* Main Logo & Typography Group */}
          <div className="splash-logo-container">
            <div className="splash-halo-wrapper">
              <svg height="100" width="280" viewBox="0 0 240 90">
                <ellipse
                  cx="120"
                  cy="45"
                  rx="70"
                  ry="20"
                  fill="none"
                  stroke="#FF9900"
                  strokeWidth="16"
                  opacity="0.45"
                />
                <ellipse
                  cx="120"
                  cy="45"
                  rx="62"
                  ry="17"
                  fill="none"
                  stroke="#FFE57F"
                  strokeWidth="3.5"
                  opacity="0.95"
                />
              </svg>
            </div>

            <div className="splash-ai-text">AI</div>

            <div className="splash-smile-arc">
              <svg height="45" width="180" viewBox="0 0 160 40">
                <path
                  d="M 22 10 Q 80 32 138 10"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
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
    </AmbientBackground>
  );
}
