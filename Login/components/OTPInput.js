import React, { useRef, useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Animated } from 'react-native';
import { COLORS, SPACING, RADIUS, FONTS } from '../theme';

const OTPInput = ({ length = 6, value, onChange }) => {
  const inputRefs = useRef([]);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const pulseAnims = useRef(
    Array.from({ length }, () => new Animated.Value(0))
  ).current;

  const digits = value.split('').concat(Array(length - value.length).fill(''));

  useEffect(() => {
    if (focusedIndex >= 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnims[focusedIndex], {
            toValue: 1,
            duration: 800,
            useNativeDriver: false,
          }),
          Animated.timing(pulseAnims[focusedIndex], {
            toValue: 0,
            duration: 800,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
    return () => {
      pulseAnims.forEach((anim) => anim.stopAnimation());
    };
  }, [focusedIndex]);

  const handleChange = (text, index) => {
    // Handle paste of full OTP
    if (text.length > 1) {
      const newValue = text.slice(0, length);
      onChange(newValue);
      const lastIndex = Math.min(newValue.length, length) - 1;
      inputRefs.current[lastIndex]?.focus();
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = text;
    const newValue = newDigits.join('');
    onChange(newValue);

    // Auto-advance
    if (text && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newDigits = [...digits];
      newDigits[index - 1] = '';
      onChange(newDigits.join(''));
    }
  };

  return (
    <View style={styles.container}>
      {digits.map((digit, index) => {
        const borderColor = pulseAnims[index].interpolate({
          inputRange: [0, 1],
          outputRange: [
            focusedIndex === index ? COLORS.accent : digit ? COLORS.borderLight : COLORS.border,
            COLORS.accentLight,
          ],
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.digitBox,
              {
                borderColor: focusedIndex === index ? borderColor : (digit ? COLORS.borderLight : COLORS.border),
                backgroundColor: digit ? COLORS.surfaceLight : COLORS.surface,
              },
            ]}
          >
            <TextInput
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={styles.digitInput}
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(-1)}
              keyboardType="number-pad"
              maxLength={index === 0 ? length : 1}
              selectionColor={COLORS.accent}
              caretHidden
            />
          </Animated.View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm + 2,
    marginVertical: SPACING.lg,
  },
  digitBox: {
    width: 46,
    height: 54,
    borderWidth: 1.5,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  digitInput: {
    ...FONTS.body,
    fontSize: 22,
    color: COLORS.textPrimary,
    textAlign: 'center',
    width: '100%',
    height: '100%',
    fontWeight: '600',
  },
});

export default OTPInput;
