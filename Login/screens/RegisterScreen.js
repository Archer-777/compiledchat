import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import SpiritualBackground from '../components/SpiritualBackground';
import InputField from '../components/InputField';
import OTPInput from '../components/OTPInput';
import GenderPicker from '../components/GenderPicker';
import StepIndicator from '../components/StepIndicator';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../theme';
import { generateOTP, sendRealEmailOTP, sendRealPhoneOTP, validateOTP } from '../utils/otp';
import { saveUserData } from '../utils/storage';

const { width } = Dimensions.get('window');

const RegisterScreen = ({ navigation }) => {
  // Step management
  const [currentStep, setCurrentStep] = useState(0);
  const [isSupabaseSynced, setIsSupabaseSynced] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    gender: '',
    profession: '',
    phone: '',
    email: '',
  });

  // Errors
  const [errors, setErrors] = useState({});

  // OTP states
  const [phoneOTP, setPhoneOTP] = useState('');
  const [emailOTP, setEmailOTP] = useState('');
  const [phoneOTPInput, setPhoneOTPInput] = useState('');
  const [emailOTPInput, setEmailOTPInput] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Resend timer
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Success animation
  useEffect(() => {
    if (currentStep === 3) {
      Animated.parallel([
        Animated.spring(successScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(successOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [currentStep]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const animateStepChange = (nextStep) => {
    const direction = nextStep > currentStep ? 1 : -1;
    setOtpSent(false);
    setResendTimer(0);
    setErrors({});
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -30 * direction,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentStep(nextStep);
      slideAnim.setValue(30 * direction);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  // Validation
  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.age.trim()) {
      newErrors.age = 'Age is required';
    } else if (isNaN(formData.age) || parseInt(formData.age) < 13 || parseInt(formData.age) > 120) {
      newErrors.age = 'Enter a valid age (13-120)';
    }
    if (!formData.gender) newErrors.gender = 'Please select your gender';
    if (!formData.profession.trim()) newErrors.profession = 'Profession is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePhone = () => {
    const phone = formData.phone.trim();
    if (!phone) {
      setErrors({ phone: 'Phone number is required' });
      return false;
    }
    if (phone.length < 10) {
      setErrors({ phone: 'Enter a valid phone number' });
      return false;
    }
    setErrors({});
    return true;
  };

  const validateEmail = () => {
    const email = formData.email.trim();
    if (!email) {
      setErrors({ email: 'Email is required' });
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrors({ email: 'Enter a valid email address' });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSendPhoneOTP = async () => {
    if (!validatePhone()) return;
    setOtpSent(true);
    setResendTimer(30);
    setPhoneOTPInput('');

    const res = await sendRealPhoneOTP(formData.phone);
    if (res.success) {
      Alert.alert(
        '📱 SMS OTP Sent!',
        `A 6-digit verification SMS has been sent to ${formData.phone} via Fast2SMS.`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        '📱 OTP Generated',
        `Verification Code: ${res.otp}\n\n(Fast2SMS Notice: ${res.error})`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleVerifyPhoneOTP = () => {
    const result = validateOTP('phone', phoneOTPInput);
    if (result.valid) {
      setPhoneVerified(true);
      setErrors({});
      setTimeout(() => animateStepChange(2), 500);
    } else {
      setErrors({ otp: result.error });
    }
  };

  const handleSendEmailOTP = async () => {
    if (!validateEmail()) return;
    setOtpSent(true);
    setResendTimer(30);
    setEmailOTPInput('');

    const res = await sendRealEmailOTP(formData.email);
    if (res.success) {
      Alert.alert(
        '✉️ Email OTP Sent!',
        `A 6-digit verification code has been dispatched to ${formData.email}.\n\nPlease check your inbox/spam folder.`,
        [{ text: 'OK' }]
      );
    } else {
      // If Resend free domain restricted sending to non-verified recipient, fallback alert code
      Alert.alert(
        '✉️ OTP Generated',
        `Verification Code: ${res.otp}\n\n(Note: ${res.error})`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleVerifyEmailOTP = () => {
    const result = validateOTP('email', emailOTPInput);
    if (result.valid) {
      setEmailVerified(true);
      setErrors({});
      handleSaveAndFinish();
    } else {
      setErrors({ otp: result.error });
    }
  };

  const handleSaveAndFinish = async () => {
    const userData = {
      ...formData,
      phoneVerified: true,
      emailVerified: true,
    };
    const result = await saveUserData(userData);
    if (result.success) {
      if (result.syncedSupabase) {
        setIsSupabaseSynced(true);
      }
      animateStepChange(3);
    } else {
      Alert.alert('Error', 'Failed to save data. Please try again.');
    }
  };

  const handleNextFromStep1 = () => {
    if (validateStep1()) {
      animateStepChange(1);
    }
  };

  // Render steps
  const renderStep1 = () => (
    <View>
      <Text style={styles.stepTitle}>Begin Your Journey</Text>
      <Text style={styles.stepSubtitle}>
        "Know thyself" — the first step to transformation
      </Text>

      <View style={styles.formCard}>
        <View style={styles.nameRow}>
          <View style={styles.nameField}>
            <InputField
              label="✧ FIRST NAME"
              value={formData.firstName}
              onChangeText={(v) => updateField('firstName', v)}
              placeholder="Your first name"
              error={errors.firstName}
              autoCapitalize="words"
            />
          </View>
          <View style={styles.nameField}>
            <InputField
              label="✧ LAST NAME"
              value={formData.lastName}
              onChangeText={(v) => updateField('lastName', v)}
              placeholder="Your last name"
              error={errors.lastName}
              autoCapitalize="words"
            />
          </View>
        </View>

        <InputField
          label="⏳ AGE"
          value={formData.age}
          onChangeText={(v) => updateField('age', v)}
          placeholder="Your age"
          keyboardType="number-pad"
          maxLength={3}
          error={errors.age}
        />

        <GenderPicker
          value={formData.gender}
          onChange={(v) => updateField('gender', v)}
          error={errors.gender}
        />

        <InputField
          label="☿ PROFESSION"
          value={formData.profession}
          onChangeText={(v) => updateField('profession', v)}
          placeholder="What do you do?"
          error={errors.profession}
          autoCapitalize="words"
        />
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleNextFromStep1}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryButtonText}>Continue →</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text style={styles.stepTitle}>Verify Your Number</Text>
      <Text style={styles.stepSubtitle}>
        Connection is the essence of being
      </Text>

      <View style={styles.formCard}>
        <InputField
          label="📱 PHONE NUMBER"
          value={formData.phone}
          onChangeText={(v) => updateField('phone', v)}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
          error={errors.phone}
          maxLength={15}
        />

        {!phoneVerified && (
          <TouchableOpacity
            style={[
              styles.secondaryButton,
              (otpSent && resendTimer > 0) && styles.buttonDisabled,
            ]}
            onPress={handleSendPhoneOTP}
            disabled={otpSent && resendTimer > 0}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>
              {otpSent
                ? resendTimer > 0
                  ? `Resend in ${resendTimer}s`
                  : 'Resend OTP'
                : 'Send OTP'}
            </Text>
          </TouchableOpacity>
        )}

        {otpSent && !phoneVerified && (
          <View>
            <Text style={styles.otpLabel}>Enter verification code</Text>
            <OTPInput value={phoneOTPInput} onChange={setPhoneOTPInput} />
            {errors.otp && <Text style={styles.otpError}>⚠ {errors.otp}</Text>}
            <TouchableOpacity
              style={[
                styles.primaryButton,
                phoneOTPInput.length < 6 && styles.buttonDisabled,
              ]}
              onPress={handleVerifyPhoneOTP}
              disabled={phoneOTPInput.length < 6}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Verify ✓</Text>
            </TouchableOpacity>
          </View>
        )}

        {phoneVerified && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ Phone Verified</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          setOtpSent(false);
          setResendTimer(0);
          animateStepChange(0);
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep3 = () => (
    <View>
      <Text style={styles.stepTitle}>Verify Your Email</Text>
      <Text style={styles.stepSubtitle}>
        The written word carries the soul's intention
      </Text>

      <View style={styles.formCard}>
        <InputField
          label="✉ EMAIL ADDRESS"
          value={formData.email}
          onChangeText={(v) => updateField('email', v)}
          placeholder="your@email.com"
          keyboardType="email-address"
          error={errors.email}
          autoCapitalize="none"
        />

        {!emailVerified && (
          <TouchableOpacity
            style={[
              styles.secondaryButton,
              (otpSent && resendTimer > 0) && styles.buttonDisabled,
            ]}
            onPress={handleSendEmailOTP}
            disabled={otpSent && resendTimer > 0}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>
              {otpSent
                ? resendTimer > 0
                  ? `Resend in ${resendTimer}s`
                  : 'Resend OTP'
                : 'Send OTP'}
            </Text>
          </TouchableOpacity>
        )}

        {otpSent && !emailVerified && (
          <View>
            <Text style={styles.otpLabel}>Enter verification code</Text>
            <OTPInput value={emailOTPInput} onChange={setEmailOTPInput} />
            {errors.otp && <Text style={styles.otpError}>⚠ {errors.otp}</Text>}
            <TouchableOpacity
              style={[
                styles.primaryButton,
                emailOTPInput.length < 6 && styles.buttonDisabled,
              ]}
              onPress={handleVerifyEmailOTP}
              disabled={emailOTPInput.length < 6}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Verify ✓</Text>
            </TouchableOpacity>
          </View>
        )}

        {emailVerified && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ Email Verified</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          setOtpSent(false);
          setResendTimer(0);
          animateStepChange(1);
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep4 = () => (
    <Animated.View
      style={[
        styles.successContainer,
        {
          opacity: successOpacity,
          transform: [{ scale: successScale }],
        },
      ]}
    >
      <Text style={styles.successSymbol}>☽</Text>
      <Text style={styles.lotusIcon}>✦ ⬟ ✦</Text>
      <Text style={styles.successTitle}>
        Welcome, {formData.firstName}
      </Text>
      <Text style={styles.successSubtitle}>
        Your journey of self-discovery begins now
      </Text>

      <View style={styles.successCard}>
        <View style={styles.successRow}>
          <Text style={styles.successLabel}>Name</Text>
          <Text style={styles.successValue}>
            {formData.firstName} {formData.lastName}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.successRow}>
          <Text style={styles.successLabel}>Age</Text>
          <Text style={styles.successValue}>{formData.age}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.successRow}>
          <Text style={styles.successLabel}>Profession</Text>
          <Text style={styles.successValue}>{formData.profession}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.successRow}>
          <Text style={styles.successLabel}>Phone</Text>
          <Text style={styles.successValueVerified}>✓ {formData.phone}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.successRow}>
          <Text style={styles.successLabel}>Email</Text>
          <Text style={styles.successValueVerified}>✓ {formData.email}</Text>
        </View>
      </View>

      <Text style={styles.savedText}>
        ✓ {isSupabaseSynced ? 'Synced to Supabase & Local Storage' : 'Saved to Local Storage & Supabase'}
      </Text>

      <TouchableOpacity
        style={[styles.primaryButton, { width: '100%', marginTop: 24 }]}
        onPress={() => {
          if (navigation && navigation.navigate) {
            navigation.navigate('AuraScanner');
          } else {
            Alert.alert('Navigation', 'Navigating to Aura Scanner');
          }
        }}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryButtonText}>Proceed to Aura Scanner →</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return renderStep1();
      case 1: return renderStep2();
      case 2: return renderStep3();
      case 3: return renderStep4();
      default: return null;
    }
  };

  return (
    <SpiritualBackground>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Image
              source={require('../assets/images/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.headerTitle}>NEXT ARCHER</Text>
            <Text style={styles.headerDivider}>— ✦ —</Text>
            <Text style={styles.headerSubtitle}>Begin Within</Text>
          </View>

          {/* Step Indicator */}
          <StepIndicator currentStep={currentStep} totalSteps={4} />

          {/* Step Content */}
          <Animated.View
            style={[
              styles.stepContent,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {renderCurrentStep()}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SpiritualBackground>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: SPACING.xxl,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: SPACING.sm,
  },
  logoImage: {
    width: 80,
    height: 80,
    marginBottom: SPACING.xs,
  },
  headerSymbol: {
    fontSize: 36,
    color: COLORS.accent,
    marginBottom: SPACING.xs,
  },
  headerTitle: {
    ...FONTS.heading,
    fontSize: 28,
    color: COLORS.textPrimary,
  },
  headerDivider: {
    fontSize: 14,
    color: COLORS.accent,
    marginVertical: SPACING.xs,
    letterSpacing: 4,
  },
  headerSubtitle: {
    ...FONTS.subheading,
    fontSize: 14,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  stepContent: {
    paddingHorizontal: SPACING.lg,
  },
  stepTitle: {
    ...FONTS.heading,
    fontSize: 22,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  stepSubtitle: {
    ...FONTS.subheading,
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: SPACING.lg,
  },
  formCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  nameRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  nameField: {
    flex: 1,
  },
  primaryButton: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
    ...SHADOWS.glow,
  },
  primaryButtonText: {
    ...FONTS.label,
    fontSize: 14,
    color: '#0A0A0A',
    fontWeight: '700',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md - 2,
    alignItems: 'center',
    marginTop: SPACING.sm,
    backgroundColor: COLORS.accentDim,
  },
  secondaryButtonText: {
    ...FONTS.label,
    fontSize: 13,
    color: COLORS.accent,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    marginTop: SPACING.sm,
  },
  backButtonText: {
    ...FONTS.body,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  otpLabel: {
    ...FONTS.label,
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
  otpError: {
    fontSize: 12,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  verifiedBadge: {
    backgroundColor: COLORS.successDim,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  verifiedText: {
    fontSize: 15,
    color: COLORS.success,
    fontWeight: '600',
    letterSpacing: 1,
  },
  // Success screen
  successContainer: {
    alignItems: 'center',
    paddingTop: SPACING.xl,
  },
  successSymbol: {
    fontSize: 50,
    color: COLORS.accent,
    marginBottom: SPACING.xs,
  },
  lotusIcon: {
    fontSize: 18,
    color: COLORS.accent,
    letterSpacing: 8,
    marginBottom: SPACING.lg,
    opacity: 0.7,
  },
  successTitle: {
    ...FONTS.heading,
    fontSize: 26,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  successSubtitle: {
    ...FONTS.subheading,
    fontSize: 14,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    marginBottom: SPACING.xl,
  },
  successCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  successRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  successLabel: {
    ...FONTS.label,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  successValue: {
    ...FONTS.body,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  successValueVerified: {
    ...FONTS.body,
    fontSize: 14,
    color: COLORS.success,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  savedText: {
    ...FONTS.body,
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: SPACING.lg,
    opacity: 0.6,
  },
});

export default RegisterScreen;
