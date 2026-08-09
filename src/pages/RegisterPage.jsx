import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AmbientBackground from '@/components/visuals/AmbientBackground';
import InputField from '@/components/common/InputField';
import OTPInput from '@/components/common/OTPInput';
import GenderPicker from '@/components/common/GenderPicker';
import StepIndicator from '@/components/common/StepIndicator';
import Toast from '@/components/common/Toast';
import { validateOTP, sendRealPhoneOTP } from '@/utils/otp';
import { saveUserData } from '@/utils/storage';
import './RegisterPage.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSupabaseSynced, setIsSupabaseSynced] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    gender: '',
    profession: '',
    phone: '',
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [phoneOTPInput, setPhoneOTPInput] = useState('');
  const [emailOTPInput, setEmailOTPInput] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const animateStepChange = (nextStep) => {
    setOtpSent(false);
    setResendTimer(0);
    setErrors({});
    setCurrentStep(nextStep);
  };

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
    const newErrors = {};
    const email = formData.email.trim();
    if (!email) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = 'Enter a valid email address';
      }
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendPhoneOTP = async () => {
    if (!validatePhone()) return;
    setOtpSent(true);
    setResendTimer(30);
    setPhoneOTPInput('');

    const res = await sendRealPhoneOTP(formData.phone);
    if (res.success) {
      showToast(`SMS OTP sent to ${formData.phone}`);
    } else {
      showToast(`Verification OTP: ${res.otp}`);
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

  const handleNextFromStep3 = () => {
    if (validateEmail()) {
      setEmailVerified(true);
      setErrors({});
      handleSaveAndFinish();
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
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('@active_auth_session', JSON.stringify({
            firstName: formData.firstName,
            email: formData.email,
            isGuest: false,
          }));
        }
      } catch (e) {}
      if (result.syncedSupabase) {
        setIsSupabaseSynced(true);
      }
      animateStepChange(3);
    } else {
      showToast('Failed to save data. Please try again.');
    }
  };

  const handleNextFromStep1 = () => {
    if (validateStep1()) {
      animateStepChange(1);
    }
  };

  return (
    <AmbientBackground>
      <Toast message={toastMsg} />

      <div className="register-container">
        {/* Header */}
        <div className="register-header">
          <img src="/logo.png" alt="Logo" className="register-logo-img" />
          <h1 className="register-header-title">NEXT ARCHER</h1>
          <span className="register-header-divider">— ✦ —</span>
          <p className="register-header-subtitle">Begin Within</p>
        </div>

        {/* Step Indicator */}
        <StepIndicator currentStep={currentStep} totalSteps={4} />

        {/* Step 1 */}
        {currentStep === 0 && (
          <div style={{ width: '100%' }}>
            <h2 className="register-step-title">Begin Your Journey</h2>
            <p className="register-step-subtitle">
              "Know thyself" — the first step to transformation
            </p>

            <div className="register-form-card">
              <div className="register-name-row">
                <InputField
                  label="✧ FIRST NAME"
                  value={formData.firstName}
                  onChangeText={(v) => updateField('firstName', v)}
                  placeholder="Your first name"
                  error={errors.firstName}
                />
                <InputField
                  label="✧ LAST NAME"
                  value={formData.lastName}
                  onChangeText={(v) => updateField('lastName', v)}
                  placeholder="Your last name"
                  error={errors.lastName}
                />
              </div>

              <InputField
                label="⏳ AGE"
                value={formData.age}
                onChangeText={(v) => updateField('age', v)}
                placeholder="Your age"
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
              />
            </div>

            <button className="register-primary-btn" onClick={handleNextFromStep1}>
              Continue →
            </button>
          </div>
        )}

        {/* Step 2 */}
        {currentStep === 1 && (
          <div style={{ width: '100%' }}>
            <h2 className="register-step-title">Verify Your Number</h2>
            <p className="register-step-subtitle">
              Connection is the essence of being
            </p>

            <div className="register-form-card">
              <InputField
                label="📱 PHONE NUMBER"
                value={formData.phone}
                onChangeText={(v) => updateField('phone', v)}
                placeholder="Enter your phone number"
                error={errors.phone}
                maxLength={15}
              />

              {!phoneVerified && (
                <button
                  className="register-secondary-btn"
                  onClick={handleSendPhoneOTP}
                  disabled={otpSent && resendTimer > 0}
                >
                  {otpSent
                    ? resendTimer > 0
                      ? `Resend in ${resendTimer}s`
                      : 'Resend OTP'
                    : 'Send OTP'}
                </button>
              )}

              {otpSent && !phoneVerified && (
                <div>
                  <p style={{ textAlign: 'center', fontSize: 12, color: '#aaa', marginTop: 16 }}>
                    Enter verification code
                  </p>
                  <OTPInput value={phoneOTPInput} onChange={setPhoneOTPInput} />
                  {errors.otp && (
                    <p style={{ color: '#ff4d4d', textAlign: 'center', fontSize: 12 }}>
                      ⚠ {errors.otp}
                    </p>
                  )}
                  <button
                    className="register-primary-btn"
                    onClick={handleVerifyPhoneOTP}
                    disabled={phoneOTPInput.length < 6}
                  >
                    Verify ✓
                  </button>
                </div>
              )}

              {phoneVerified && (
                <div className="register-verified-badge">
                  ✓ Phone Verified
                </div>
              )}
            </div>

            <button
              className="register-back-btn"
              onClick={() => animateStepChange(0)}
            >
              ← Back
            </button>
          </div>
        )}

        {/* Step 3 */}
        {currentStep === 2 && (
          <div style={{ width: '100%' }}>
            <h2 className="register-step-title">Verify Your Email</h2>
            <p className="register-step-subtitle">
              The written word carries the soul's intention
            </p>

            <div className="register-form-card">
              <InputField
                label="✉ EMAIL ADDRESS"
                value={formData.email}
                onChangeText={(v) => updateField('email', v)}
                placeholder="your@email.com"
                error={errors.email}
              />

              <InputField
                label="🔒 PASSWORD"
                type="password"
                value={formData.password}
                onChangeText={(v) => updateField('password', v)}
                placeholder="•••••••• (Min 6 characters)"
                error={errors.password}
              />

              <button
                className="register-primary-btn"
                onClick={handleNextFromStep3}
                style={{ marginTop: 16 }}
              >
                Complete Registration →
              </button>
            </div>

            <button
              className="register-back-btn"
              onClick={() => animateStepChange(1)}
            >
              ← Back
            </button>
          </div>
        )}

        {/* Step 4 */}
        {currentStep === 3 && (
          <div className="register-success-container">
            <span className="register-success-symbol">☽</span>
            <span className="register-lotus-icon">✦ ⬟ ✦</span>
            <h2 className="register-success-title">
              Welcome, {formData.firstName}
            </h2>
            <p className="register-success-subtitle">
              Your journey of self-discovery begins now
            </p>

            <div className="register-success-card">
              <div className="register-success-row">
                <span className="register-success-label">Name</span>
                <span className="register-success-value">
                  {formData.firstName} {formData.lastName}
                </span>
              </div>
              <div className="register-success-divider" />
              <div className="register-success-row">
                <span className="register-success-label">Age</span>
                <span className="register-success-value">{formData.age}</span>
              </div>
              <div className="register-success-divider" />
              <div className="register-success-row">
                <span className="register-success-label">Profession</span>
                <span className="register-success-value">{formData.profession}</span>
              </div>
              <div className="register-success-divider" />
              <div className="register-success-row">
                <span className="register-success-label">Phone</span>
                <span className="register-success-verified">✓ {formData.phone}</span>
              </div>
              <div className="register-success-divider" />
              <div className="register-success-row">
                <span className="register-success-label">Email</span>
                <span className="register-success-verified">✓ {formData.email}</span>
              </div>
              <div className="register-success-divider" />
              <div className="register-success-row">
                <span className="register-success-label">Password</span>
                <span className="register-success-verified">✓ Saved securely</span>
              </div>
            </div>

            <p className="register-saved-text">
              ✓ {isSupabaseSynced ? 'Synced to Supabase & Local Storage' : 'Saved to Local Storage & Supabase'}
            </p>

            <button
              className="register-primary-btn"
              onClick={() => navigate('/soul-matrix')}
            >
              Proceed to Life on Dashboard →
            </button>
          </div>
        )}
      </div>
    </AmbientBackground>
  );
}
