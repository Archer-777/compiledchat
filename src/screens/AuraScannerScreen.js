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
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import databaseService from '../services/databaseService';

const AuraScannerScreen = ({ navigation }) => {
  // Database status state
  const [dbInfo, setDbInfo] = useState({ connected: false, mode: 'checking', message: 'Connecting to DB...' });

  // 1. Existing State & Animations
  const glowOpacity = useRef(new Animated.Value(0.4)).current;

  const [showPermissionModal, setShowPermissionModal] = useState(true);
  const [cameraGranted, setCameraGranted] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [permissionError, setPermissionError] = useState(null);
  const [semanticAnalysis, setSemanticAnalysis] = useState("Initializing resonance fields...");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // New States for Face Matching & Calibration
  const [calibrationConfirmed, setCalibrationConfirmed] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [matchStatus, setMatchStatus] = useState(null); // 'matched' or 'new'
  const [scanComplete, setScanComplete] = useState(false);

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

  useEffect(() => {
    if (cameraGranted && cameraStream && calibrationConfirmed) {
      let isSubscribed = true;
      const runAuraScanner = async () => {
        // Step 1: Aligning resonance
        if (!isSubscribed) return;
        setSemanticAnalysis("Aligning consciousness fields...");
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Step 2: Analyzing semantics
        if (!isSubscribed) return;
        setSemanticAnalysis("Extracting face semantics & resonance...");
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Step 3: Capture Snapshot
        if (!isSubscribed) return;
        const result = captureFrame();
        
        if (result) {
          const { dataUrl, signature } = result;
          
          // Check database via databaseService
          const existing = await databaseService.fetchLatestAuraScan();
          if (existing && existing.aura) {
            // Match found!
            if (!isSubscribed) return;
            setMatchStatus('matched');
            setCapturedImage(dataUrl);
            setSemanticAnalysis("Aura Found! Welcome back (Resonance: 99.8%)");
          } else {
            // New user registration
            await databaseService.saveAuraScan({
              image: dataUrl,
              signature: signature,
              frequency: '432Hz - 963Hz',
              resonanceScore: 98.4,
            });
            if (!isSubscribed) return;
            setMatchStatus('new');
            setCapturedImage(dataUrl);
            setSemanticAnalysis("New Aura Registered! Calibration complete.");
          }
        } else {
          // Fallback if not web or refs not ready
          if (!isSubscribed) return;
          setSemanticAnalysis("Aura density check: 98.4% (Highly aligned)");
        }

        // Final transition
        await new Promise((resolve) => setTimeout(resolve, 2000));
        if (!isSubscribed) return;
        setSemanticAnalysis("Spectral refraction complete.");
        setScanComplete(true);
      };

      runAuraScanner();
      return () => {
        isSubscribed = false;
      };
    } else {
      // If calibration is reset or not confirmed yet
      setSemanticAnalysis("Ready for face calibration...");
      setScanComplete(false);
    }
  }, [cameraGranted, cameraStream, calibrationConfirmed]);

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  useEffect(() => {
    if (Platform.OS === 'web' && cameraStream) {
      if (videoRef.current) videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream, cameraGranted]);

  const captureFrame = () => {
    if (Platform.OS === 'web' && videoRef.current && canvasRef.current) {
      try {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = 320;
        canvas.height = 400;
        ctx.drawImage(video, 0, 0, 320, 400);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);

        // Get simple RGB checksum signature
        const imgData = ctx.getImageData(80, 100, 160, 200); // Sample central face area
        const data = imgData.data;
        let r = 0, g = 0, b = 0;
        for (let i = 0; i < data.length; i += 40) {
          r += data[i];
          g += data[i+1];
          b += data[i+2];
        }
        const signature = `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;

        return { dataUrl, signature };
      } catch (err) {
        console.error("Frame capture error:", err);
      }
    }
    return null;
  };


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
              source={require('../../loading screen/logo.png')}
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
                <Text style={styles.permissionDesc}>Required for real-time Aura Scanner & Face Detection</Text>
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

            {/* Skip Button */}
            <TouchableOpacity style={styles.skipButton} onPress={() => setPermissionError("Camera access is required to continue.")}>
              <Text style={styles.skipButtonText}>Skip for now</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* Animated Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity, transform: [{ translateY: headerTranslateY }] }]}>
        <Image source={require('../../loading screen/logo.png')} style={{ width: 36, height: 36, marginBottom: 4 }} resizeMode="contain" />
        <Text style={styles.headerTitle}>AURA SCANNER</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,212,255,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: '#00e5ff', marginTop: 4 }}>
          <Ionicons name={matchStatus === 'matched' ? "checkmark-circle" : (matchStatus === 'new' ? "sparkles" : "pulse")} size={12} color="#00e5ff" style={{ marginRight: 5 }} />
          <Text style={{ color: "#00e5ff", fontSize: 10, fontWeight: '600', letterSpacing: 0.5 }}>
            {matchStatus === 'matched' ? "AURA FOUND" : (matchStatus === 'new' ? "NEW AURA REGISTERED" : "AURA FIELD ACTIVE")}
          </Text>
        </View>
      </Animated.View>

      {/* Animated Center Scanning Area */}
      <Animated.View style={[styles.centerContainer, { opacity: scannerOpacity, transform: [{ scale: scannerScale }] }]}>
        <Text style={styles.scannerLabel}>
          {cameraGranted && cameraStream ? `[AI SCANNER]: ${semanticAnalysis}` : "proprietary aura scanner"}
        </Text>
        <View style={styles.scanFrame}>
          {/* Live Camera Feed on Web */}
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

          {/* Hidden Canvas for Face Capture */}
          {Platform.OS === 'web' && (
            <canvas ref={canvasRef} style={{ display: 'none' }} width="320" height="400" />
          )}

          {/* Pre-scan Calibration Confirmation Overlay */}
          {!calibrationConfirmed && cameraGranted && cameraStream && (
            <View style={styles.calibrationOverlay}>
              <Ionicons name="sparkles-outline" size={28} color="#ffffff" style={{ marginBottom: 8 }} />
              <Text style={styles.calibrationTitle}>Aura Calibration</Text>
              <Text style={styles.calibrationText}>
                Please check: Is your face clearly visible? Any lighting or backlighting disturbance?
              </Text>
              <TouchableOpacity
                style={styles.confirmScanButton}
                activeOpacity={0.8}
                onPress={() => setCalibrationConfirmed(true)}
              >
                <Text style={styles.confirmScanText}>Face is clear, Proceed ✓</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ marginTop: 10 }}
                onPress={() => Alert.alert("Scan Guidelines", "1. Place yourself in a well-lit space.\n2. Ensure no strong lights are behind you.\n3. Keep your face centered.")}
              >
                <Text style={{ color: '#888888', fontSize: 11, textDecorationLine: 'underline' }}>Troubleshoot disturbances</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Dynamic Background Aura Glow Ring */}
          <Animated.View style={[styles.auraCircle, { opacity: auraPulseOpacity, transform: [{ scale: auraPulseScale }] }]} />


          {/* Face Recognition Icon */}
          {(!cameraGranted || !cameraStream) && (
            <Animated.View style={[styles.iconContainer, { opacity: glowOpacity }]}>
              <MaterialCommunityIcons name="face-recognition" size={120} color="#ffffff" />
            </Animated.View>
          )}
        </View>
      </Animated.View>

      {/* Animated Bottom Section */}
      <Animated.View style={[styles.bottomContainer, { opacity: bottomOpacity, transform: [{ translateY: bottomTranslateY }] }]}>
        <Animated.View style={{ width: '100%', transform: [{ scale: buttonPulse }] }}>
          <TouchableOpacity
            style={[styles.continueButton, !scanComplete && styles.continueButtonDisabled]}
            activeOpacity={scanComplete ? 0.8 : 1}
            onPress={handleContinue}
          >
            <Text style={[styles.continueButtonText, !scanComplete && styles.continueButtonTextDisabled]}>
              {scanComplete ? 'Continue' : 'Calibrating Aura...'}
            </Text>
            <Ionicons
              name="arrow-forward"
              size={20}
              color={scanComplete ? '#ffffff' : '#666666'}
              style={styles.buttonIcon}
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
    paddingTop: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    letterSpacing: 4,
    color: '#ffffff',
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 320,
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
  },
  auraCircle: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
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
    fontSize: 13,
    marginBottom: 16,
    letterSpacing: 0.8,
    textAlign: 'center',
    maxWidth: '90%',
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
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
    zIndex: 5,
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

});

export default AuraScannerScreen;
