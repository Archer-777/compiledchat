import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, SPACING, FONTS } from '../theme';

const STEP_LABELS = ['Info', 'Phone', 'Email', 'Done'];

const StepIndicator = ({ currentStep, totalSteps = 4 }) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const dotScales = useRef(
    Array.from({ length: totalSteps }, () => new Animated.Value(1))
  ).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: currentStep,
      duration: 500,
      useNativeDriver: false,
    }).start();

    // Pulse current dot
    Animated.sequence([
      Animated.timing(dotScales[currentStep], {
        toValue: 1.3,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(dotScales[currentStep], {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentStep]);

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        {/* Background line */}
        <View style={styles.line} />

        {/* Animated progress line */}
        <Animated.View
          style={[
            styles.progressLine,
            {
              width: progressAnim.interpolate({
                inputRange: [0, totalSteps - 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />

        {/* Dots */}
        {Array.from({ length: totalSteps }, (_, i) => {
          const isCompleted = i < currentStep;
          const isCurrent = i === currentStep;

          return (
            <Animated.View
              key={i}
              style={[
                styles.dotContainer,
                {
                  left: `${(i / (totalSteps - 1)) * 100}%`,
                  transform: [{ scale: dotScales[i] }],
                },
              ]}
            >
              <View
                style={[
                  styles.dot,
                  isCompleted && styles.dotCompleted,
                  isCurrent && styles.dotCurrent,
                ]}
              >
                {isCompleted ? (
                  <Text style={styles.checkmark}>✓</Text>
                ) : (
                  <Text style={[
                    styles.dotNumber,
                    isCurrent && styles.dotNumberCurrent,
                  ]}>
                    {i + 1}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  (isCompleted || isCurrent) && styles.stepLabelActive,
                ]}
              >
                {STEP_LABELS[i]}
              </Text>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  track: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'flex-start',
    position: 'relative',
  },
  line: {
    position: 'absolute',
    top: 14,
    left: '0%',
    right: '0%',
    height: 2,
    backgroundColor: COLORS.border,
  },
  progressLine: {
    position: 'absolute',
    top: 14,
    left: 0,
    height: 2,
    backgroundColor: COLORS.accent,
  },
  dotContainer: {
    position: 'absolute',
    alignItems: 'center',
    marginLeft: -14,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotCompleted: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  dotCurrent: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentDim,
  },
  checkmark: {
    fontSize: 13,
    color: '#000',
    fontWeight: '700',
  },
  dotNumber: {
    ...FONTS.body,
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  dotNumberCurrent: {
    color: COLORS.accent,
  },
  stepLabel: {
    ...FONTS.body,
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  stepLabelActive: {
    color: COLORS.accent,
  },
});

export default StepIndicator;
