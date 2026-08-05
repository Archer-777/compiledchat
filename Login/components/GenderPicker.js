import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../theme';

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male', icon: '♂' },
  { value: 'female', label: 'Female', icon: '♀' },
  { value: 'non-binary', label: 'Non-Binary', icon: '⚧' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say', icon: '—' },
];

const GenderPicker = ({ value, onChange, error }) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.label, error && styles.labelError]}>⚤ GENDER</Text>
      <View style={styles.optionsRow}>
        {GENDER_OPTIONS.map((option) => {
          const isSelected = value === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.pill,
                isSelected && styles.pillSelected,
              ]}
              onPress={() => onChange(option.value)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.pillIcon,
                isSelected && styles.pillIconSelected,
              ]}>
                {option.icon}
              </Text>
              <Text
                style={[
                  styles.pillText,
                  isSelected && styles.pillTextSelected,
                ]}
                numberOfLines={1}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {error ? <Text style={styles.errorText}>⚠ {error}</Text> : null}
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
    marginBottom: SPACING.sm,
    marginLeft: 2,
  },
  labelError: {
    color: COLORS.error,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    gap: 6,
  },
  pillSelected: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentDim,
  },
  pillIcon: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  pillIconSelected: {
    color: COLORS.accent,
  },
  pillText: {
    ...FONTS.body,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  pillTextSelected: {
    color: COLORS.accent,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: SPACING.xs,
    marginLeft: 2,
  },
});

export default GenderPicker;
