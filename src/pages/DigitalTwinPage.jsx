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
    const fetchTwinName = async () => {
      try {
        const user = await getUserData();
        const rawName = user?.firstName || (user?.fullName ? user.fullName.split(' ')[0] : '');
        
        try {
          const res = await fetch(`http://localhost:8000/api/auth/digital-twin-name${rawName ? `?name=${encodeURIComponent(rawName)}` : ''}`);
          const json = await res.json();
          if (json && json.success && json.twinName) {
            setTwinName(json.twinName);
            return;
          }
        } catch (e) {
          try {
            const res2 = await fetch(`http://localhost:4000/api/auth/digital-twin-name${rawName ? `?name=${encodeURIComponent(rawName)}` : ''}`);
            const json2 = await res2.json();
            if (json2 && json2.success && json2.twinName) {
              setTwinName(json2.twinName);
              return;
            }
          } catch (e2) {}
        }

        const nameBase = rawName || 'Archer';
        setTwinName(`${nameBase}_2.0`);
      } catch (e) {
        setTwinName('Archer_2.0');
      }
    };

    fetchTwinName();
  }, []);

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
                  setTwinName={setTwinName}
                  avatarImage={avatarImage}
                  setAvatarImage={setAvatarImage}
                  filterMode={filterMode}
                  setFilterMode={setFilterMode}
                  overlayPattern={overlayPattern}
                  setOverlayPattern={setOverlayPattern}
                  auraIntensity={auraIntensity}
                  setAuraIntensity={setAuraIntensity}
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
