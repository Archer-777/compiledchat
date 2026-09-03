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
import {
  Lock,
  LogIn,
  UserPlus,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Cpu,
  Camera,
  Shield,
} from 'lucide-react';
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
  const { isSignedIn, user, isLoaded } = useUser();

  // Helper to determine if user is authenticated (via Clerk or non-guest registered profile)
  const getIsUserAuthenticated = () => {
    if (isSignedIn) return true;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const keys = ['@active_auth_session', '@spiritual_register_user', 'user_profile'];
        for (const key of keys) {
          const raw = window.localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && parsed.email && parsed.isGuest !== true) {
              return true;
            }
          }
        }
      }
    } catch (e) {}
    return false;
  };

  const [isAuthenticated, setIsAuthenticated] = useState(getIsUserAuthenticated);

  // Keep authentication state strictly in sync with Clerk and session cache
  useEffect(() => {
    const authed = getIsUserAuthenticated();
    setIsAuthenticated(authed);
  }, [isSignedIn, user, isLoaded]);

  // Database status
  const [dbInfo, setDbInfo] = useState({ connected: false, mode: 'checking', message: 'Connecting to DB...' });

  // Permissions Modal — strictly false by default for unknown users
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  // Camera & Location
  const [cameraGranted, setCameraGranted] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [permissionError, setPermissionError] = useState(null);

  // Diagnostic Logs
  const [analysisLogs, setAnalysisLogs] = useState(() => {
    const authed = getIsUserAuthenticated();
    return authed
      ? ["Initializing sentiment analysis scanner...", "Awaiting camera activation..."]
      : [
          "Sentiment analysis scanner initialized.",
          "Identity verification required.",
          "Please Sign In or Sign Up to unlock camera & scan.",
        ];
  });
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

  // Trigger camera permission request only AFTER the user is signed in/up
  useEffect(() => {
    if (isAuthenticated && !cameraGranted && !cameraStream && !scanComplete) {
      setShowPermissionModal(true);
    }
  }, [isAuthenticated, cameraGranted, cameraStream, scanComplete]);

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

  // 5. Face Recognition Loop — Runs strictly ONCE after user authentication & camera activation
  useEffect(() => {
    if (isAuthenticated && cameraGranted && cameraStream && calibrationConfirmed && modelsLoaded && !hasScannedRef.current && !isScanningRef.current && !scanComplete) {
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
  }, [isAuthenticated, cameraGranted, cameraStream, calibrationConfirmed, modelsLoaded, scanComplete]);

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

              {!isAuthenticated ? (
                <div className="scanner-auth-lock-overlay">
                  <div className="scanner-lock-badge">
                    <Lock size={26} strokeWidth={1.6} color="#ffffff" />
                  </div>
                  <div className="scanner-auth-tag">
                    AUTHENTICATION REQUIRED
                  </div>
                  <h3 className="scanner-auth-title">
                    Sign In to Unlock AI Scan
                  </h3>
                  <p className="scanner-auth-subtitle">
                    Camera access and biometric sentiment scanning will activate automatically once you sign in.
                  </p>
                  <div className="scanner-auth-helper">
                    <Shield size={12} strokeWidth={2} />
                    <span>Please use the account panel to Sign In or Sign Up</span>
                  </div>
                </div>
              ) : (!cameraGranted || !cameraStream) && (
                <div className="scanner-enable-cam-overlay">
                  <Camera size={52} strokeWidth={1.5} color="#ffffff" style={{ marginBottom: 16 }} />
                  <h3 className="scanner-cam-title">Webcam Access Required</h3>
                  <p className="scanner-cam-subtitle">Enable camera to run neural aura alignment</p>
                  <button className="scanner-enable-cam-btn" onClick={requestPermissions}>
                    <Camera size={16} strokeWidth={2} />
                    <span>Enable Webcam</span>
                  </button>
                </div>
              )}

              {/* Manual Rescan Trigger Button in HUD */}
              {scanComplete && (
                <button onClick={handleRescan} className="scanner-rescan-btn">
                  <RefreshCw size={13} strokeWidth={2} />
                  <span>Rescan Aura</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Control & Results Panel */}
          <div className="scanner-control-panel">
            {/* Prediction Card */}
            <div className="scanner-card scanner-prediction-card">
              <div className="scanner-prediction-meta">
                <span className="scanner-badge">
                  {currentPrediction?.categoryTag?.replace(/^[+✦\s]+/, '') || 'NEURAL RESONANCE'}
                </span>
                <span className="scanner-badge-outline">
                  {currentPrediction?.valenceScore || 94.2}% Valence
                </span>
              </div>

              <h2 className="scanner-archetype-heading">
                {currentPrediction?.archetype || 'Serene Equilibrium'}
              </h2>

              <p className="scanner-archetype-desc">
                {currentPrediction?.summary || 'Calm, centered emotional state and crystalline mental clarity.'}
              </p>
            </div>

            {/* Neural Sentiment Diagnostic Logs */}
            <div className="scanner-card scanner-logs-card">
              <div className="scanner-logs-header">
                <Cpu size={13} strokeWidth={2} />
                <span>NEURAL SENTIMENT LOGS</span>
              </div>
              <div className="scanner-logs-body">
                {analysisLogs.map((log, index) => (
                  <div
                    key={index}
                    className={`scanner-log-item ${index === analysisLogs.length - 1 ? 'latest' : ''}`}
                  >
                    <span className="scanner-log-prefix">&gt;</span>
                    <span className="scanner-log-text">{log.replace(/^[✦⚡✓🔒\s]+/, '')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* User Authentication Card */}
            <div className="scanner-card scanner-auth-card">
              <div className="scanner-section-label">
                <Shield size={13} strokeWidth={2} />
                <span>ACCOUNT AUTHENTICATION</span>
              </div>

              {/* Clerk Sign In / Sign Up Buttons */}
              {!isSignedIn ? (
                <div className="scanner-auth-btn-group">
                  <SignInButton mode="modal">
                    <button className="scanner-signin-btn">
                      <LogIn size={15} strokeWidth={2} />
                      <span>Sign In</span>
                    </button>
                  </SignInButton>

                  <SignUpButton mode="modal">
                    <button className="scanner-signup-btn">
                      <UserPlus size={15} strokeWidth={2} />
                      <span>Sign Up</span>
                    </button>
                  </SignUpButton>
                </div>
              ) : (
                <div className="scanner-signedin-pill">
                  <UserButton afterSignOutUrl="/scan" />
                  <div className="scanner-signedin-info">
                    <div className="scanner-signedin-status">
                      <CheckCircle2 size={14} strokeWidth={2.2} />
                      <span>Signed In via Clerk</span>
                    </div>
                    <span className="scanner-signedin-email">
                      {user?.primaryEmailAddress?.emailAddress || user?.fullName || 'Active Session'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Action Pill Button */}
            <button
              className={`scanner-bottom-action-btn ${scanComplete ? 'active' : 'disabled'}`}
              disabled={!isAuthenticated || !scanComplete}
              onClick={handleContinue}
            >
              {!isAuthenticated ? (
                <>
                  <Lock size={15} strokeWidth={2} />
                  <span>Sign In to Begin AI Scan</span>
                </>
              ) : scanComplete ? (
                <>
                  <span>Continue to Chat</span>
                  <ArrowRight size={16} strokeWidth={2.2} />
                </>
              ) : (
                <>
                  <RefreshCw size={15} strokeWidth={2} className="spin-slow" />
                  <span>Analyzing Sentiment...</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Permission Modal */}
        <Modal isOpen={showPermissionModal} onClose={() => setShowPermissionModal(false)}>
          <div style={{ textAlign: 'center', padding: '10px 4px' }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <Camera size={22} strokeWidth={1.8} color="#ffffff" />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: '700', marginBottom: 8, color: '#ffffff' }}>Camera Access Required</h2>
            <p style={{ fontSize: 13, color: '#a1a1aa', marginBottom: 24, lineHeight: 1.5 }}>
              To calibrate biometric facial sentiment, Next Archer requests front camera access.
            </p>

            <button
              style={{
                width: '100%',
                background: '#ffffff',
                color: '#000000',
                padding: '13px 20px',
                borderRadius: 12,
                fontWeight: '700',
                fontSize: 14,
                cursor: 'pointer',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 14px rgba(255, 255, 255, 0.15)',
              }}
              onClick={requestPermissions}
            >
              <Camera size={16} strokeWidth={2} />
              <span>Allow Camera Access</span>
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
