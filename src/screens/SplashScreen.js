import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
  Animated,
  TouchableOpacity,
  Text,
  View,
} from 'react-native';
import Svg, { Ellipse, Path } from 'react-native-svg';

const SplashScreen = ({ navigation }) => {
  // Entrance Animation Values
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(25)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(20)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;

  // Continuous Loops Anim Values
  const haloScale = useRef(new Animated.Value(1)).current;
  const haloOpacity = useRef(new Animated.Value(0.85)).current;
  const symbolOpacities = useRef([
    new Animated.Value(0.25),
    new Animated.Value(0.25),
    new Animated.Value(0.25),
    new Animated.Value(0.25),
    new Animated.Value(0.25),
  ]).current;

  useEffect(() => {
    // --- 1. Entrance Cascade sequence ---
    Animated.sequence([
      Animated.delay(100),
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(logoTranslateY, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(footerOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // --- 2. Continuous Halo breathing loop ---
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(haloScale, {
            toValue: 1.1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(haloScale, {
            toValue: 1.0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(haloOpacity, {
            toValue: 1.0,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(haloOpacity, {
            toValue: 0.75,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    // --- 3. Continuous Footer wave sequence ---
    const createWaveAnimation = () => {
      return Animated.stagger(
        140,
        symbolOpacities.map((anim) =>
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1.0,
              duration: 220,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0.25,
              duration: 350,
              useNativeDriver: true,
            }),
          ])
        )
      );
    };
    Animated.loop(createWaveAnimation()).start();

    // --- 4. Auto Navigation Timer ---
    const timer = setTimeout(() => {
      if (navigation && navigation.navigate) {
        navigation.navigate('AuraScanner');
      }
    }, 4500);

    return () => clearTimeout(timer);
  }, [navigation, logoOpacity, logoTranslateY, textOpacity, textTranslateY, footerOpacity, haloScale, haloOpacity, symbolOpacities]);

  const handlePress = () => {
    if (navigation && navigation.navigate) {
      navigation.navigate('AuraScanner');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <TouchableOpacity
        activeOpacity={1}
        style={styles.touchableContainer}
        onPress={handlePress}
      >
        <View style={styles.centeredContent}>
          {/* Main Logo & Typography Group */}
          <Animated.View style={[
            styles.logoContainer, 
            { 
              opacity: logoOpacity, 
              transform: [{ translateY: logoTranslateY }] 
            }
          ]}>
            {/* Animated Halo Wrapper */}
            <Animated.View style={[
              styles.haloWrapper, 
              { 
                opacity: haloOpacity, 
                transform: [{ scale: haloScale }] 
              }
            ]}>
              <Svg height="90" width="240" viewBox="0 0 240 90">
                {/* Outer Glow Ellipse */}
                <Ellipse
                  cx="120"
                  cy="45"
                  rx="70"
                  ry="20"
                  fill="none"
                  stroke="#FF9900"
                  strokeWidth="16"
                  opacity="0.45"
                />
                {/* Inner Bright Ellipse */}
                <Ellipse
                  cx="120"
                  cy="45"
                  rx="62"
                  ry="17"
                  fill="none"
                  stroke="#FFE57F"
                  strokeWidth="3.5"
                  opacity="0.95"
                />
              </Svg>
            </Animated.View>
            {/* AI Text overlay */}
            <Text style={styles.aiText}>AI</Text>
            {/* Smile Arc Path */}
            <View style={styles.smileArcContainer}>
              <Svg height="40" width="160" viewBox="0 0 160 40">
                <Path
                  d="M 22 10 Q 80 32 138 10"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </Svg>
            </View>
          </Animated.View>
          {/* Title and Subtitle Text Group */}
          <Animated.View style={[
            styles.textContainer, 
            { 
              opacity: textOpacity, 
              transform: [{ translateY: textTranslateY }] 
            }
          ]}>
            <Text style={styles.titleText}>SPIRITUALIZE AI</Text>
            <Text style={styles.subtitleText}>Thought Realisation</Text>
          </Animated.View>
          {/* Staggered Wave Loading Indicator */}
          <Animated.View style={[styles.footerContainer, { opacity: footerOpacity }]}>
            <View style={styles.waveRow}>
              {/* > */}
              <Animated.View style={{ opacity: symbolOpacities[0] }}>
                <Svg height="35" width="28" viewBox="0 0 28 35">
                  <Path d="M 6 8 L 20 17.5 L 6 27" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </Animated.View>
              {/* > */}
              <Animated.View style={{ opacity: symbolOpacities[1] }}>
                <Svg height="35" width="28" viewBox="0 0 28 35">
                  <Path d="M 6 8 L 20 17.5 L 6 27" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </Animated.View>
              {/* < */}
              <Animated.View style={{ opacity: symbolOpacities[2] }}>
                <Svg height="35" width="28" viewBox="0 0 28 35">
                  <Path d="M 22 8 L 8 17.5 L 22 27" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </Animated.View>
              {/* ] */}
              <Animated.View style={{ opacity: symbolOpacities[3] }}>
                <Svg height="35" width="24" viewBox="0 0 24 35">
                  <Path d="M 4 6 H 18 V 29 H 4" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </Animated.View>
              {/* > */}
              <Animated.View style={{ opacity: symbolOpacities[4] }}>
                <Svg height="35" width="28" viewBox="0 0 28 35">
                  <Path d="M 6 8 L 20 17.5 L 6 27" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </Animated.View>
            </View>
          </Animated.View>
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  touchableContainer: {
    flex: 1,
    width: '100%',
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 20,
  },
  logoContainer: {
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  haloWrapper: {
    marginBottom: -20,
    zIndex: 1,
  },
  aiText: {
    color: '#FFFFFF',
    fontSize: 92,
    fontWeight: '400',
    letterSpacing: 2,
    lineHeight: 92,
    zIndex: 2,
    textAlign: 'center',
    ...Platform.select({
      ios: { fontFamily: 'Poppins' },
      android: { fontFamily: 'Poppins' },
      web: { fontFamily: 'Poppins, sans-serif' },
    }),
  },
  smileArcContainer: {
    marginTop: -10,
    zIndex: 2,
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '400',
    letterSpacing: 3,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitleText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontStyle: 'italic',
    fontWeight: '300',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  footerContainer: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
});

export default SplashScreen;
