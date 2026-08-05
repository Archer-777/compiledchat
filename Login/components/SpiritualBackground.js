import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { COLORS } from '../theme';

const { width, height } = Dimensions.get('window');

const MandalaRing = ({ size, delay, opacity }) => {
  const rotation = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeIn, {
      toValue: opacity,
      duration: 2000,
      delay,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 60000 + delay * 10,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.mandalaRing,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity: fadeIn,
          transform: [{ rotate: spin }],
        },
      ]}
    />
  );
};

const FloatingParticle = ({ x, y, size, delay }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: 0.6,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(translateY, {
            toValue: -30,
            duration: 4000,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: x,
          top: y,
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    />
  );
};

const SpiritualBackground = ({ children }) => {
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: Math.random() * width,
    y: Math.random() * height,
    size: 2 + Math.random() * 3,
    delay: Math.random() * 3000,
  }));

  return (
    <View style={styles.container}>
      {/* Background decorative elements */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {/* Radial gradient effect using layered views */}
        <View style={styles.gradientLayer1} />
        <View style={styles.gradientLayer2} />

        {/* Mandala rings */}
        <View style={styles.mandalaContainer}>
          <MandalaRing size={300} delay={0} opacity={0.04} />
          <MandalaRing size={220} delay={500} opacity={0.06} />
          <MandalaRing size={140} delay={1000} opacity={0.08} />
        </View>

        {/* Floating particles */}
        {particles.map((p) => (
          <FloatingParticle key={p.id} x={p.x} y={p.y} size={p.size} delay={p.delay} />
        ))}

        {/* Sacred symbols at corners */}
        <View style={[styles.cornerSymbol, styles.topLeft]}>
          <Animated.Text style={styles.symbolText}>✦</Animated.Text>
        </View>
        <View style={[styles.cornerSymbol, styles.topRight]}>
          <Animated.Text style={styles.symbolText}>✦</Animated.Text>
        </View>
        <View style={[styles.cornerSymbol, styles.bottomLeft]}>
          <Animated.Text style={styles.symbolText}>✦</Animated.Text>
        </View>
        <View style={[styles.cornerSymbol, styles.bottomRight]}>
          <Animated.Text style={styles.symbolText}>✦</Animated.Text>
        </View>
      </View>

      {/* Content */}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  gradientLayer1: {
    position: 'absolute',
    top: -height * 0.2,
    left: -width * 0.3,
    width: width * 1.6,
    height: height * 0.6,
    borderRadius: width,
    backgroundColor: 'rgba(201, 169, 110, 0.02)',
  },
  gradientLayer2: {
    position: 'absolute',
    bottom: -height * 0.1,
    right: -width * 0.2,
    width: width * 1.2,
    height: height * 0.4,
    borderRadius: width,
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
  },
  mandalaContainer: {
    position: 'absolute',
    top: height * 0.08,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mandalaRing: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderStyle: 'dashed',
  },
  particle: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
  cornerSymbol: {
    position: 'absolute',
    opacity: 0.1,
  },
  symbolText: {
    fontSize: 20,
    color: COLORS.accent,
  },
  topLeft: { top: 50, left: 20 },
  topRight: { top: 50, right: 20 },
  bottomLeft: { bottom: 30, left: 20 },
  bottomRight: { bottom: 30, right: 20 },
});

export default SpiritualBackground;
