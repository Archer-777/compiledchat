import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  StatusBar,
  Animated,
  Easing,
  Alert,
  Image,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../theme/colors';
import databaseService from '../services/databaseService';

const AuraScannerScreen = ({ navigation }) => {
  // Database status state
  const [dbInfo, setDbInfo] = useState({ connected: false, mode: 'checking', message: 'Connecting to DB...' });

  // 1. Existing State & Animations
  const glowOpacity = useRef(new Animated.Value(0.4)).current;
  const laserAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(laserAnim, {
          toValue: 310,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(laserAnim, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const [showPermissionModal, setShowPermissionModal] = useState(true);
  const [showManualLoginModal, setShowManualLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPasscode, setLoginPasscode] = useState('');
  const [loginError, setLoginError] = useState(null);

  const [cameraGranted, setCameraGranted] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [permissionError, setPermissionError] = useState(null);
  const [analysisLogs, setAnalysisLogs] = useState(["Initializing quantum aura scanner..."]);
  const setSemanticAnalysis = (msg) => {
    if (msg) setAnalysisLogs((prev) => [...prev, msg]);
  };
  const semanticAnalysis = analysisLogs[analysisLogs.length - 1] || "Scanner active";
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // New States for Face Matching & Calibration
  const [calibrationConfirmed, setCalibrationConfirmed] = useState(true);
  const [capturedImage, setCapturedImage] = useState(null);
  const [matchStatus, setMatchStatus] = useState(null); // 'matched' or 'new'
  const [scanComplete, setScanComplete] = useState(false);

  // Aura Sticker Studio & Social Share States
  const [showStickerModal, setShowStickerModal] = useState(false);
  const [stickerTheme, setStickerTheme] = useState('violet'); // 'violet', 'indigo', 'gold', 'emerald', 'rose'
  const [stickerUsername, setStickerUsername] = useState('@username');
  const [toastMsg, setToastMsg] = useState(null);
  const [photoScale, setPhotoScale] = useState(1.0);
  const [photoFrameSize, setPhotoFrameSize] = useState(130);
  const stickerCanvasRef = useRef(null);

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
      accent: '#e9d5ff',
      icon: 'sparkles',
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
      accent: '#c7d2fe',
      icon: 'planet-outline',
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
      accent: '#fef3c7',
      icon: 'sunny-outline',
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
      accent: '#d1fae5',
      icon: 'leaf-outline',
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
      accent: '#ffe4e6',
      icon: 'heart-outline',
    },
  };

  const semanticPhrases = [
    "Aligning consciousness field...",
    "Scanning aura frequency range: 432Hz - 963Hz...",
    "Extracting neural feedback maps...",
    "Consciousness level: Stage 7 (Transcendent)...",
    "Aura density check: 98.4% (Highly aligned)...",
    "Spectral refraction complete.",
  ];

  useEffect(() => {
    databaseService.checkConnection().then((res) => {
      setDbInfo(res);
    });
  }, []);


  // Face-api.js model loading state
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);

  // Load face-api.js neural network models on mount
  useEffect(() => {
    if (Platform.OS === 'web') {
      import('../services/faceRecognitionService').then(async (module) => {
        const faceService = module.default;
        console.log('[FaceAPI] Loading neural network models...');
        setSemanticAnalysis('Loading aura recognition AI models...');
        const loaded = await faceService.loadModels();
        setModelsLoaded(loaded);
        if (loaded) {
          console.log('[FaceAPI] Models ready');
          setSemanticAnalysis('AI models loaded. Ready for scanning.');
        } else {
          console.error('[FaceAPI] Model loading failed');
          setSemanticAnalysis('AI model loading failed. Using fallback mode.');
        }
      });
    }
  }, []);

  useEffect(() => {
    if (cameraGranted && cameraStream && calibrationConfirmed && modelsLoaded) {
      let isSubscribed = true;

      const runFaceRecognition = async () => {
        // Step 1: Initial neural setup message
        if (!isSubscribed) return;
        setSemanticAnalysis('Initializing neural aura detection & frequency sensor...');
        await new Promise((r) => setTimeout(r, 2200));

        // Step 2: Scanning neural aura message
        if (!isSubscribed) return;
        setSemanticAnalysis('Scanning quantum aura energy field with neural network...');
        await new Promise((r) => setTimeout(r, 2200));

        if (!isSubscribed || !videoRef.current) return;

        // Step 3: Detect face using real face-api.js
        const faceService = (await import('../services/faceRecognitionService')).default;
        let faceResult = null;
        let attempts = 0;
        const maxAttempts = 8;

        while (!faceResult && attempts < maxAttempts && isSubscribed) {
          attempts++;
          setSemanticAnalysis(`Analyzing aura frequency field... (step ${attempts}/${maxAttempts})`);

          if (videoRef.current && canvasRef.current) {
            const drawn = faceService.drawVideoToCanvas(videoRef.current, canvasRef.current);
            if (drawn) {
              faceResult = await faceService.detectFaceFromCanvas(canvasRef.current);
            }
          }

          if (!faceResult) {
            await new Promise((r) => setTimeout(r, 1200));
          }
        }

        if (!isSubscribed) return;

        if (!faceResult) {
          setSemanticAnalysis('No aura detected. Please center yourself in clear lighting.');
          setFaceDetected(false);
          setScanComplete(true);
          return;
        }

        // Face detected! Extract 128-D descriptor & Emotion analysis
        setFaceDetected(true);
        const descriptor = Array.from(faceResult.descriptor); // Float32Array -> number[]
        const confidence = Math.round(faceResult.score * 100);
        const dominantEmotion = faceResult.dominantEmotion;
        const emotionName = dominantEmotion ? dominantEmotion.expression.toUpperCase() : 'CALM';

        setSemanticAnalysis(`Facial Emotion & Aura Detected: ${emotionName} (${confidence}% confidence)...`);
        await new Promise((r) => setTimeout(r, 2400));

        // Step 4: Run Aura Prediction Engine based on emotion analysis & facial features
        const { auraPredictionService } = await import('../services/auraPredictionService');
        const auraPrediction = auraPredictionService.predictAura(faceResult);

        // Update selected theme to match predicted aura (Cosmic Violet, Quantum Indigo, Solfeggio Gold, etc.)
        if (auraPrediction && auraPrediction.themeId && stickerThemes[auraPrediction.themeId]) {
          setStickerTheme(auraPrediction.themeId);
        }

        setSemanticAnalysis(`Predicting Aura Archetype: ${auraPrediction.archetype} (${auraPrediction.frequency})...`);
        await new Promise((r) => setTimeout(r, 2400));

        // Create signature object with real 128-D descriptor, emotion analysis, and predicted aura metadata
        const signature = {
          descriptor,
          emotion: dominantEmotion,
          expressions: faceResult.expressions,
          auraPrediction: auraPrediction,
        };

        // Step 5: Match against stored faces in Supabase/localStorage
        const matchResult = await databaseService.findMatchingAuraScan(signature);

        if (!isSubscribed) return;

        // Step 6: Capture snapshot with high-performance background removal & glowing cosmic aura compositing
        let dataUrl = null;
        if (canvasRef.current && videoRef.current) {
          const currentTheme = stickerThemes[auraPrediction.themeId] || stickerThemes.violet;
          dataUrl = faceService.removeBackgroundAndCompositeAura(
            canvasRef.current,
            videoRef.current,
            faceResult,
            currentTheme
          );
        }

        if (matchResult && matchResult.match) {
          // Known face found in database
          setMatchStatus('matched');
          setCapturedImage(dataUrl);
          setSemanticAnalysis(`Aura Matched: ${auraPrediction.archetype} (${auraPrediction.frequency})`);
          console.log(`[FaceAPI] MATCHED! Score: ${matchResult.score}%, Archetype: ${auraPrediction.archetype}`);
        } else {
          // New face - save to Supabase with real 128-D descriptor & predicted aura profile
          await databaseService.saveAuraScan({
            image: dataUrl,
            signature: signature,
            frequency: auraPrediction.frequency,
            resonanceScore: auraPrediction.resonanceScore,
          });
          setMatchStatus('new');
          setCapturedImage(dataUrl);
          setSemanticAnalysis(`Aura Profile Saved: ${auraPrediction.archetype} (${auraPrediction.resonanceScore}% Resonance)`);
          console.log(`[FaceAPI] NEW AURA registered! Predicted theme: ${auraPrediction.themeId}, Score: ${auraPrediction.resonanceScore}%`);
        }

        // Final holding display
        await new Promise((r) => setTimeout(r, 2500));
        if (!isSubscribed) return;
        setSemanticAnalysis('Aura scanning complete. Alignment saved!');
        setScanComplete(true);

        // Final
        await new Promise((r) => setTimeout(r, 1500));
        if (!isSubscribed) return;
        setSemanticAnalysis('Scan complete.');
        setScanComplete(true);
      };

      runFaceRecognition();
      return () => {
        isSubscribed = false;
      };
    } else if (cameraGranted && cameraStream && calibrationConfirmed && !modelsLoaded) {
      setSemanticAnalysis('Loading face recognition models...');
      setScanComplete(false);
    } else {
      setSemanticAnalysis('Waiting for camera...');
      setScanComplete(false);
    }
  }, [cameraGranted, cameraStream, calibrationConfirmed, modelsLoaded]);

  // Bind camera stream to video element
  useEffect(() => {
    if (Platform.OS === 'web' && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch((e) => console.log('Camera video play error:', e));
    }
  }, [cameraStream, cameraGranted]);

  // 2. Premium Entrance Animations
  const headerTranslateY = useRef(new Animated.Value(-20)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  const scannerScale = useRef(new Animated.Value(0.92)).current;
  const scannerOpacity = useRef(new Animated.Value(0)).current;

  const bottomTranslateY = useRef(new Animated.Value(25)).current;
  const bottomOpacity = useRef(new Animated.Value(0)).current;

  // 3. Aura Field & Button Pulse Animations
  const auraPulseScale = useRef(new Animated.Value(0.85)).current;
  const auraPulseOpacity = useRef(new Animated.Value(0.3)).current;
  const buttonPulse = useRef(new Animated.Value(1)).current;
  const modalScale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    // --- Entrance Cascade ---
    Animated.stagger(150, [
      Animated.parallel([
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(headerTranslateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(scannerOpacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.spring(scannerScale, {
          toValue: 1,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(bottomOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(bottomTranslateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // --- Modal Pop-in ---
    Animated.spring(modalScale, {
      toValue: 1,
      friction: 6,
      tension: 60,
      useNativeDriver: true,
    }).start();

    // --- Continuous Glow & Scan Line Loop ---
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0.4,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    ).start();



    // --- Dynamic Aura Pulse Loop ---
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(auraPulseScale, {
            toValue: 1.25,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(auraPulseScale, {
            toValue: 0.85,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(auraPulseOpacity, {
            toValue: 0.7,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(auraPulseOpacity, {
            toValue: 0.2,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    // --- Continue Button Gentle Breathing Loop ---
    Animated.loop(
      Animated.sequence([
        Animated.timing(buttonPulse, {
          toValue: 1.02,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(buttonPulse, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const requestPermissions = async () => {
    let cam = false;
    let loc = false;

    // Web Camera Permission request
    if (Platform.OS === 'web' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        cam = true;
        setCameraGranted(true);
        setCameraStream(stream);
        setPermissionError(null);
      } catch (err) {
        console.log('Camera permission prompt/denied:', err);
        if (err.name === 'NotReadableError' || err.message.indexOf('in use') !== -1) {
          setPermissionError("Webcam is already in use by another tab or app. Please close other camera apps and retry.");
        } else {
          setPermissionError("Camera access is required to scan your aura.");
        }
      }
    } else {
      cam = true;
      setCameraGranted(true);
      setPermissionError(null);
    }

    // Web Location Permission request
    if (Platform.OS === 'web' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          loc = true;
          setLocationGranted(true);
        },
        (err) => {
          console.log('Location permission error:', err);
        }
      );
      loc = true;
      setLocationGranted(true);
    } else {
      loc = true;
      setLocationGranted(true);
    }

    setTimeout(() => {
      setShowPermissionModal(false);
    }, 600);
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
    setCalibrationConfirmed(true);
    setMatchStatus('matched');
    setSemanticAnalysis(`Authenticated as ${loginEmail.trim()}. Aura field ready.`);
    setScanComplete(true);
  };

  const handleContinue = () => {
    if (!scanComplete) {
      Alert.alert("Calibrating Aura", "Please wait until the aura scanner has completed calibration.");
      return;
    }
    if (navigation && navigation.navigate) {
      navigation.navigate('Supercharge');
    } else {
      Alert.alert('Navigation', 'Proceeding to Supercharge screen');
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  const handleUploadPhoto = () => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            setCapturedImage(event.target.result);
            showToast('Photo updated successfully! ✨');
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    } else {
      Alert.alert('Upload Photo', 'Tap camera scanner on main screen to capture face photo.');
    }
  };

  const generateStickerCanvas = () => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return null;
    const theme = stickerThemes[stickerTheme] || stickerThemes.violet;
    const canvas = stickerCanvasRef.current || document.createElement('canvas');
    canvas.width = 840;
    canvas.height = 1280;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.clearRect(0, 0, 840, 1280);

    const pad = 20;
    const stickerW = 840 - pad * 2;
    const stickerH = 1280 - pad * 2;
    const stickerRx = 60;

    // 1. Pristine Off-White Linen Canvas Background (#f7f6f2)
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 16;

    ctx.fillStyle = '#f7f6f2';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(pad, pad, stickerW, stickerH, stickerRx);
    else ctx.rect(pad, pad, stickerW, stickerH);
    ctx.fill();
    ctx.shadowColor = 'transparent';

    ctx.save();
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(pad, pad, stickerW, stickerH, stickerRx);
    else ctx.rect(pad, pad, stickerW, stickerH);
    ctx.clip();

    // 2. Decorative Side Swooping Lines in Aura Theme Border Color
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 8;
    ctx.globalAlpha = 0.8;

    // Left Line Arc & Bottom Hook
    ctx.beginPath();
    ctx.arc(pad - 110, pad + 450, 260, -Math.PI * 0.45, Math.PI * 0.45, false);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(pad + 80, pad + 780, 140, 0, Math.PI * 0.5, false);
    ctx.stroke();

    // Right Line Arc & Bottom Hook
    ctx.beginPath();
    ctx.arc(pad + stickerW + 110, pad + 450, 260, Math.PI * 0.55, Math.PI * 1.45, false);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(pad + stickerW - 80, pad + 780, 140, Math.PI * 0.5, Math.PI, false);
    ctx.stroke();

    ctx.globalAlpha = 1.0;

    // 3. Top Header: Official App Logo Image + Title "Next Archer"
    const logoImg = new window.Image();
    logoImg.src = require('../../assets/logo.png');
    try {
      ctx.drawImage(logoImg, 180, 85, 78, 78);
    } catch (e) {}

    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 64px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.fillText('Next Archer', 276, 146);

    // 3b. Aura Energy Pill Badge
    const badgeW = 480;
    const badgeH = 50;
    const badgeX = (840 - badgeW) / 2;
    const badgeY = 195;

    ctx.fillStyle = theme.badgeBg || 'rgba(139, 92, 246, 0.15)';
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 3;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 25);
    else ctx.rect(badgeX, badgeY, badgeW, badgeH);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = theme.primary || '#8b5cf6';
    ctx.font = 'bold 22px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(`✨ ${theme.name.toUpperCase()} • ${theme.title}`, 420, badgeY + 33);

    // 4. Photo Frame Circle (Theme Glowing Aura Ring & White Inner Border)
    const frameScaleMultiplier = photoFrameSize / 130;
    const pCenterX = 420;
    const pCenterY = 560;
    const pRadius = 220 * frameScaleMultiplier;

    const ringGrad = ctx.createLinearGradient(pCenterX - pRadius, pCenterY - pRadius, pCenterX + pRadius, pCenterY + pRadius);
    ringGrad.addColorStop(0, theme.border);
    ringGrad.addColorStop(0.5, '#ffffff');
    ringGrad.addColorStop(1, theme.primary);

    ctx.shadowColor = theme.border;
    ctx.shadowBlur = 35;
    ctx.shadowOffsetY = 12;
    ctx.fillStyle = ringGrad;
    ctx.beginPath();
    ctx.arc(pCenterX, pCenterY, pRadius + 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = 'transparent';

    // White 12px Inner Ring Border
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(pCenterX, pCenterY, pRadius + 2, 0, Math.PI * 2);
    ctx.fill();

    // Photo Cutout
    ctx.save();
    ctx.beginPath();
    ctx.arc(pCenterX, pCenterY, pRadius - 10, 0, Math.PI * 2);
    ctx.clip();

    if (capturedImage) {
      const userImg = new window.Image();
      userImg.src = capturedImage;
      try {
        const drawRadius = pRadius - 10;
        const drawW = drawRadius * 2 * photoScale;
        const drawH = drawRadius * 2 * photoScale;
        const drawX = pCenterX - drawW / 2;
        const drawY = pCenterY - drawH / 2;
        ctx.drawImage(userImg, drawX, drawY, drawW, drawH);
      } catch (e) {
        ctx.fillStyle = '#e5e3dc';
        ctx.fillRect(pCenterX - pRadius, pCenterY - pRadius, pRadius * 2, pRadius * 2);
      }
    } else {
      ctx.fillStyle = '#e5e3dc';
      ctx.fillRect(pCenterX - pRadius, pCenterY - pRadius, pRadius * 2, pRadius * 2);
      ctx.fillStyle = theme.primary;
      ctx.font = 'bold 110px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('👤', pCenterX, pCenterY + 38);
    }
    ctx.restore();

    // 5. Username Pill Box
    const pillW = 440;
    const pillH = 90;
    const pillX = (840 - pillW) / 2;
    const pillY = 880;

    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 6;
    ctx.fillStyle = '#f7f6f2';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(pillX, pillY, pillW, pillH, 45);
    else ctx.rect(pillX, pillY, pillW, pillH);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1a1a1a';
    ctx.font = '600 42px Georgia, serif';
    ctx.textAlign = 'center';
    const displayUsername = stickerUsername || (loginEmail ? `@${loginEmail.split('@')[0]}` : '@username');
    ctx.fillText(displayUsername, 420, pillY + 58);

    // 6. Hashtags Footer Text
    ctx.fillStyle = '#222222';
    ctx.font = '30px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('#AuraFarming #ConsciousComputing #Ideawarfare', 420, 1180);

    ctx.restore();

    return canvas;
  };

  const generateStoryCanvas = (platformName = 'Instagram') => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return null;
    const theme = stickerThemes[stickerTheme] || stickerThemes.violet;
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // 1. Pristine Linen Background (#f7f6f2)
    ctx.fillStyle = '#f7f6f2';
    ctx.fillRect(0, 0, 1080, 1920);

    // 2. Decorative Side Swooping Lines in Aura Theme Border Color
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 12;
    ctx.globalAlpha = 0.8;

    ctx.beginPath();
    ctx.arc(-140, 750, 420, -Math.PI * 0.45, Math.PI * 0.45, false);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(1080 + 140, 750, 420, Math.PI * 0.55, Math.PI * 1.45, false);
    ctx.stroke();

    ctx.globalAlpha = 1.0;

    // 3. Top Header: Official App Logo Image + Title "Next Archer"
    const logoImg = new window.Image();
    logoImg.src = require('../../assets/logo.png');
    try {
      ctx.drawImage(logoImg, 220, 150, 110, 110);
    } catch (e) {}

    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 90px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.fillText('Next Archer', 355, 235);

    // 3b. Badge
    ctx.fillStyle = theme.primary;
    ctx.font = 'bold 36px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(`OFFICIAL ${platformName.toUpperCase()} STORY STICKER • ${theme.name.toUpperCase()}`, 540, 320);

    // 4. Circular Photo Frame with Theme Metallic Ring & White Border
    const frameScaleMultiplier = photoFrameSize / 130;
    const pCenterX = 540;
    const pCenterY = 860;
    const pRadius = 340 * frameScaleMultiplier;

    const ringGrad = ctx.createLinearGradient(pCenterX - pRadius, pCenterY - pRadius, pCenterX + pRadius, pCenterY + pRadius);
    ringGrad.addColorStop(0, theme.border);
    ringGrad.addColorStop(0.5, '#ffffff');
    ringGrad.addColorStop(1, theme.primary);

    ctx.shadowColor = theme.border;
    ctx.shadowBlur = 45;
    ctx.shadowOffsetY = 18;
    ctx.fillStyle = ringGrad;
    ctx.beginPath();
    ctx.arc(pCenterX, pCenterY, pRadius + 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = 'transparent';

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(pCenterX, pCenterY, pRadius + 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.beginPath();
    ctx.arc(pCenterX, pCenterY, pRadius - 14, 0, Math.PI * 2);
    ctx.clip();

    if (capturedImage) {
      const userImg = new window.Image();
      userImg.src = capturedImage;
      try {
        const drawRadius = pRadius - 14;
        const drawW = drawRadius * 2 * photoScale;
        const drawH = drawRadius * 2 * photoScale;
        const drawX = pCenterX - drawW / 2;
        const drawY = pCenterY - drawH / 2;
        ctx.drawImage(userImg, drawX, drawY, drawW, drawH);
      } catch (e) {
        ctx.fillStyle = '#e5e3dc';
        ctx.fillRect(pCenterX - pRadius, pCenterY - pRadius, pRadius * 2, pRadius * 2);
      }
    } else {
      ctx.fillStyle = '#e5e3dc';
      ctx.fillRect(pCenterX - pRadius, pCenterY - pRadius, pRadius * 2, pRadius * 2);
      ctx.fillStyle = theme.primary;
      ctx.font = 'bold 160px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('👤', pCenterX, pCenterY + 55);
    }
    ctx.restore();

    // 5. Username Pill Box
    const pillW = 620;
    const pillH = 130;
    const pillX = (1080 - pillW) / 2;
    const pillY = 1320;

    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 8;
    ctx.fillStyle = '#f7f6f2';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(pillX, pillY, pillW, pillH, 65);
    else ctx.rect(pillX, pillY, pillW, pillH);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1a1a1a';
    ctx.font = '600 58px Georgia, serif';
    ctx.textAlign = 'center';
    const displayUsername = stickerUsername || (loginEmail ? `@${loginEmail.split('@')[0]}` : '@username');
    ctx.fillText(displayUsername, 540, pillY + 84);

    // 6. Hashtags Footer Text
    ctx.fillStyle = '#222222';
    ctx.font = '36px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('#AuraFarming #ConsciousComputing #Ideawarfare', 540, 1750);

    return canvas;
  };

  const handleDownloadSticker = () => {
    try {
      const canvas = generateStickerCanvas();
      if (!canvas) {
        showToast('Sticker download ready on web device!');
        return;
      }
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `AuraSticker_SpiritualizeAI_${stickerTheme}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('🎉 Holographic Aura Sticker saved!');
    } catch (e) {
      console.error('Download sticker error:', e);
      showToast('Downloaded sticker snapshot.');
    }
  };

  const handleInstagramShare = async () => {
    try {
      const canvas = generateStoryCanvas('Instagram');
      if (canvas) {
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `AuraStory_Instagram_${stickerTheme}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      if (typeof window !== 'undefined') {
        window.open('https://www.instagram.com', '_blank');
      }
      showToast('📸 HD Story Card downloaded! Share to Instagram Stories.');
    } catch (e) {
      showToast('📸 Instagram Story Card saved!');
    }
  };

  const handleSnapchatShare = async () => {
    try {
      const canvas = generateStoryCanvas('Snapchat');
      if (canvas) {
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `AuraStory_Snapchat_${stickerTheme}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      if (typeof window !== 'undefined') {
        window.open('https://www.snapchat.com', '_blank');
      }
      showToast('👻 HD Story Card downloaded! Share to Snapchat.');
    } catch (e) {
      showToast('👻 Snapchat Story Card saved!');
    }
  };

  const handleShareSticker = async () => {
    const shareText = `🔮 My Aura Scan: 98.4% Resonance | 528Hz Solfeggio Alignment on Spiritualize AI! ✨\nCheck your aura now:`;
    const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://spiritualize.ai';

    if (Platform.OS === 'web' && navigator.share) {
      try {
        const canvas = generateStickerCanvas();
        if (canvas && navigator.canShare) {
          canvas.toBlob(async (blob) => {
            if (blob) {
              const file = new File([blob], 'AuraSticker.png', { type: 'image/png' });
              if (navigator.canShare({ files: [file] })) {
                await navigator.share({
                  title: 'My Aura Sticker - Spiritualize AI',
                  text: shareText,
                  files: [file],
                });
                showToast('Shared successfully! 🌟');
                return;
              }
            }
            await navigator.share({
              title: 'My Aura Sticker - Spiritualize AI',
              text: shareText,
              url: shareUrl,
            });
            showToast('Shared successfully! 🌟');
          });
        } else {
          await navigator.share({
            title: 'My Aura Sticker - Spiritualize AI',
            text: shareText,
            url: shareUrl,
          });
          showToast('Shared successfully! 🌟');
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    const shareText = `🔮 My Aura Scan: 98.4% Resonance | 528Hz Solfeggio Alignment on Spiritualize AI! ✨`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        showToast('📋 Aura result copied to clipboard!');
      });
    } else {
      showToast('Copied to clipboard!');
    }
  };

  const handleSocialDirectShare = (platform) => {
    if (platform === 'instagram') {
      handleInstagramShare();
      return;
    }
    if (platform === 'snapchat') {
      handleSnapchatShare();
      return;
    }

    const shareText = encodeURIComponent(`🔮 I scanned my Aura on Spiritualize AI! Resonance: 98.4% | 528Hz Solfeggio Alignment. Create your Aura Sticker now!`);
    const url = encodeURIComponent(typeof window !== 'undefined' ? window.location.href : 'https://spiritualize.ai');

    let targetUrl = '';
    if (platform === 'whatsapp') {
      targetUrl = `https://api.whatsapp.com/send?text=${shareText}%20${url}`;
    } else if (platform === 'twitter') {
      targetUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${url}`;
    } else if (platform === 'telegram') {
      targetUrl = `https://t.me/share/url?url=${url}&text=${shareText}`;
    }

    if (targetUrl && typeof window !== 'undefined') {
      window.open(targetUrl, '_blank');
      showToast(`Opening ${platform.toUpperCase()} share...`);
    }
  };

  const activeTheme = stickerThemes[stickerTheme] || stickerThemes.violet;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Animated Permission Modal */}
      <Modal
        visible={showPermissionModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPermissionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[styles.modalContainer, { transform: [{ scale: modalScale }] }]}
          >
            <Image
              source={require('../../assets/logo.png')}
              style={{ width: 44, height: 44, alignSelf: 'center', marginBottom: 12 }}
              resizeMode="contain"
            />
            <Text style={styles.modalTitle}>Enable Permissions</Text>
            <Text style={styles.modalSubtitle}>
              To scan your aura and align your consciousness field, Spiritualize AI requests camera and location access.
            </Text>

             {/* Camera Row */}
            <View style={styles.permissionRow}>
              <View style={styles.permissionIconCircle}>
                <Ionicons name="camera" size={24} color="#ffffff" />
              </View>
              <View style={styles.permissionTextGroup}>
                <Text style={styles.permissionLabel}>Camera Access</Text>
                <Text style={styles.permissionDesc}>Required for real-time Aura Scanner & Aura Detection</Text>
              </View>
              <Ionicons
                name={cameraGranted ? 'checkmark-circle' : 'ellipse-outline'}
                size={22}
                color={cameraGranted ? '#ffffff' : '#444444'}
              />
            </View>

            {/* Location Row */}
            <View style={styles.permissionRow}>
              <View style={styles.permissionIconCircle}>
                <Ionicons name="location" size={24} color="#ffffff" />
              </View>
              <View style={styles.permissionTextGroup}>
                <Text style={styles.permissionLabel}>Location Access</Text>
                <Text style={styles.permissionDesc}>Required for regional energy & environmental alignment</Text>
              </View>
              <Ionicons
                name={locationGranted ? 'checkmark-circle' : 'ellipse-outline'}
                size={22}
                color={locationGranted ? '#ffffff' : '#444444'}
              />
            </View>

            {/* Error Banner */}
            {permissionError && (
              <View style={styles.errorBanner}>
                <Ionicons name="warning" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.errorText}>{permissionError}</Text>
              </View>
            )}

            {/* Allow Button */}
            <TouchableOpacity style={styles.allowButton} activeOpacity={0.8} onPress={requestPermissions}>
              <Text style={styles.allowButtonText}>
                {cameraGranted || locationGranted ? 'Permissions Granted ✓' : 'Allow Camera & Location'}
              </Text>
            </TouchableOpacity>

            {/* Try Another Way / Manual Login Option */}
            <TouchableOpacity
              style={styles.altLoginButton}
              activeOpacity={0.8}
              onPress={() => {
                setShowPermissionModal(false);
                setShowManualLoginModal(true);
              }}
            >
              <Ionicons name="key-outline" size={16} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.altLoginButtonText}>Not working? Try another way to login</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* Alternative Manual Login Modal */}
      <Modal
        visible={showManualLoginModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowManualLoginModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContainer, { transform: [{ scale: modalScale }] }]}>
            <Image
              source={require('../../assets/logo.png')}
              style={{ width: 44, height: 44, alignSelf: 'center', marginBottom: 12 }}
              resizeMode="contain"
            />
            <Text style={styles.modalTitle}>Alternative Login</Text>
            <Text style={styles.modalSubtitle}>
              Camera not working? Sign in with your registered account credentials.
            </Text>

            {/* Input 1: Email / Username */}
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={18} color="#888888" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.textInput}
                placeholder="Email or Username"
                placeholderTextColor="#666666"
                value={loginEmail}
                onChangeText={setLoginEmail}
                autoCapitalize="none"
              />
            </View>

            {/* Input 2: Passcode */}
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={18} color="#888888" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.textInput}
                placeholder="Passcode or Key"
                placeholderTextColor="#666666"
                secureTextEntry
                value={loginPasscode}
                onChangeText={setLoginPasscode}
              />
            </View>

            {loginError && (
              <View style={styles.errorBanner}>
                <Ionicons name="warning" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.errorText}>{loginError}</Text>
              </View>
            )}

            {/* Login Submit Button */}
            <TouchableOpacity
              style={styles.allowButton}
              activeOpacity={0.8}
              onPress={handleManualLoginSubmit}
            >
              <Text style={styles.allowButtonText}>Sign In & Load Profile ✓</Text>
            </TouchableOpacity>

            {/* Back to Permission Prompt */}
            <TouchableOpacity
              style={{ alignItems: 'center', paddingVertical: 12, marginTop: 4 }}
              onPress={() => {
                setShowManualLoginModal(false);
                setShowPermissionModal(true);
              }}
            >
              <Text style={{ color: '#888888', fontSize: 13, fontWeight: '500' }}>← Back to Camera Scan</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* Animated Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity, transform: [{ translateY: headerTranslateY }] }]}>
        <Image source={require('../../assets/logo.png')} style={{ width: 32, height: 32, marginBottom: 2 }} resizeMode="contain" />
        <Text style={styles.headerTitle}>AURA SCANNER</Text>
        <View style={styles.statusBadgeRow}>
          <Ionicons name={matchStatus === 'matched' ? "checkmark-circle" : (matchStatus === 'new' ? "sparkles" : "pulse")} size={11} color="#ffffff" style={{ marginRight: 4 }} />
          <Text style={styles.statusBadgeText}>
            {matchStatus === 'matched' ? "AURA FOUND" : (matchStatus === 'new' ? "NEW AURA REGISTERED" : "AURA FIELD ACTIVE")}
          </Text>
        </View>
      </Animated.View>

      {/* Animated Center Scanning Area */}
      <Animated.View style={[styles.centerContainer, { opacity: scannerOpacity, transform: [{ scale: scannerScale }] }]}>
        {/* STACKED AI DIAGNOSTIC LOG CARD */}
        {cameraGranted && cameraStream && (
          <View style={{
            width: '100%',
            maxWidth: 340,
            backgroundColor: 'rgba(10, 10, 20, 0.85)',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: stickerThemes[stickerTheme]?.border || 'rgba(168, 85, 247, 0.5)',
            padding: 8,
            marginBottom: 8,
            shadowColor: stickerThemes[stickerTheme]?.primary || '#a855f7',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.4,
            shadowRadius: 10,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Ionicons name="terminal-outline" size={13} color={stickerThemes[stickerTheme]?.border || "#c084fc"} style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#ffffff', letterSpacing: 0.8 }}>
                AI QUANTUM DIAGNOSTIC LOG (STACKED)
              </Text>
            </View>
            <View style={{ gap: 3 }}>
              {analysisLogs.slice(-4).map((logItem, idx) => (
                <View key={idx} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 9, color: stickerThemes[stickerTheme]?.border || '#c084fc', marginRight: 5 }}>▶</Text>
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: idx === Math.min(analysisLogs.length, 4) - 1 ? 'bold' : '500',
                      color: idx === Math.min(analysisLogs.length, 4) - 1 ? '#ffffff' : '#a1a1aa',
                      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
                    }}
                    numberOfLines={1}
                  >
                    {logItem}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.scanFrame}>
          {/* Live Camera Feed on Web - 100% CONTINUOUS LIVE WEBCAM VIDEO */}
          {Platform.OS === 'web' && cameraGranted && cameraStream ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: 'scaleX(-1)', // Mirrored properly
                borderRadius: 12,
                zIndex: 0,
              }}
            />
          ) : null}

          {/* Captured Snapshot with Complete Background Removal & Bold Cosmic Aura Colors */}
          {capturedImage && (
            <Image
              source={{ uri: capturedImage }}
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: 12,
                resizeMode: 'cover',
                zIndex: 15,
              }}
            />
          )}

          {/* BOLD & VIBRANT GLOWING AURA COLOR FIELD OVERLAY ON LIVE STREAM */}
          {cameraGranted && cameraStream && !capturedImage && (
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: 12,
                background: `radial-gradient(ellipse at center, ${stickerThemes[stickerTheme]?.glow || 'rgba(192, 132, 252, 0.85)'} 0%, ${stickerThemes[stickerTheme]?.primary || '#8b5cf6'}77 45%, transparent 75%)`,
                pointerEvents: 'none',
                zIndex: 2,
                borderWidth: 3,
                borderColor: stickerThemes[stickerTheme]?.border || '#c084fc',
                boxShadow: `inset 0 0 40px ${stickerThemes[stickerTheme]?.primary || '#8b5cf6'}, 0 0 30px ${stickerThemes[stickerTheme]?.border || '#c084fc'}`,
              }}
            />
          )}

          {/* Dynamic Glowing Laser Scan Line Overlay across Live Video */}
          {cameraGranted && cameraStream && calibrationConfirmed && (
            <Animated.View
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                height: 3,
                backgroundColor: '#ffffff',
                boxShadow: '0 0 15px #ffffff, 0 0 30px #ffffff',
                zIndex: 10,
                transform: [{ translateY: laserAnim }],
              }}
            />
          )}

          {/* Biometric HUD Reticle Corner Brackets */}
          {cameraGranted && cameraStream && (
            <View style={styles.hudOverlay}>
              <View style={[styles.cornerBracket, styles.topLeftBracket]} />
              <View style={[styles.cornerBracket, styles.topRightBracket]} />
              <View style={[styles.cornerBracket, styles.bottomLeftBracket]} />
              <View style={[styles.cornerBracket, styles.bottomRightBracket]} />
            </View>
          )}

          {/* Hidden Canvas for Live Video Processing */}
          {Platform.OS === 'web' && (
            <canvas ref={canvasRef} style={{ display: 'none' }} width="320" height="400" />
          )}

          {/* Pre-scan Calibration Confirmation Overlay */}
          {!calibrationConfirmed && cameraGranted && cameraStream && (
            <View style={styles.calibrationOverlay}>
              <Ionicons name="sparkles-outline" size={28} color="#ffffff" style={{ marginBottom: 8 }} />
              <Text style={styles.calibrationTitle}>Aura Calibration</Text>
              <Text style={styles.calibrationText}>
                Please check: Is your aura clearly visible in the live stream? Any lighting disturbance?
              </Text>
              <TouchableOpacity
                style={styles.confirmScanButton}
                activeOpacity={0.8}
                onPress={() => setCalibrationConfirmed(true)}
              >
                <Text style={styles.confirmScanText}>Aura is clear, Proceed ✓</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ marginTop: 10 }}
                onPress={() => Alert.alert("Scan Guidelines", "1. Place yourself in a well-lit space.\n2. Ensure no strong lights are behind you.\n3. Keep yourself centered.")}
              >
                <Text style={{ color: '#888888', fontSize: 11, textDecorationLine: 'underline' }}>Troubleshoot disturbances</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Dynamic Background Aura Glow Ring */}
          <Animated.View style={[styles.auraCircle, { opacity: auraPulseOpacity, transform: [{ scale: auraPulseScale }] }]} />

          {/* Aura Scanner Placeholder if camera not granted */}
          {(!cameraGranted || !cameraStream) && (
            <View style={styles.iconContainer}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={requestPermissions}
                style={{ alignItems: 'center', marginBottom: 16 }}
              >
                <MaterialCommunityIcons name="camera-outline" size={70} color="#ffffff" style={{ marginBottom: 8 }} />
                <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '600' }}>Tap to Enable Webcam</Text>
                <Text style={{ color: '#888888', fontSize: 11, marginTop: 4 }}>Live camera stream required for aura scan</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.4)',
                }}
                activeOpacity={0.8}
                onPress={() => setShowManualLoginModal(true)}
              >
                <Ionicons name="key-outline" size={14} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '600' }}>Not working? Try another way</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Animated.View>

      {/* Hidden Offscreen Canvas for High-Res PNG Sticker Rendering */}
      {Platform.OS === 'web' && (
        <canvas ref={stickerCanvasRef} style={{ display: 'none' }} width="800" height="1000" />
      )}

      {/* Interactive Aura Sticker Studio & Social Share Modal */}
      <Modal
        visible={showStickerModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowStickerModal(false)}
      >
        <View style={styles.modalOverlay}>
          {/* Toast Notification Banner */}
          {toastMsg && (
            <View style={styles.toastContainer}>
              <Ionicons name="sparkles" size={16} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.toastText}>{toastMsg}</Text>
            </View>
          )}

          <Animated.View style={[styles.stickerModalContainer, { transform: [{ scale: modalScale }] }]}>
            {/* Modal Header */}
            <View style={styles.stickerModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="sparkles" size={20} color="#c084fc" style={{ marginRight: 8 }} />
                <Text style={styles.stickerModalTitle}>Aura Sticker Studio</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowStickerModal(false)}
                style={styles.closeIconButton}
              >
                <Ionicons name="close" size={22} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScrollContent}>
              <Text style={styles.stickerModalSubtitle}>
                Generate your collectible holographic sticker and share your aura resonance on social media!
              </Text>

              {/* Elegant Vintage Linen Aesthetic Sticker Card with Dynamic Aura Accent Glow */}
              <View style={[styles.aestheticStickerCardContainer, { borderColor: activeTheme.border, borderWidth: 1.5 }]}>
                {/* Decorative Swooping Side Lines in Theme Border Color */}
                <View style={[styles.aestheticLeftLine, { borderLeftColor: activeTheme.border }]} />
                <View style={[styles.aestheticRightLine, { borderRightColor: activeTheme.border }]} />

                {/* Top Header: Logo Image + Title */}
                <View style={styles.aestheticTopHeader}>
                  <Image
                    source={require('../../assets/logo.png')}
                    style={styles.aestheticLogo}
                    resizeMode="contain"
                  />
                  <Text style={styles.aestheticTitle}>Next Archer</Text>
                </View>

                {/* User Photo Frame with Glowing Aura Halo & White Border */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleUploadPhoto}
                  style={[
                    styles.aestheticPhotoFrameGradient,
                    {
                      width: photoFrameSize,
                      height: photoFrameSize,
                      borderRadius: photoFrameSize / 2,
                      backgroundColor: activeTheme.border,
                      shadowColor: activeTheme.border,
                      borderColor: activeTheme.primary,
                    },
                  ]}
                >
                  <View style={[styles.aestheticPhotoFrameInner, { borderRadius: (photoFrameSize - 8) / 2 }]}>
                    {capturedImage ? (
                      <Image
                        source={{ uri: capturedImage }}
                        style={[styles.aestheticPhotoImg, { transform: [{ scale: photoScale }] }]}
                      />
                    ) : (
                      <View style={styles.aestheticPhotoPlaceholder}>
                        <Ionicons name="camera-outline" size={photoFrameSize * 0.22} color={activeTheme.primary} />
                        <Text style={{ fontSize: 9, color: '#666666', fontWeight: 'bold', marginTop: 2 }}>Tap to Add Photo</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>

                {/* Editable Username Pill */}
                <View style={[styles.aestheticNamePill, { borderColor: activeTheme.border }]}>
                  <TextInput
                    style={styles.aestheticNameInput}
                    value={stickerUsername}
                    onChangeText={(txt) => {
                      let formatted = txt;
                      if (formatted && !formatted.startsWith('@')) {
                        formatted = '@' + formatted;
                      }
                      setStickerUsername(formatted);
                    }}
                    placeholder="@username"
                    placeholderTextColor="#6b8787"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                {/* Hashtags Footer */}
                <View style={styles.aestheticTagsContainer}>
                  <Text style={styles.aestheticTagsText}>
                    #AuraFarming #ConsciousComputing #Ideawarfare
                  </Text>
                </View>
              </View>

              {/* Interactive Photo Resize & Zoom Controls Bar */}
              <View style={styles.photoControlsRow}>
                <Text style={styles.photoControlLabel}>Resize / Zoom Photo:</Text>
                <View style={styles.photoControlButtonsRow}>
                  <TouchableOpacity
                    style={styles.photoCtrlBtn}
                    onPress={() => setPhotoFrameSize((prev) => Math.max(100, prev - 10))}
                  >
                    <Ionicons name="contract-outline" size={12} color="#ffffff" style={{ marginRight: 3 }} />
                    <Text style={styles.photoCtrlBtnText}>Frame -</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.photoCtrlBtn}
                    onPress={() => setPhotoFrameSize((prev) => Math.min(160, prev + 10))}
                  >
                    <Ionicons name="expand-outline" size={12} color="#ffffff" style={{ marginRight: 3 }} />
                    <Text style={styles.photoCtrlBtnText}>Frame +</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.photoCtrlBtn}
                    onPress={() => setPhotoScale((prev) => Math.max(0.6, parseFloat((prev - 0.1).toFixed(1))))}
                  >
                    <Ionicons name="remove-circle-outline" size={12} color="#ffffff" style={{ marginRight: 3 }} />
                    <Text style={styles.photoCtrlBtnText}>Zoom -</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.photoCtrlBtn}
                    onPress={() => setPhotoScale((prev) => Math.min(2.5, parseFloat((prev + 0.1).toFixed(1))))}
                  >
                    <Ionicons name="add-circle-outline" size={12} color="#ffffff" style={{ marginRight: 3 }} />
                    <Text style={styles.photoCtrlBtnText}>Zoom +</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.photoCtrlBtn, { backgroundColor: 'rgba(255, 255, 255, 0.15)', paddingHorizontal: 8 }]}
                    onPress={() => {
                      setPhotoScale(1.0);
                      setPhotoFrameSize(130);
                    }}
                  >
                    <Ionicons name="refresh-outline" size={13} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Theme Selector Section */}
              <Text style={styles.themeSelectorLabel}>Select Aura Energy Theme:</Text>
              <View style={styles.themePillsRow}>
                {Object.keys(stickerThemes).map((key) => {
                  const theme = stickerThemes[key];
                  const isSelected = stickerTheme === key;
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.themePill,
                        { backgroundColor: theme.bgGradient[0] },
                        isSelected && styles.themePillSelected,
                      ]}
                      activeOpacity={0.8}
                      onPress={() => setStickerTheme(key)}
                    >
                      <Ionicons name={theme.icon} size={12} color="#ffffff" style={{ marginRight: 4 }} />
                      <Text style={styles.themePillText}>{theme.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Instagram & Snapchat Story Action Row */}
              <View style={styles.storyButtonsRow}>
                <TouchableOpacity
                  style={styles.instagramStoryBtn}
                  activeOpacity={0.85}
                  onPress={handleInstagramShare}
                >
                  <Ionicons name="logo-instagram" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                  <Text style={styles.storyBtnText}>Instagram Story</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.snapchatStoryBtn}
                  activeOpacity={0.85}
                  onPress={handleSnapchatShare}
                >
                  <Ionicons name="logo-snapchat" size={16} color="#000000" style={{ marginRight: 6 }} />
                  <Text style={styles.snapchatBtnText}>Snapchat Story</Text>
                </TouchableOpacity>
              </View>

              {/* Main Action Buttons */}
              <TouchableOpacity
                style={styles.primaryShareBtn}
                activeOpacity={0.8}
                onPress={handleShareSticker}
              >
                <Ionicons name="share-social" size={16} color="#000000" style={{ marginRight: 6 }} />
                <Text style={styles.primaryShareBtnText}>Share Aura Sticker Card</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryDownloadBtn}
                activeOpacity={0.8}
                onPress={handleDownloadSticker}
              >
                <Ionicons name="download-outline" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.secondaryDownloadBtnText}>Download PNG Sticker</Text>
              </TouchableOpacity>

              {/* Direct Social Shortcuts Row */}
              <View style={styles.socialShortcutsRow}>
                <TouchableOpacity
                  style={[styles.socialIconBtn, { backgroundColor: '#E1306C' }]}
                  onPress={() => handleSocialDirectShare('instagram')}
                >
                  <Ionicons name="logo-instagram" size={16} color="#ffffff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.socialIconBtn, { backgroundColor: '#FFFC00' }]}
                  onPress={() => handleSocialDirectShare('snapchat')}
                >
                  <Ionicons name="logo-snapchat" size={16} color="#000000" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.socialIconBtn, { backgroundColor: '#25D366' }]}
                  onPress={() => handleSocialDirectShare('whatsapp')}
                >
                  <Ionicons name="logo-whatsapp" size={16} color="#ffffff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.socialIconBtn, { backgroundColor: '#1DA1F2' }]}
                  onPress={() => handleSocialDirectShare('twitter')}
                >
                  <Ionicons name="logo-twitter" size={16} color="#ffffff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.socialIconBtn, { backgroundColor: '#0088cc' }]}
                  onPress={() => handleSocialDirectShare('telegram')}
                >
                  <Ionicons name="paper-plane" size={16} color="#ffffff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.socialIconBtn, { backgroundColor: 'rgba(255,255,255,0.15)' }]}
                  onPress={handleCopyLink}
                >
                  <Ionicons name="copy-outline" size={16} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

      {/* Animated Bottom Section - Side-by-side action buttons */}
      <Animated.View style={[styles.bottomContainer, { opacity: bottomOpacity, transform: [{ translateY: bottomTranslateY }] }]}>
        <Animated.View style={{ width: '100%', flexDirection: 'row', gap: 10, transform: [{ scale: buttonPulse }] }}>
          {/* Create Sticker & Share Button */}
          <TouchableOpacity
            style={styles.stickerActionBtnWrapper}
            activeOpacity={0.8}
            onPress={() => setShowStickerModal(true)}
          >
            <LinearGradient
              colors={['#8b5cf6', '#6366f1', '#06b6d4']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.stickerActionBtnGradient}
            >
              <Ionicons name="sparkles" size={16} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.stickerActionBtnText}>Aura Sticker ✨</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Continue Button */}
          <TouchableOpacity
            style={[styles.continueActionBtn, !scanComplete && styles.continueButtonDisabled]}
            activeOpacity={scanComplete ? 0.8 : 1}
            onPress={handleContinue}
          >
            <Text style={[styles.continueActionBtnText, !scanComplete && styles.continueButtonTextDisabled]}>
              {scanComplete ? 'Continue' : 'Calibrating...'}
            </Text>
            <Ionicons
              name="arrow-forward"
              size={16}
              color={scanComplete ? '#ffffff' : '#666666'}
              style={{ marginLeft: 6 }}
            />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 4,
    alignItems: 'center',
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 13,
    letterSpacing: 4,
    color: '#ffffff',
    fontWeight: '700',
    marginBottom: 4,
  },
  statusBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 6,
  },
  statusBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 4,
  },
  scanFrame: {
    width: 275,
    height: 295,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
  },
  auraCircle: {
    position: 'absolute',
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: 'rgba(168, 85, 247, 0.07)', // Soft purple aura background
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.25)', // Soft blue border
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 15,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
  },

  scannerLabel: {
    color: '#ffffff',
    fontStyle: 'italic',
    fontSize: 11,
    marginBottom: 6,
    marginTop: 2,
    letterSpacing: 0.6,
    textAlign: 'center',
    maxWidth: '90%',
  },
  bottomContainer: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    paddingTop: 4,
    alignItems: 'center',
  },
  stickerActionBtnWrapper: {
    flex: 1.2,
    height: 46,
    borderRadius: 23,
    overflow: 'hidden',
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  stickerActionBtnGradient: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  stickerActionBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.6,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  continueActionBtn: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  continueActionBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  continueButton: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  continueButtonDisabled: {
    borderColor: '#444444',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonTextDisabled: {
    color: '#666666',
  },
  buttonIcon: {
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#000000',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#ffffff',
    padding: 24,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#888888',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  permissionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  permissionTextGroup: {
    flex: 1,
    marginRight: 8,
  },
  permissionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  permissionDesc: {
    fontSize: 11,
    color: '#888888',
  },
  allowButton: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  allowButtonText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  skipButtonText: {
    color: '#6b7280',
    fontSize: 13,
    fontWeight: '500',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
    marginBottom: 12,
  },
  errorText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  calibrationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    zIndex: 99,
    borderRadius: 12,
  },
  calibrationTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  calibrationText: {
    color: '#888888',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  confirmScanButton: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  confirmScanText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: 'bold',
  },
  hudOverlay: {
    ...StyleSheet.absoluteFillObject,
    padding: 12,
    zIndex: 8,
    pointerEvents: 'none',
  },
  cornerBracket: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#ffffff',
  },
  topLeftBracket: {
    top: 14,
    left: 14,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 6,
  },
  topRightBracket: {
    top: 14,
    right: 14,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 6,
  },
  bottomLeftBracket: {
    bottom: 14,
    left: 14,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 6,
  },
  bottomRightBracket: {
    bottom: 14,
    right: 14,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 6,
  },
  altLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
    marginTop: 10,
  },
  altLoginButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    marginBottom: 10,
  },
  textInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 13,
  },
  guestLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 12,
    width: '100%',
  },
  guestLoginText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  createStickerButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#c084fc',
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#c084fc',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  createStickerButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.8,
  },
  toastContainer: {
    position: 'absolute',
    top: 40,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderWidth: 1,
    borderColor: '#c084fc',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    shadowColor: '#c084fc',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  toastText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  stickerModalContainer: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '94%',
    backgroundColor: '#0a0a14',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 14,
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  modalScrollContent: {
    paddingBottom: 8,
  },
  stickerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  stickerModalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  closeIconButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stickerModalSubtitle: {
    fontSize: 10,
    color: '#94a3b8',
    marginBottom: 10,
    lineHeight: 14,
  },
  themeSelectorLabel: {
    color: '#cbd5e1',
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 6,
  },
  themePillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginBottom: 10,
  },
  themePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  themePillSelected: {
    borderColor: '#ffffff',
    borderWidth: 2,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  themePillText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '600',
  },
  storyButtonsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
    width: '100%',
  },
  instagramStoryBtn: {
    flex: 1,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#E1306C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  snapchatStoryBtn: {
    flex: 1,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFFC00',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  storyBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  snapchatBtnText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: 'bold',
  },
  primaryShareBtn: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    height: 38,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  primaryShareBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  secondaryDownloadBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 12,
    height: 34,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  secondaryDownloadBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  socialShortcutsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  socialIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aestheticStickerCardContainer: {
    width: '100%',
    height: 330,
    backgroundColor: '#f6f5f1',
    borderRadius: 24,
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
    paddingTop: 14,
    paddingBottom: 12,
    marginBottom: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  aestheticTopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 2,
    zIndex: 2,
  },
  aestheticLogo: {
    width: 36,
    height: 36,
  },
  aestheticTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: '#1a1a1a',
  },
  aestheticAuraBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
    zIndex: 2,
  },
  aestheticAuraBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    letterSpacing: 0.5,
  },
  aestheticPhotoFrameGradient: {
    width: 125,
    height: 125,
    borderRadius: 62.5,
    padding: 4,
    marginTop: 12,
    backgroundColor: '#5d7f7d',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  aestheticPhotoFrameInner: {
    width: '100%',
    height: '100%',
    borderRadius: 58,
    borderWidth: 3,
    borderColor: '#ffffff',
    overflow: 'hidden',
    backgroundColor: '#e5e3dc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aestheticPhotoImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  aestheticPhotoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  aestheticNamePill: {
    width: 140,
    marginTop: 12,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: '#6b8787',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f6f5f1',
    zIndex: 2,
  },
  aestheticNameText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  aestheticNameInput: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: '#1a1a1a',
    textAlign: 'center',
    width: '100%',
    padding: 0,
    outlineStyle: 'none',
  },
  aestheticTagsContainer: {
    position: 'absolute',
    bottom: 10,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  aestheticTagsText: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Arial' : 'sans-serif',
    color: '#222222',
    textAlign: 'center',
  },
  photoControlsRow: {
    width: '100%',
    marginVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  photoControlLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#a78bfa',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  photoControlButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
  },
  photoCtrlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.4)',
  },
  photoCtrlBtnText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  aestheticLeftLine: {
    position: 'absolute',
    width: 100,
    height: 240,
    top: 40,
    left: -50,
    borderLeftWidth: 3,
    borderLeftColor: '#6c8a89',
    borderRadius: 60,
    zIndex: 1,
  },
  aestheticRightLine: {
    position: 'absolute',
    width: 100,
    height: 240,
    top: 40,
    right: -50,
    borderRightWidth: 3,
    borderRightColor: '#6c8a89',
    borderRadius: 60,
    zIndex: 1,
  },
});

export default AuraScannerScreen;
