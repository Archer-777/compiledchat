import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SplashPage.css';

export default function SplashPage({ isOverlay = false, onFinish }) {
  const navigate = useNavigate();
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Stable references so parent re-renders cannot cancel the timer
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  const hasFinishedRef = useRef(false);

  const getTargetRoute = () => {
    return '/scan';
  };

  const finishSplash = (customRoute) => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    setIsFadingOut(true);

    const route = customRoute || getTargetRoute();

    // Smooth exit animation before unmounting/navigating
    setTimeout(() => {
      if (onFinishRef.current) {
        onFinishRef.current(route);
      } else if (navigateRef.current) {
        navigateRef.current(route);
      }
    }, 350);
  };

  useEffect(() => {
    // Primary auto-dismiss timer: 2.2s display
    const timer = setTimeout(() => {
      finishSplash();
    }, 2200);

    // Guaranteed fallback timer for mobile WebKit
    const safetyTimer = setTimeout(() => {
      finishSplash();
    }, 3200);

    return () => {
      clearTimeout(timer);
      clearTimeout(safetyTimer);
    };
  }, []); // Strictly mount-once so re-renders cannot reset the timer

  const handlePress = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    finishSplash();
  };

  return (
    <div
      className={`splash-wrapper ${isFadingOut ? 'splash-fade-out' : ''}`}
      style={{
        backgroundColor: '#000000',
        minHeight: '100dvh',
        width: '100%',
        transition: 'opacity 0.35s ease, transform 0.35s ease',
        opacity: isFadingOut ? 0 : 1,
        transform: isFadingOut ? 'scale(1.02)' : 'scale(1)',
        pointerEvents: isFadingOut ? 'none' : 'auto',
      }}
    >
      <div
        className="splash-container"
        onClick={handlePress}
        onTouchEnd={handlePress}
        role="button"
        tabIndex={0}
        aria-label="Enter Next Archer"
      >
        <div className="splash-centered-content">
          {/* Main Logo Image (2.svg) */}
          <div className="splash-logo-container">
            <img
              src="/2.svg"
              alt="Spiritualize AI Logo"
              className="splash-logo-img"
            />
          </div>

          {/* Title and Subtitle Text Group */}
          <div className="splash-text-container">
            <h1 className="splash-title-text">SPIRITUALIZE AI</h1>
            <p className="splash-subtitle-text">Thought Realisation</p>
          </div>

          {/* Staggered Wave Loading Indicator & Skip Hint */}
          <div className="splash-footer-container">
            <div className="splash-wave-row">
              <div className="splash-wave-item">
                <svg height="30" width="24" viewBox="0 0 28 35">
                  <path d="M 6 8 L 20 17.5 L 6 27" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="splash-wave-item">
                <svg height="30" width="24" viewBox="0 0 28 35">
                  <path d="M 6 8 L 20 17.5 L 6 27" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="splash-wave-item">
                <svg height="30" width="24" viewBox="0 0 28 35">
                  <path d="M 22 8 L 8 17.5 L 22 27" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="splash-wave-item">
                <svg height="42" width="14" viewBox="0 0 16 48">
                  <path d="M 3 3 H 12 V 45 H 3" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter" />
                </svg>
              </div>
              <div className="splash-wave-item">
                <svg height="30" width="24" viewBox="0 0 28 35">
                  <path d="M 6 8 L 20 17.5 L 6 27" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <span className="splash-tap-hint">Tap anywhere to continue</span>
          </div>
        </div>
      </div>
    </div>
  );
}
