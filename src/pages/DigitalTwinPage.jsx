import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import AmbientBackground from '@/components/visuals/AmbientBackground';

import DeviceFrame from '@/components/layout/DeviceFrame';
import ParticleBackground from '@/components/visuals/ParticleBackground';
import UnifiedSetupScreen from '@/components/features/digital_twin/screens/UnifiedSetupScreen';
import SoulCardScreen from '@/components/features/digital_twin/screens/SoulCardScreen';
import { getUserData } from '@/utils/storage';

export default function DigitalTwinPage() {
  const [currentStep, setCurrentStep] = useState(1);

  const [twinName, setTwinName] = useState('Archer_2.0');
  const [avatarImage, setAvatarImage] = useState(null);
  const [filterMode, setFilterMode] = useState('dramatic');
  const [overlayPattern, setOverlayPattern] = useState('halo');
  const [auraIntensity, setAuraIntensity] = useState(85);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isMobileFrame, setIsMobileFrame] = useState(false);

  useEffect(() => {
    const syncProfileData = async () => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const raw = window.localStorage.getItem('@spiritual_digital_twin_profile');
          if (raw) {
            const p = JSON.parse(raw);
            if (p.avatarImage) setAvatarImage(p.avatarImage);
            if (p.filterMode) setFilterMode(p.filterMode);
            if (p.overlayPattern) setOverlayPattern(p.overlayPattern);
            if (p.auraIntensity) setAuraIntensity(p.auraIntensity);
            if (p.twinName) setTwinName(p.twinName);
          }
        }

        const user = await getUserData();
        if (user && user.email) {
          const res = await fetch(`http://localhost:4000/api/v1/auth/digital-twin-profile?email=${encodeURIComponent(user.email)}`);
          if (res.ok) {
            const json = await res.json();
            if (json && json.success && json.profile) {
              const p = json.profile;
              if (p.avatarImage) setAvatarImage(p.avatarImage);
              if (p.filterMode) setFilterMode(p.filterMode);
              if (p.overlayPattern) setOverlayPattern(p.overlayPattern);
              if (p.auraIntensity) setAuraIntensity(p.auraIntensity);
              if (p.twinName) setTwinName(p.twinName);
              if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.setItem('@spiritual_digital_twin_profile', JSON.stringify(p));
              }
            }
          }
        }
      } catch (e) {}
    };
    syncProfileData();
  }, []);

  const saveTwinProfileToDB = async (newAvatar, newFilter, newPattern, newIntensity, newName) => {
    try {
      const p = {
        avatarImage: newAvatar !== undefined ? newAvatar : avatarImage,
        filterMode: newFilter || filterMode,
        overlayPattern: newPattern || overlayPattern,
        auraIntensity: newIntensity !== undefined ? newIntensity : auraIntensity,
        twinName: newName || twinName
      };
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('@spiritual_digital_twin_profile', JSON.stringify(p));
      }
      const user = await getUserData();
      if (user && user.email) {
        await fetch('http://localhost:4000/api/v1/auth/digital-twin-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email, ...p })
        });
      }
    } catch (e) {}
  };

  const playHaptic = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(432, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(864, audioCtx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch (e) {}
  };

  const handleUnlock = () => {
    playHaptic();
    setCurrentStep(2);
  };

  const handleReset = () => {
    playHaptic();
    setCurrentStep(1);
  };

  return (
    <AmbientBackground>
      <div className="relative min-h-screen w-full text-white font-sans overflow-x-hidden flex flex-col items-center justify-center py-6 px-4">
        {/* Interactive Spiritual Particle Canvas blended with Aurora Background */}
        <ParticleBackground intensity={isMobileFrame ? 0.7 : 1.2} />

        <main className="relative z-10 w-full max-w-md mx-auto my-auto flex flex-col items-center justify-center">
          <DeviceFrame
            isMobileFrame={isMobileFrame}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
          >
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <UnifiedSetupScreen
                  key="step1"
                  twinName={twinName}
                  setTwinName={(val) => { setTwinName(val); saveTwinProfileToDB(undefined, undefined, undefined, undefined, val); }}
                  avatarImage={avatarImage}
                  setAvatarImage={(val) => { setAvatarImage(val); saveTwinProfileToDB(val); }}
                  filterMode={filterMode}
                  setFilterMode={(val) => { setFilterMode(val); saveTwinProfileToDB(undefined, val); }}
                  overlayPattern={overlayPattern}
                  setOverlayPattern={(val) => { setOverlayPattern(val); saveTwinProfileToDB(undefined, undefined, val); }}
                  auraIntensity={auraIntensity}
                  setAuraIntensity={(val) => { setAuraIntensity(val); saveTwinProfileToDB(undefined, undefined, undefined, val); }}
                  onUnlock={handleUnlock}
                  playHaptic={playHaptic}
                />
              )}

              {currentStep === 2 && (
                <SoulCardScreen
                  key="step2"
                  twinName={twinName}
                  avatarImage={avatarImage}
                  filterMode={filterMode}
                  overlayPattern={overlayPattern}
                  auraIntensity={auraIntensity}
                  onReset={handleReset}
                  playHaptic={playHaptic}
                />
              )}
            </AnimatePresence>
          </DeviceFrame>
        </main>
      </div>
    </AmbientBackground>
  );
}
