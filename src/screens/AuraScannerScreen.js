import React, { useEffect, useRef } from 'react';
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
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

const AuraScannerScreen = ({ navigation }) => {
  const glowOpacity = useRef(new Animated.Value(0.4)).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Subtle opacity glow animation for the scanner face & frame
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

    // Scanning vertical line movement animation inside 200x250 box
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 210,
          duration: 2400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 2400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [glowOpacity, scanLineAnim]);

  const handleContinue = () => {
    if (navigation && navigation.navigate) {
      navigation.navigate('Supercharge');
    } else {
      Alert.alert('Navigation', 'Proceeding to Supercharge screen');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a1a" />

      {/* Header title */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AURA SCANNER</Text>
      </View>

      {/* Center scanning area */}
      <View style={styles.centerContainer}>
        {/* Scanning frame: 200x250 area with corner brackets */}
        <View style={styles.scanFrame}>
          {/* Top-Left Corner Bracket */}
          <View style={[styles.cornerBracket, styles.topLeftBracket]} />
          {/* Top-Right Corner Bracket */}
          <View style={[styles.cornerBracket, styles.topRightBracket]} />
          {/* Bottom-Left Corner Bracket */}
          <View style={[styles.cornerBracket, styles.bottomLeftBracket]} />
          {/* Bottom-Right Corner Bracket */}
          <View style={[styles.cornerBracket, styles.bottomRightBracket]} />

          {/* AI Face representation: face-recognition icon size 120 color #87CEEB */}
          <Animated.View style={[styles.iconContainer, { opacity: glowOpacity }]}>
            <MaterialCommunityIcons
              name="face-recognition"
              size={120}
              color={Colors.skyBlue || '#87CEEB'}
            />
          </Animated.View>

          {/* Animated laser scanning line */}
          <Animated.View
            style={[
              styles.scanLine,
              {
                transform: [{ translateY: scanLineAnim }],
                opacity: glowOpacity,
              },
            ]}
          />
        </View>

        {/* Label below scanning frame */}
        <Text style={styles.scannerLabel}>proprietary aura scanner</Text>
      </View>

      {/* Bottom section with text & Continue button */}
      <View style={styles.bottomContainer}>
        {/* Philosophy tagline text */}
        <Text style={styles.transcendText}>
          I AM NOT PERFECT. LET'S TRANSCEND CONSCIOUSNESS
        </Text>

        {/* Continue TouchableOpacity button with cyan border */}
        <TouchableOpacity
          style={styles.continueButton}
          activeOpacity={0.8}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
          <Ionicons
            name="arrow-forward"
            size={20}
            color={Colors.cyan || '#00d4ff'}
            style={styles.buttonIcon}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundDark || '#0a0a1a',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    paddingTop: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    letterSpacing: 4,
    color: Colors.textGray || '#a0a0b0',
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 200,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: 'rgba(26, 26, 46, 0.25)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  cornerBracket: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: Colors.textWhite || '#ffffff',
  },
  topLeftBracket: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  topRightBracket: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  bottomLeftBracket: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  bottomRightBracket: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.skyBlue || '#87CEEB',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 8,
  },
  scanLine: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    height: 2,
    backgroundColor: Colors.cyan || '#00d4ff',
    shadowColor: Colors.cyan || '#00d4ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 5,
  },
  scannerLabel: {
    color: Colors.textWhite || '#ffffff',
    fontStyle: 'italic',
    fontSize: 16,
    marginTop: 24,
    letterSpacing: 1,
    textAlign: 'center',
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  transcendText: {
    fontSize: 11,
    color: Colors.textGray || '#a0a0b0',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
  },
  continueButton: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: Colors.cyan || '#00d4ff',
    backgroundColor: 'rgba(0, 212, 255, 0.08)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.cyan || '#00d4ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  continueButtonText: {
    color: Colors.textWhite || '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  buttonIcon: {
    marginLeft: 8,
  },
});

export default AuraScannerScreen;
