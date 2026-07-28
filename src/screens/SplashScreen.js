import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  Platform,
  StatusBar,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

const SplashScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Subtle pulse animation for golden halo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Auto-navigate to AuraScanner after 3 seconds
    const timer = setTimeout(() => {
      if (navigation && navigation.navigate) {
        navigation.navigate('AuraScanner');
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation, fadeAnim, pulseAnim]);

  const handlePress = () => {
    if (navigation && navigation.navigate) {
      navigation.navigate('AuraScanner');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a1a" />
      <TouchableOpacity
        activeOpacity={0.95}
        style={styles.touchableContainer}
        onPress={handlePress}
      >
        <Animated.View style={[styles.centeredContent, { opacity: fadeAnim }]}>
          {/* Golden glowing halo/ring at top */}
          <Animated.View
            style={[
              styles.haloRing,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <View style={styles.innerHaloGlow} />
          </Animated.View>

          {/* Large 'AI' text in white below halo */}
          <Text style={styles.aiText}>AI</Text>

          {/* Small smile/curve below AI text (>‿<) using a curved border view */}
          <View style={styles.smileContainer}>
            <Text style={styles.bracketText}>&gt;</Text>
            <View style={styles.curvedSmileView} />
            <Text style={styles.bracketText}>&lt;</Text>
          </View>

          {/* Text 'SPIRITUALIZE AI' in white, fontSize 20, letterSpacing 3 */}
          <Text style={styles.titleText}>SPIRITUALIZE AI</Text>

          {/* Text 'Thought Realisation' in italic, gold color (#d4a017), fontSize 16 */}
          <Text style={styles.subtitleText}>Thought Realisation</Text>
        </Animated.View>

        {/* Bottom branding and footer */}
        <View style={styles.footerContainer}>
          <Text style={styles.brandingText}>&gt;&gt;&lt; / &gt;</Text>
          <Text style={styles.footerText}>
            CONFIDENTIAL. 2024 Next Archer &gt;&gt;/&lt;
          </Text>
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundDark || '#0a0a1a',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  touchableContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 36,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  haloRing: {
    width: 120,
    height: 60,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Colors.gold || '#d4a017',
    shadowColor: Colors.gold || '#d4a017',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 16,
    elevation: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  innerHaloGlow: {
    width: 100,
    height: 44,
    borderRadius: 40,
    backgroundColor: 'rgba(212, 160, 23, 0.15)',
  },
  aiText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: Colors.textWhite || '#ffffff',
    letterSpacing: 4,
    textAlign: 'center',
    marginVertical: 4,
  },
  smileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  bracketText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.gold || '#d4a017',
    marginHorizontal: 4,
  },
  curvedSmileView: {
    width: 24,
    height: 12,
    borderBottomWidth: 3,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderColor: Colors.gold || '#d4a017',
    marginHorizontal: 2,
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textWhite || '#ffffff',
    letterSpacing: 3,
    marginTop: 18,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: Colors.gold || '#d4a017',
    marginTop: 8,
    textAlign: 'center',
  },
  footerContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  brandingText: {
    fontSize: 14,
    color: Colors.textWhite || '#ffffff',
    letterSpacing: 2,
    marginBottom: 6,
    fontWeight: '600',
  },
  footerText: {
    fontSize: 11,
    color: Colors.textGray || '#a0a0b0',
    letterSpacing: 1,
    textAlign: 'center',
  },
});

export default SplashScreen;
