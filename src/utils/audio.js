// WEB AUDIO API SOLFEGGIO FREQUENCY SYNTHESIZER (iOS WebKit Resilient Singleton)
let audioCtx = null;
let currentOsc = null;
let currentGain = null;

function getOrCreateAudioContext() {
  try {
    const AudioContextClass = typeof window !== 'undefined'
      ? (window.AudioContext || window.webkitAudioContext)
      : null;
    if (!AudioContextClass) return null;

    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch (e) {
    console.warn('AudioContext init notice:', e);
    return null;
  }
}

export const playSolfeggioTone = (frequencyHz) => {
  try {
    stopSolfeggioTone();

    const ctx = getOrCreateAudioContext();
    if (!ctx) return;

    currentOsc = ctx.createOscillator();
    currentGain = ctx.createGain();

    currentOsc.type = 'sine';
    currentOsc.frequency.setValueAtTime(Number(frequencyHz) || 528, ctx.currentTime);

    currentGain.gain.setValueAtTime(0.001, ctx.currentTime);
    currentGain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.3);

    currentOsc.connect(currentGain);
    currentGain.connect(ctx.destination);

    currentOsc.start();
  } catch (err) {
    console.warn('Audio play error:', err);
  }
};

export const stopSolfeggioTone = () => {
  try {
    if (currentGain && audioCtx && audioCtx.state !== 'closed') {
      try {
        currentGain.gain.setValueAtTime(currentGain.gain.value || 0.25, audioCtx.currentTime);
        currentGain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
      } catch (e) {}
    }
    if (currentOsc) {
      try {
        currentOsc.stop();
        currentOsc.disconnect();
      } catch (e) {}
      currentOsc = null;
    }
    if (currentGain) {
      try { currentGain.disconnect(); } catch (e) {}
      currentGain = null;
    }
    // Note: Do NOT call audioCtx.close() here to prevent exhausting iOS WebKit AudioContext limits
  } catch (e) {
    currentOsc = null;
    currentGain = null;
  }
};
