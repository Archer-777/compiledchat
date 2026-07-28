import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Platform,
  Alert,
} from 'react-native';
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

const LetsMatrixScreen = ({ navigation }) => {
  const [isListening, setIsListening] = useState(true);
  const [sessionStatus, setSessionStatus] = useState('Listening to your stream...');

  // Animated pulse effect setup
  const pulseAnim1 = useRef(new Animated.Value(1)).current;
  const pulseAnim2 = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    // Pulse animation loop 1
    const pulseLoop1 = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim1, {
          toValue: 1.35,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim1, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    );

    // Pulse animation loop 2 (offset)
    const pulseLoop2 = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim2, {
          toValue: 1.5,
          duration: 2400,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim2, {
          toValue: 1,
          duration: 2400,
          useNativeDriver: true,
        }),
      ])
    );

    // Opacity pulse loop
    const opacityLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.2,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.6,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    );

    pulseLoop1.start();
    pulseLoop2.start();
    opacityLoop.start();

    return () => {
      pulseLoop1.stop();
      pulseLoop2.stop();
      opacityLoop.stop();
    };
  }, [pulseAnim1, pulseAnim2, opacityAnim]);

  const handleMicPress = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setSessionStatus('Listening to your stream...');
    } else {
      setSessionStatus('Session Paused. Tap mic to resume.');
    }
  };

  const handleBackToDashboard = () => {
    if (navigation && navigation.navigate) {
      navigation.navigate('Dashboard');
    } else {
      Alert.alert('Navigation', 'Navigating to Dashboard');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a1a" />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation && navigation.goBack ? navigation.goBack() : Alert.alert('Back', 'Navigating back')}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>LETS MATRIX</Text>
        <TouchableOpacity
          style={styles.headerRightBtn}
          onPress={() => Alert.alert('Matrix Settings', 'Idea Facilitation mode configured.')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="cog-outline" size={24} color="#00d4ff" />
        </TouchableOpacity>
      </View>

      {/* Center Content Section */}
      <View style={styles.centerContainer}>
        {/* Animated Pulse Outer Ring 2 */}
        <Animated.View
          style={[
            styles.pulseCircleOuter,
            {
              transform: [{ scale: pulseAnim2 }],
              opacity: Animated.multiply(opacityAnim, 0.5),
            },
          ]}
        />

        {/* Animated Pulse Outer Ring 1 */}
        <Animated.View
          style={[
            styles.pulseCircleInner,
            {
              transform: [{ scale: pulseAnim1 }],
              opacity: opacityAnim,
            },
          ]}
        />

        {/* Circular Mic Holder with Dashed Border */}
        <TouchableOpacity
          style={styles.dashedMicCircle}
          onPress={handleMicPress}
          activeOpacity={0.85}
        >
          <View style={styles.innerMicGlow}>
            <MaterialIcons name="mic" size={100} color="#00d4ff" />
          </View>
        </TouchableOpacity>

        {/* Title & Subtitle below Mic */}
        <View style={styles.textBlock}>
          <Text style={styles.mainTitle}>LETS MATRIX</Text>
          <Text style={styles.subTitle}>Idea Facilitation</Text>
        </View>

        {/* Active Status Indicator */}
        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, !isListening && styles.statusDotPaused]} />
          <Text style={styles.statusText}>{sessionStatus}</Text>
        </View>

        {/* Dynamic Waveform Visualizer Simulation */}
        {isListening && (
          <View style={styles.waveformContainer}>
            <View style={[styles.waveBar, { height: 18 }]} />
            <View style={[styles.waveBar, { height: 32 }]} />
            <View style={[styles.waveBar, { height: 22 }]} />
            <View style={[styles.waveBar, { height: 44 }]} />
            <View style={[styles.waveBar, { height: 28 }]} />
            <View style={[styles.waveBar, { height: 36 }]} />
            <View style={[styles.waveBar, { height: 16 }]} />
          </View>
        )}
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {/* Back to Dashboard Button */}
        <TouchableOpacity
          style={styles.backDashboardBtn}
          onPress={handleBackToDashboard}
          activeOpacity={0.85}
        >
          <Ionicons name="grid-outline" size={20} color="#ffffff" style={styles.btnIcon} />
          <Text style={styles.backDashboardBtnText}>Back to Dashboard</Text>
        </TouchableOpacity>

        {/* Footer Branding Text */}
        <View style={styles.footerContainer}>
          <Text style={styles.brandingText}>&gt;&gt;&lt; / &gt;</Text>
          <Text style={styles.footerText}>
            CONFIDENTIAL. 2024 Next Archer &gt;&gt;/&lt;
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 2,
  },
  headerRightBtn: {
    padding: 6,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: 24,
  },
  /* Pulsing Background Rings */
  pulseCircleOuter: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.2)',
  },
  pulseCircleInner: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(0, 212, 255, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 212, 255, 0.4)',
  },
  /* Dashed Circle for Mic */
  dashedMicCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2.5,
    borderColor: '#00d4ff',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121226',
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 10,
    marginBottom: 28,
  },
  innerMicGlow: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(0, 212, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    alignItems: 'center',
    marginBottom: 16,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 2.5,
    marginBottom: 6,
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#a0a0b0',
    textAlign: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 26, 46, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2a2a3e',
    marginBottom: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00d4ff',
    marginRight: 8,
  },
  statusDotPaused: {
    backgroundColor: '#f59e0b',
  },
  statusText: {
    fontSize: 13,
    color: '#a0a0b0',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 50,
  },
  waveBar: {
    width: 4,
    backgroundColor: '#00d4ff',
    borderRadius: 2,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  backDashboardBtn: {
    backgroundColor: '#1a1a2e',
    height: 54,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#00d4ff',
    marginBottom: 16,
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  btnIcon: {
    marginRight: 8,
  },
  backDashboardBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  footerContainer: {
    alignItems: 'center',
    paddingTop: 8,
  },
  brandingText: {
    fontSize: 12,
    color: '#d4a017',
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 2,
  },
  footerText: {
    fontSize: 11,
    color: '#6b7280',
    letterSpacing: 0.8,
  },
});

export default LetsMatrixScreen;
