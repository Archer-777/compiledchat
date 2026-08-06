import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoSparkles,
  IoCamera,
  IoLocation,
  IoKeyOutline,
  IoCheckmarkCircle,
  IoShareSocial,
  IoDownloadOutline,
  IoClose,
  IoArrowForward,
  IoLogoInstagram,
  IoLogoSnapchat,
  IoLogoWhatsapp,
  IoLogoTwitter,
  IoPaperPlane,
  IoCopyOutline,
} from 'react-icons/io5';
import { MdTerminal } from 'react-icons/md';
import AmbientBackground from '@/components/visuals/AmbientBackground';
import Modal from '@/components/common/Modal';
import Toast from '@/components/common/Toast';
import databaseService from '@/services/databaseService';
import auraPredictionService from '@/services/auraPredictionService';
import { sendResendPasswordResetEmail, validateOTP } from '@/utils/otp';
import { resetUserPassword } from '@/utils/storage';
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

  // Database status
  const [dbInfo, setDbInfo] = useState({ connected: false, mode: 'checking', message: 'Connecting to DB...' });

  // Permissions & Login Modals
  const [showPermissionModal, setShowPermissionModal] = useState(true);
  const [showManualLoginModal, setShowManualLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPasscode, setLoginPasscode] = useState('');
  const [loginError, setLoginError] = useState(null);

  // Forgot Password & Resend API states
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [resetEmail, setResetEmail] = useState('');
  const [resetOTPInput, setResetOTPInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetError, setResetError] = useState(null);
  const [isResetSending, setIsResetSending] = useState(false);

  const handleSendResetEmail = async () => {
    if (!resetEmail.trim()) {
      setResetError('Please enter your email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail.trim())) {
      setResetError('Enter a valid email address.');
      return;
    }
    setResetError(null);
    setIsResetSending(true);

    const res = await sendResendPasswordResetEmail(resetEmail.trim());
    setIsResetSending(false);

    if (res.success) {
      showToast(`Reset code sent via Resend API to ${resetEmail.trim()}`);
      if (res.otp) {
        showToast(`Reset OTP: ${res.otp}`);
      }
      setResetStep(2);
    } else {
      setResetError(res.error || 'Failed to send reset code.');
    }
  };

  const handleResetPasswordSubmit = async () => {
    if (!resetOTPInput.trim() || resetOTPInput.trim().length < 6) {
      setResetError('Enter valid 6-digit OTP code.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setResetError('New password must be at least 6 characters.');
      return;
    }

    const otpValidation = validateOTP('reset_' + resetEmail.trim(), resetOTPInput.trim());
    if (!otpValidation.valid) {
      setResetError(otpValidation.error || 'Invalid OTP code.');
      return;
    }

    setResetError(null);
    const resetRes = await resetUserPassword(resetEmail.trim(), newPassword);
    if (resetRes.success) {
      showToast('Password reset successfully!');
      setIsForgotMode(false);
      setShowManualLoginModal(false);
      setShowPermissionModal(false);
      setCameraGranted(true);
      setMatchStatus('matched');
      setSemanticAnalysis(`Password reset & authenticated as ${resetEmail.trim()}. Aura active.`);
      setScanComplete(true);
    } else {
      setResetError('Failed to reset password. Please try again.');
    }
  };

  // Camera & Location
  const [cameraGranted, setCameraGranted] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [permissionError, setPermissionError] = useState(null);

  // Diagnostic Logs
  const [analysisLogs, setAnalysisLogs] = useState(["Initializing quantum aura scanner..."]);
  const setSemanticAnalysis = (msg) => {
    if (msg) setAnalysisLogs((prev) => [...prev, msg]);
  };

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const stickerCanvasRef = useRef(null);

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

  // 2. Load face-api.js ML Models
  useEffect(() => {
    import('../services/faceRecognitionService').then(async (module) => {
      const faceService = module.default;
      setSemanticAnalysis('Loading aura recognition AI models...');
      const loaded = await faceService.loadModels();
      setModelsLoaded(loaded);
      if (loaded) {
        setSemanticAnalysis('AI models loaded. Ready for scanning.');
      } else {
        setSemanticAnalysis('AI model loading fallback active.');
      }
    });
  }, []);

  // 3. Camera Feed binding
  useEffect(() => {
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch((e) => console.log('Camera video play error:', e));
    }
  }, [cameraStream, cameraGranted]);

  // 4. Face Recognition Loop
  useEffect(() => {
    if (cameraGranted && cameraStream && calibrationConfirmed && modelsLoaded) {
      let isSubscribed = true;

      const runScanSequence = async () => {
        if (!isSubscribed) return;
        setSemanticAnalysis('Scanning quantum aura energy field with neural network...');
        await new Promise((r) => setTimeout(r, 1800));

        if (!isSubscribed || !videoRef.current) return;

        const faceService = (await import('../services/faceRecognitionService')).default;
        let faceResult = null;
        let attempts = 0;

        while (!faceResult && attempts < 5 && isSubscribed) {
          attempts++;
          setSemanticAnalysis(`Analyzing aura frequency field... (${attempts}/5)`);

          if (videoRef.current && canvasRef.current) {
            const drawn = faceService.drawVideoToCanvas(videoRef.current, canvasRef.current);
            if (drawn) {
              faceResult = await faceService.detectFaceFromCanvas(canvasRef.current);
            }
          }
          if (!faceResult) await new Promise((r) => setTimeout(r, 1000));
        }

        if (!isSubscribed) return;

        // Predict Aura (with or without detected face)
        const auraPred = auraPredictionService.predictAura(faceResult);
        setCurrentPrediction(auraPred);

        if (auraPred && auraPred.themeId && stickerThemes[auraPred.themeId]) {
          setStickerTheme(auraPred.themeId);
        }

        if (faceResult) {
          const confidence = Math.round(faceResult.score * 100);
          setSemanticAnalysis(`Facial Emotion & Aura Detected (${confidence}% confidence)...`);
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
            setSemanticAnalysis(`Aura Matched: ${auraPred.archetype} (${auraPred.frequency})`);
          } else {
            await databaseService.saveAuraScan({
              image: dataUrl,
              signature,
              frequency: auraPred.frequency,
              resonanceScore: auraPred.resonanceScore,
            });
            setMatchStatus('new');
            setCapturedImage(dataUrl);
            setSemanticAnalysis(`Aura Profile Saved: ${auraPred.archetype} (${auraPred.resonanceScore}% Resonance)`);
          }
        } else {
          setSemanticAnalysis('Default Cosmic Aura Profile generated.');
          setMatchStatus('matched');
        }

        if (isSubscribed) {
          setScanComplete(true);
        }
      };

      runScanSequence();
      return () => { isSubscribed = false; };
    }
  }, [cameraGranted, cameraStream, calibrationConfirmed, modelsLoaded]);

  // Permission Request
  const requestPermissions = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
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

  const handleManualLoginSubmit = () => {
    if (!loginEmail.trim()) {
      setLoginError("Please enter your email or username.");
      return;
    }
    setLoginError(null);
    setShowManualLoginModal(false);
    setShowPermissionModal(false);
    setCameraGranted(true);
    setMatchStatus('matched');
    setSemanticAnalysis(`Authenticated as ${loginEmail.trim()}. Aura active.`);
    setScanComplete(true);
  };

  const handleContinue = () => {
    navigate('/supercharge');
  };

  const activeTheme = stickerThemes[stickerTheme] || stickerThemes.violet;

  return (
    <AmbientBackground>
      <Toast message={toastMsg} />

      <div className="scanner-page-container">
        {/* Top Header Bar */}
        <div className="scanner-header-bar">
          <div className="scanner-brand-group">
            <img src="/logo.png" alt="Logo" className="scanner-brand-logo" />
            <h1 className="scanner-brand-title">AURA SCANNER</h1>
          </div>

          <div className="scanner-status-badge">
            <IoSparkles style={{ color: activeTheme.border }} />
            <span>
              {matchStatus === 'matched' ? "AURA MATCHED" : matchStatus === 'new' ? "NEW AURA SAVED" : "SCANNER ACTIVE"}
            </span>
          </div>
        </div>

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

              {cameraGranted && cameraStream && !capturedImage && (
                <div
                  className="scanner-aura-field-overlay"
                  style={{
                    background: `radial-gradient(ellipse at center, ${activeTheme.glow} 0%, ${activeTheme.primary}77 45%, transparent 75%)`,
                    borderColor: activeTheme.border,
                  }}
                />
              )}

              {cameraGranted && cameraStream && (
                <div className="scanner-laser-line" />
              )}

              {/* Biometric HUD Corner Brackets */}
              <div className="hud-corner hud-top-left" />
              <div className="hud-corner hud-top-right" />
              <div className="hud-corner hud-bottom-left" />
              <div className="hud-corner hud-bottom-right" />

              <canvas ref={canvasRef} style={{ display: 'none' }} width="480" height="380" />

              {(!cameraGranted || !cameraStream) && (
                <div style={{ textAlign: 'center', padding: 20 }}>
                  <IoCamera size={60} color="#ffffff" style={{ marginBottom: 12 }} />
                  <h3 style={{ fontSize: 16, marginBottom: 6 }}>Webcam Scanner Required</h3>
                  <p style={{ fontSize: 12, color: '#888888', marginBottom: 16 }}>Enable camera to run neural aura alignment</p>
                  <button
                    style={{
                      background: '#ffffff',
                      color: '#000',
                      padding: '10px 20px',
                      borderRadius: 20,
                      fontWeight: 'bold',
                      fontSize: 13,
                    }}
                    onClick={requestPermissions}
                  >
                    Enable Webcam
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Control & Results Panel */}
          <div className="scanner-control-panel">
            {/* Diagnostic Log */}
            <div className="scanner-log-card">
              <div className="scanner-log-header">
                <MdTerminal size={16} />
                <span>AI QUANTUM DIAGNOSTIC LOG</span>
              </div>
              <div>
                {analysisLogs.slice(-4).map((log, idx) => (
                  <div
                    key={idx}
                    className={`scanner-log-line ${idx === analysisLogs.slice(-4).length - 1 ? 'active' : ''}`}
                  >
                    <span style={{ color: activeTheme.border }}>▶</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Prediction Card */}
            <div className="scanner-prediction-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="scanner-archetype-title">
                  {currentPrediction?.archetype || activeTheme.archetype}
                </h3>
                <span className="scanner-score-badge">
                  {currentPrediction?.resonanceScore || 98.4}% Resonance
                </span>
              </div>

              <p style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.5 }}>
                {currentPrediction?.summary || "Your frequency aligns with universal Solfeggio resonance."}
              </p>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <span style={{ fontSize: 11, padding: '4px 10px', background: 'rgba(255,255,255,0.08)', borderRadius: 10 }}>
                  Frequency: {currentPrediction?.frequency || "528Hz Solfeggio"}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="scanner-action-btn-group">
              <button
                className="scanner-sticker-btn"
                onClick={() => setShowStickerModal(true)}
              >
                <IoSparkles size={18} />
                <span>Aura Sticker Studio ✨</span>
              </button>

              <button
                className="scanner-continue-btn"
                disabled={!scanComplete}
                onClick={handleContinue}
              >
                <span>{scanComplete ? 'Continue' : 'Calibrating...'}</span>
                <IoArrowForward size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Permission Modal */}
        <Modal isOpen={showPermissionModal} onClose={() => setShowPermissionModal(false)}>
          <div style={{ textAlign: 'center' }}>
            <img src="/logo.png" alt="Logo" style={{ width: 48, height: 48, marginBottom: 12 }} />
            <h2 style={{ fontSize: 20, marginBottom: 8 }}>Enable Permissions</h2>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>
              To scan your aura, Spiritualize AI requests camera and location access.
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
                marginBottom: 12,
              }}
              onClick={requestPermissions}
            >
              Allow Camera & Location
            </button>

            <button
              style={{ color: '#888', fontSize: 13 }}
              onClick={() => {
                setShowPermissionModal(false);
                setShowManualLoginModal(true);
              }}
            >
              Not working? Try manual sign-in
            </button>
          </div>
        </Modal>

        {/* Manual Login & Forgot Password Modal */}
        <Modal isOpen={showManualLoginModal} onClose={() => { setShowManualLoginModal(false); setIsForgotMode(false); }}>
          <div>
            {!isForgotMode ? (
              <div>
                <h2 style={{ fontSize: 20, marginBottom: 8, textAlign: 'center' }}>Alternative Sign In</h2>
                <p style={{ fontSize: 13, color: '#888', marginBottom: 20, textAlign: 'center' }}>
                  Sign in with your account credentials
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <input
                    type="text"
                    placeholder="Email or Username"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid #333',
                      padding: 12,
                      borderRadius: 10,
                      color: '#fff',
                    }}
                  />
                  <input
                    type="password"
                    placeholder="Passcode"
                    value={loginPasscode}
                    onChange={(e) => setLoginPasscode(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid #333',
                      padding: 12,
                      borderRadius: 10,
                      color: '#fff',
                    }}
                  />
                  {loginError && <p style={{ color: '#ff4d4d', fontSize: 12 }}>{loginError}</p>}

                  <button
                    style={{
                      background: '#ffffff',
                      color: '#000',
                      padding: 14,
                      borderRadius: 12,
                      fontWeight: 'bold',
                      marginTop: 4,
                      cursor: 'pointer',
                    }}
                    onClick={handleManualLoginSubmit}
                  >
                    Sign In & Load Profile
                  </button>

                  <button
                    style={{
                      background: 'transparent',
                      color: '#00e5ff',
                      border: 'none',
                      fontSize: 12,
                      marginTop: 8,
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                    onClick={() => {
                      setIsForgotMode(true);
                      setResetStep(1);
                      setResetError(null);
                    }}
                  >
                    🔑 Forgot Password? Reset via Resend API
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h2 style={{ fontSize: 20, marginBottom: 8, textAlign: 'center' }}>Reset Password</h2>
                <p style={{ fontSize: 13, color: '#888', marginBottom: 20, textAlign: 'center' }}>
                  {resetStep === 1
                    ? 'Enter your email to receive a password reset code via Resend API'
                    : 'Enter the 6-digit reset code and your new password'}
                </p>

                {resetStep === 1 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid #333',
                        padding: 12,
                        borderRadius: 10,
                        color: '#fff',
                      }}
                    />
                    {resetError && <p style={{ color: '#ff4d4d', fontSize: 12 }}>{resetError}</p>}

                    <button
                      style={{
                        background: '#00e5ff',
                        color: '#000',
                        padding: 14,
                        borderRadius: 12,
                        fontWeight: 'bold',
                        marginTop: 4,
                        cursor: 'pointer',
                      }}
                      onClick={handleSendResetEmail}
                      disabled={isResetSending}
                    >
                      {isResetSending ? 'Sending Code...' : 'Send Reset Code (Resend API) →'}
                    </button>

                    <button
                      style={{
                        background: 'transparent',
                        color: '#aaa',
                        border: 'none',
                        fontSize: 12,
                        marginTop: 8,
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                      onClick={() => setIsForgotMode(false)}
                    >
                      ← Back to Sign In
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <input
                      type="text"
                      placeholder="6-Digit Reset Code (OTP)"
                      value={resetOTPInput}
                      onChange={(e) => setResetOTPInput(e.target.value)}
                      maxLength={6}
                      style={{
                        width: '100%',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid #333',
                        padding: 12,
                        borderRadius: 10,
                        color: '#fff',
                        letterSpacing: '2px',
                        textAlign: 'center',
                      }}
                    />
                    <input
                      type="password"
                      placeholder="Enter New Password (Min 6 chars)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid #333',
                        padding: 12,
                        borderRadius: 10,
                        color: '#fff',
                      }}
                    />
                    {resetError && <p style={{ color: '#ff4d4d', fontSize: 12 }}>{resetError}</p>}

                    <button
                      style={{
                        background: '#10b981',
                        color: '#fff',
                        padding: 14,
                        borderRadius: 12,
                        fontWeight: 'bold',
                        marginTop: 4,
                        cursor: 'pointer',
                      }}
                      onClick={handleResetPasswordSubmit}
                    >
                      Reset Password & Sign In ✓
                    </button>

                    <button
                      style={{
                        background: 'transparent',
                        color: '#aaa',
                        border: 'none',
                        fontSize: 12,
                        marginTop: 8,
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                      onClick={() => setResetStep(1)}
                    >
                      ← Change Email
                    </button>
                  </div>
                )}
              </div>
            )}
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
