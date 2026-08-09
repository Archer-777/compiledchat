// WEB AUDIO API SOLFEGGIO FREQUENCY SYNTHESIZER
let audioCtx = null;
let currentOsc = null;
let currentGain = null;

export const playSolfeggioTone = (frequencyHz) => {
  try {
    stopSolfeggioTone();

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    audioCtx = new AudioContextClass();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    currentOsc = audioCtx.createOscillator();
    currentGain = audioCtx.createGain();

    currentOsc.type = 'sine';
    currentOsc.frequency.setValueAtTime(Number(frequencyHz) || 528, audioCtx.currentTime);

    currentGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
    currentGain.gain.exponentialRampToValueAtTime(0.25, audioCtx.currentTime + 0.3);

    currentOsc.connect(currentGain);
    currentGain.connect(audioCtx.destination);

    currentOsc.start();
  } catch (err) {
    console.warn('Audio play error:', err);
  }
};

export const stopSolfeggioTone = () => {
  try {
    if (currentGain && audioCtx) {
      try {
        currentGain.gain.setValueAtTime(currentGain.gain.value || 0.25, audioCtx.currentTime);
        currentGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.05);
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
    if (audioCtx) {
      try {
        if (audioCtx.state !== 'closed') {
          audioCtx.close();
        }
      } catch (e) {}
      audioCtx = null;
    }
  } catch (e) {
    currentOsc = null;
    currentGain = null;
    audioCtx = null;
  }
};
