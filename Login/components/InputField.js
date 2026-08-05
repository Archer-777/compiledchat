import React, { useRef, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Animated } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../theme';

const InputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  error,
  icon,
  maxLength,
  autoCapitalize = 'sentences',
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const glowAnim = useRef(new Animated.Value(0)).current;
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.parallel([
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(labelAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(glowAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
    if (!value) {
      Animated.timing(labelAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const borderColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? COLORS.error : COLORS.border, error ? COLORS.error : COLORS.borderFocused],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.15],
  });

  return (
    <View style={styles.container}>
      <Text style={[styles.label, error && styles.labelError]}>
        {icon} {label}
      </Text>
      <Animated.View
        style={[
          styles.inputWrapper,
          {
            borderColor,
          },
        ]}
      >
        {/* Glow effect */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.glowOverlay,
            {
              opacity: glowOpacity,
              backgroundColor: error ? COLORS.error : COLORS.accent,
            },
          ]}
        />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textPlaceholder}
          keyboardType={keyboardType}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize}
          onFocus={handleFocus}
          onBlur={handleBlur}
          selectionColor={COLORS.accent}
        />
      </Animated.View>
      {error ? (
        <Text style={styles.errorText}>⚠ {error}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    ...FONTS.label,
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs + 2,
    marginLeft: 2,
  },
  labelError: {
    color: COLORS.error,
  },
  inputWrapper: {
    borderWidth: 1,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
  },
  glowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: RADIUS.md,
  },
  input: {
    ...FONTS.body,
    fontSize: 16,
    color: COLORS.textPrimary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md - 2,
    minHeight: 50,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: SPACING.xs,
    marginLeft: 2,
  },
});

export default InputField;
