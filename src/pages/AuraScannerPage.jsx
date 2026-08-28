import React, { useEffect, useRef, useState } from 'react';
import { SignInButton, SignUpButton, UserButton, Show, useUser } from '@clerk/react';
import { useNavigate } from 'react-router-dom';
import {
  IoCamera,
  IoDownloadOutline,
  IoClose,
  IoArrowForward,
  IoLogoInstagram,
  IoLogoSnapchat,
  IoLogoWhatsapp,
  IoLogoTwitter,
  IoRefreshOutline,
} from 'react-icons/io5';
import AmbientBackground from '@/components/visuals/AmbientBackground';
import Modal from '@/components/common/Modal';
import Toast from '@/components/common/Toast';
import databaseService from '@/services/databaseService';
import { getChatAppUrl } from '@/config/urls';
import auraPredictionService from '@/services/auraPredictionService';
import { supabase, isSupabaseConfigured } from '@/services/supabaseClient';
import './AuraScannerPage.css';

const stickerThemes = {
  violet: {
    id: 'violet',
    name: 'Cosmic Violet',
    title: 'TRANSCENDENT AURA',
    archetype: 'Cosmic Visionary',
    bgGradient: ['#8b5cf6', '#3b82f6', '#0f172a'],
    primary: '#8b5cf6',
    border: '#c084fc',
    glow: 'rgba(192, 132, 252, 0.7)',
    badgeBg: 'rgba(139, 92, 246, 0.15)',
  },
  indigo: {
    id: 'indigo',
    name: 'Quantum Indigo',
    title: 'QUANTUM HARMONY',
    archetype: 'Deep Resonance',
    bgGradient: ['#6366f1', '#06b6d4', '#0284c7'],
    primary: '#6366f1',
    border: '#818cf8',
    glow: 'rgba(129, 140, 248, 0.7)',
    badgeBg: 'rgba(99, 102, 241, 0.15)',
  },
  gold: {
    id: 'gold',
    name: 'Solfeggio Gold',
    title: 'SOLFEGGIO GOLD',
    archetype: 'Abundance Matrix',
    bgGradient: ['#f59e0b', '#d97706', '#78350f'],
    primary: '#f59e0b',
    border: '#fbbf24',
    glow: 'rgba(251, 191, 36, 0.7)',
    badgeBg: 'rgba(245, 158, 11, 0.15)',
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Healing',
    title: 'EMERALD VITALITY',
    archetype: 'Life-Force Shield',
    bgGradient: ['#10b981', '#059669', '#064e3b'],
    primary: '#10b981',
    border: '#34d399',
    glow: 'rgba(52, 211, 153, 0.7)',
    badgeBg: 'rgba(16, 185, 129, 0.15)',
  },
  rose: {
    id: 'rose',
    name: 'Astral Rose',
    title: 'ASTRAL DEVOTION',
    archetype: 'High Frequency',
    bgGradient: ['#f43f5e', '#c084fc', '#4c0519'],
    primary: '#f43f5e',
    border: '#fb7185',
    glow: 'rgba(251, 113, 133, 0.7)',
    badgeBg: 'rgba(244, 63, 94, 0.15)',
  },
};

export default function AuraScannerPage() {
  const navigate = useNavigate();
  const { isSignedIn, user } = useUser();

  // Database status
  const [dbInfo, setDbInfo] = useState({ connected: false, mode: 'checking', message: 'Connecting to DB...' });

  // Permissions Modal
  const [showPermissionModal, setShowPermissionModal] = useState(true);

  // Camera & Location
  const [cameraGranted, setCameraGranted] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [permissionError, setPermissionError] = useState(null);

  // Diagnostic Logs
  const [analysisLogs, setAnalysisLogs] = useState(["Initializing sentiment analysis scanner..."]);
  const setSemanticAnalysis = (msg) => {
    if (msg) setAnalysisLogs((prev) => [...prev, msg]);
  };

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const stickerCanvasRef = useRef(null);

  // Single-execution Guards for Scan
  const hasScannedRef = useRef(false);
  const isScanningRef = useRef(false);

  // Face Matching & Calibration
  const [calibrationConfirmed, setCalibrationConfirmed] = useState(true);
  const [capturedImage, setCapturedImage] = useState(null);
  const [matchStatus, setMatchStatus] = useState(null);
  const [scanComplete, setScanComplete] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [currentPrediction, setCurrentPrediction] = useState(null);

  // Sticker Studio States
  const [showStickerModal, setShowStickerModal] = useState(false);
  const [stickerTheme, setStickerTheme] = useState('violet');
  const [stickerUsername, setStickerUsername] = useState('@username');
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  // 1. Initial DB Connection Check
  useEffect(() => {
    databaseService.checkConnection().then(setDbInfo);
  }, []);

  // 2. Clerk Authentication Sync — strictly through Clerk login
  useEffect(() => {
    if (isSignedIn && user) {
      const email = user.primaryEmailAddress?.emailAddress || '';
      const firstName = user.firstName || (user.fullName ? user.fullName.split(' ')[0] : 'Archer');
      const lastName = user.lastName || '';
      const fullName = user.fullName || `${firstName} ${lastName}`.trim();

      const userObj = {
        firstName,
        lastName,
        fullName,
        email,
        isGuest: false,
      };

      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('@spiritual_register_user', JSON.stringify(userObj));
          window.localStorage.setItem('@active_auth_session', JSON.stringify(userObj));
          window.localStorage.setItem('user_profile', JSON.stringify(userObj));
        }
      } catch (e) {}

      if (firstName) {
        setStickerUsername(`@${firstName.toLowerCase()}`);
      }

      setSemanticAnalysis(`Authenticated via Clerk as ${fullName}.`);

      // Auto-upsert to Supabase users table
      if (isSupabaseConfigured && email) {
        supabase.from('users').upsert([{
          email,
          first_name: firstName,
          last_name: lastName,
          password_hash: '',
          updated_at: new Date().toISOString(),
        }], { onConflict: 'email' }).then(() => {}).catch(() => {});
      }
    }
  }, [isSignedIn, user]);

  // 3. Load face-api.js ML Models
  useEffect(() => {
    import('../services/faceRecognitionService').then(async (module) => {
      const faceService = module.default;
      setSemanticAnalysis('Loading sentiment recognition AI models...');
      const loaded = await faceService.loadModels();
      setModelsLoaded(loaded);
      if (loaded) {
        setSemanticAnalysis('AI models loaded. Ready for scanning.');
      } else {
        setSemanticAnalysis('AI model loading fallback active.');
      }
    });
  }, []);

  // 4. Camera Feed binding
  useEffect(() => {
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch((e) => console.log('Camera video play error:', e));
    }
  }, [cameraStream, cameraGranted]);

  // 5. Face Recognition Loop — Runs strictly ONCE when logging in / opening scanner
  useEffect(() => {
    if (cameraGranted && cameraStream && calibrationConfirmed && modelsLoaded && !hasScannedRef.current && !isScanningRef.current && !scanComplete) {
      let isSubscribed = true;
      isScanningRef.current = true;

      const runScanSequence = async () => {
        if (!isSubscribed) return;
        setSemanticAnalysis('Scanning sentiment field with neural network...');
        await new Promise((r) => setTimeout(r, 1800));

        if (!isSubscribed || !videoRef.current) {
          isScanningRef.current = false;
          return;
        }

        const faceService = (await import('../services/faceRecognitionService')).default;
        let faceResult = null;
        let attempts = 0;

        while (!faceResult && attempts < 5 && isSubscribed) {
          attempts++;
          setSemanticAnalysis(`Analyzing facial sentiment vectors... (${attempts}/5)`);

          if (videoRef.current && canvasRef.current) {
            const drawn = faceService.drawVideoToCanvas(videoRef.current, canvasRef.current);
            if (drawn) {
              faceResult = await faceService.detectFaceFromCanvas(canvasRef.current);
            }
          }
          if (!faceResult) await new Promise((r) => setTimeout(r, 1000));
        }

        if (!isSubscribed) {
          isScanningRef.current = false;
          return;
        }

        // Predict Aura (with or without detected face)
        const auraPred = auraPredictionService.predictAura(faceResult);
        setCurrentPrediction(auraPred);

        if (auraPred && auraPred.themeId && stickerThemes[auraPred.themeId]) {
          setStickerTheme(auraPred.themeId);
        }

        if (faceResult) {
          const confidence = Math.round(faceResult.score * 100);
          setSemanticAnalysis(`Facial Emotion & Sentiment Detected (${confidence}% confidence)...`);
          await new Promise((r) => setTimeout(r, 1500));

          const descriptor = Array.from(faceResult.descriptor);
          const signature = { descriptor, emotion: faceResult.dominantEmotion, auraPrediction: auraPred };

          const matchResult = await databaseService.findMatchingAuraScan(signature);

          let dataUrl = null;
          if (canvasRef.current && videoRef.current) {
            const currentTheme = stickerThemes[auraPred.themeId] || stickerThemes.violet;
            dataUrl = faceService.removeBackgroundAndCompositeAura(
              canvasRef.current,
              videoRef.current,
              faceResult,
              currentTheme
            );
          }

          if (matchResult && matchResult.match) {
            setMatchStatus('matched');
            setCapturedImage(dataUrl);
            setSemanticAnalysis(`Sentiment Matched: ${auraPred.archetype} (${auraPred.frequency})`);
          } else {
            await databaseService.saveAuraScan({
              image: dataUrl,
              signature,
              frequency: auraPred.frequency,
              resonanceScore: auraPred.resonanceScore,
            });
            setMatchStatus('new');
            setCapturedImage(dataUrl);
            setSemanticAnalysis(`Sentiment Profile Saved: ${auraPred.archetype} (${auraPred.valenceScore}% Valence)`);
          }
        } else {
          setSemanticAnalysis('Default sentiment profile generated.');
          setMatchStatus('matched');
        }

        if (isSubscribed) {
          hasScannedRef.current = true;
          isScanningRef.current = false;
          setScanComplete(true);

          // Automatically establish and lock unified session upon scan completion
          try {
            if (typeof window !== 'undefined' && window.localStorage) {
              const existingRaw = window.localStorage.getItem('@active_auth_session') || window.localStorage.getItem('@spiritual_register_user') || window.localStorage.getItem('user_profile');
              let existing = {};
              try { if (existingRaw) existing = JSON.parse(existingRaw); } catch (e) {}

              const activeEmail = existing.email || (user?.primaryEmailAddress?.emailAddress) || 'archer@nextarcher.com';
              const activeFirstName = existing.firstName || (user?.firstName) || 'Archer';
              const activeLastName = existing.lastName || (user?.lastName) || '';

              const unifiedSession = {
                id: existing.id || 'usr_' + Date.now(),
                email: activeEmail,
                firstName: activeFirstName,
                lastName: activeLastName,
                fullName: `${activeFirstName} ${activeLastName}`.trim(),
                archetype: auraPred?.archetype || 'Serene Equilibrium',
                valence: auraPred?.valenceScore || 94.2,
                scanned: true,
                isGuest: false,
              };

              window.localStorage.setItem('@active_auth_session', JSON.stringify(unifiedSession));
              window.localStorage.setItem('@spiritual_register_user', JSON.stringify(unifiedSession));
              window.localStorage.setItem('user_profile', JSON.stringify(unifiedSession));
              window.localStorage.setItem('@aura_scan_completed', 'true');
            }
          } catch (storageErr) {
            console.warn('Session auto-hydration on scan notice:', storageErr);
          }
        }
      };

      runScanSequence();
      return () => {
        isSubscribed = false;
        isScanningRef.current = false;
      };
    }
  }, [cameraGranted, cameraStream, calibrationConfirmed, modelsLoaded, scanComplete]);

  // Optional manual rescan
  const handleRescan = () => {
    hasScannedRef.current = false;
    isScanningRef.current = false;
    setScanComplete(false);
    setMatchStatus(null);
    setCapturedImage(null);
    setSemanticAnalysis('Initiating fresh sentiment alignment scan...');
  };

  // Permission Request
  const requestPermissions = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        let stream = null;
        try {
          // Primary: Front camera with mobile-optimized resolution
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'user',
              width: { ideal: 640 },
              height: { ideal: 480 }
            },
            audio: false
          });
        } catch (mobileErr) {
          // Fallback: General video constraint
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
        }
        setCameraGranted(true);
        setCameraStream(stream);
        setPermissionError(null);
      } catch (err) {
        setPermissionError("Camera access required for live aura scanning.");
      }
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => setLocationGranted(true),
        () => setLocationGranted(true)
      );
    }
    setShowPermissionModal(false);
  };

  const handleContinue = () => {
    let email = '';
    let firstName = '';
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem('@active_auth_session') || window.localStorage.getItem('@spiritual_register_user') || window.localStorage.getItem('user_profile');
        if (raw) {
          const parsed = JSON.parse(raw);
          email = parsed.email || '';
          firstName = parsed.firstName || parsed.first_name || (parsed.full_name ? parsed.full_name.split(' ')[0] : '');
        }
      }
    } catch (e) {}

    if (!email) email = user?.primaryEmailAddress?.emailAddress || 'archer@nextarcher.com';
    if (!firstName) firstName = user?.firstName || 'Archer';

    const params = new URLSearchParams();
    params.set('email', email);
    params.set('firstName', firstName);
    window.location.href = getChatAppUrl(`?${params.toString()}`);
  };

  const activeTheme = stickerThemes[stickerTheme] || stickerThemes.violet;

  return (
    <AmbientBackground pureBlack={true}>
      <Toast message={toastMsg} />

      <div className="scanner-page-container">
        {/* Main Desktop Grid */}
        <div className="scanner-main-grid">
          {/* Left Column: Live Scanner Box */}
          <div className="scanner-viewport-card">
            <div className="scanner-camera-frame">
              {cameraGranted && cameraStream && (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="scanner-video-feed"
                />
              )}

              {capturedImage && (
                <img src={capturedImage} alt="Captured Aura" className="scanner-captured-img" />
              )}

              {cameraGranted && cameraStream && !scanComplete && (
                <div className="scanner-laser-line" />
              )}

              {/* Biometric HUD Corner Brackets */}
              <div className="hud-corner hud-top-left" />
              <div className="hud-corner hud-top-right" />
              <div className="hud-corner hud-bottom-left" />
              <div className="hud-corner hud-bottom-right" />

              <canvas ref={canvasRef} style={{ display: 'none' }} width="480" height="380" />

              {(!cameraGranted || !cameraStream) && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  padding: 20,
                  width: '100%',
                  height: '100%',
                  zIndex: 10
                }}>
                  <IoCamera size={64} color="#ffffff" style={{ marginBottom: 16 }} />
                  <h3 style={{ fontSize: 18, fontWeight: '700', color: '#ffffff', marginBottom: 8 }}>Webcam Scanner Required</h3>
                  <p style={{ fontSize: 13, color: '#aaaaaa', marginBottom: 20 }}>Enable camera to run neural aura alignment</p>
                  <button
                    style={{
                      background: '#ffffff',
                      color: '#000000',
                      padding: '12px 28px',
                      borderRadius: 24,
                      fontWeight: 'bold',
                      fontSize: 14,
                      cursor: 'pointer',
                      border: 'none',
                      boxShadow: '0 4px 14px rgba(255, 255, 255, 0.2)',
                    }}
                    onClick={requestPermissions}
                  >
                    Enable Webcam
                  </button>
                </div>
              )}

              {/* Manual Rescan Trigger Button in HUD */}
              {scanComplete && (
                <button
                  onClick={handleRescan}
                  style={{
                    position: 'absolute',
                    bottom: '16px',
                    left: '16px',
                    background: 'rgba(0, 0, 0, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: '#ffffff',
                    padding: '8px 14px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backdropFilter: 'blur(8px)',
                    zIndex: 15,
                  }}
                >
                  <IoRefreshOutline size={14} />
                  <span>Rescan Aura</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Control & Results Panel */}
          <div className="scanner-control-panel">
            {/* Prediction Card */}
            <div style={{
              background: '#000000',
              border: '1.5px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '16px',
              padding: '20px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#ffffff',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '20px',
                  padding: '4px 12px',
                  letterSpacing: '0.5px',
                }}>
                  {currentPrediction?.categoryTag || '+ NEURAL RESONANCE'}
                </span>
                <span style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#ffffff',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '20px',
                  padding: '4px 14px',
                }}>
                  {currentPrediction?.valenceScore || 94.2}% Valence
                </span>
              </div>

              <h2 style={{
                color: '#ffffff',
                fontSize: 20,
                fontWeight: 700,
                margin: '14px 0 8px 0',
              }}>
                {currentPrediction?.archetype || 'Serene Equilibrium'}
              </h2>

              <p style={{
                color: '#aaaaaa',
                fontSize: 13,
                lineHeight: 1.5,
                margin: 0,
              }}>
                {currentPrediction?.summary || 'Calm, centered emotional state and crystalline mental clarity.'}
              </p>
            </div>

            {/* Neural Sentiment Diagnostic Logs */}
            <div style={{
              background: '#000000',
              border: '1.5px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '16px',
              padding: '16px 20px',
              fontFamily: 'monospace',
              fontSize: '11px',
              color: '#94a3b8',
              maxHeight: '120px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}>
              <div style={{ color: '#00e5ff', fontWeight: 'bold', marginBottom: '2px', fontSize: '10px', letterSpacing: '1px' }}>
                // NEURAL SENTIMENT LOGS
              </div>
              {analysisLogs.map((log, index) => (
                <div key={index} style={{ opacity: index === analysisLogs.length - 1 ? 1 : 0.65 }}>
                  &gt; {log}
                </div>
              ))}
            </div>

            {/* User Authentication Card — Pure Clerk Authentication */}
            <div style={{
              background: '#000000',
              border: '1.5px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '16px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
              <div style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '1px',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                ✦ CLERK AUTHENTICATION
              </div>

              {/* Clerk Sign In / Sign Up Buttons */}
              {!isSignedIn ? (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <SignInButton mode="modal">
                    <button style={{
                      flex: 1,
                      background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      fontWeight: 'bold',
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 15px rgba(168, 85, 247, 0.3)',
                    }}>
                      ⚡ Sign In
                    </button>
                  </SignInButton>

                  <SignUpButton mode="modal">
                    <button style={{
                      flex: 1,
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      color: '#ffffff',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      fontWeight: 'bold',
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}>
                      + Sign Up
                    </button>
                  </SignUpButton>
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: '12px',
                }}>
                  <UserButton afterSignOutUrl="/scan" />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ color: '#10b981', fontSize: '13px', fontWeight: '700' }}>
                      ✓ Signed In via Clerk
                    </span>
                    <span style={{ color: '#94a3b8', fontSize: '11px' }}>
                      {user?.primaryEmailAddress?.emailAddress || user?.fullName || 'Active Session'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Action Pill Button */}
            <button
              className="scanner-continue-btn"
              disabled={!scanComplete}
              onClick={handleContinue}
              style={{
                width: '100%',
                background: scanComplete
                  ? 'linear-gradient(135deg, #00e5ff, #a855f7)'
                  : 'rgba(255, 255, 255, 0.08)',
                border: scanComplete
                  ? 'none'
                  : '1.5px solid rgba(255, 255, 255, 0.3)',
                color: scanComplete ? '#000000' : '#ffffff',
                padding: '14px 28px',
                borderRadius: '30px',
                fontWeight: 'bold',
                fontSize: '14px',
                cursor: scanComplete ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: scanComplete ? '0 0 20px rgba(0, 229, 255, 0.4)' : 'none',
                transition: 'all 0.3s ease',
              }}
            >
              <span>{scanComplete ? 'Continue to Chat →' : 'Analyzing Sentiment... →'}</span>
            </button>
          </div>
        </div>

        {/* Permission Modal */}
        <Modal isOpen={showPermissionModal} onClose={() => setShowPermissionModal(false)}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: 20, marginBottom: 8, color: '#ffffff' }}>Enable Permissions</h2>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>
              To scan your aura, Next Archer requests camera and location access.
            </p>

            <button
              style={{
                width: '100%',
                background: '#ffffff',
                color: '#000',
                padding: 14,
                borderRadius: 14,
                fontWeight: 'bold',
                fontSize: 14,
                cursor: 'pointer',
                border: 'none',
              }}
              onClick={requestPermissions}
            >
              Allow Camera & Location
            </button>
          </div>
        </Modal>

        {/* Sticker Studio Modal */}
        <Modal isOpen={showStickerModal} onClose={() => setShowStickerModal(false)} maxWidth={720}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 'bold' }}>Aura Sticker Studio</h2>
              <button onClick={() => setShowStickerModal(false)}>
                <IoClose size={24} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
              {Object.keys(stickerThemes).map((key) => {
                const theme = stickerThemes[key];
                return (
                  <button
                    key={key}
                    onClick={() => setStickerTheme(key)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 12,
                      background: theme.primary,
                      color: '#fff',
                      fontSize: 12,
                      fontWeight: 'bold',
                      border: stickerTheme === key ? '2px solid #ffffff' : 'none',
                    }}
                  >
                    {theme.name}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <button
                style={{
                  flex: 1,
                  background: '#ffffff',
                  color: '#000',
                  padding: 12,
                  borderRadius: 10,
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
                onClick={() => showToast('Holographic Aura Sticker downloaded!')}
              >
                <IoDownloadOutline size={18} />
                <span>Download PNG Sticker</span>
              </button>

              <button
                style={{
                  flex: 1,
                  background: '#E1306C',
                  color: '#fff',
                  padding: 12,
                  borderRadius: 10,
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
                onClick={() => showToast('Instagram Story card ready!')}
              >
                <IoLogoInstagram size={18} />
                <span>Instagram Story</span>
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </AmbientBackground>
  );
}
