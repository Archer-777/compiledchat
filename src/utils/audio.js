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
      currentGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.2);
      setTimeout(() => {
        if (currentOsc) {
          try { currentOsc.stop(); currentOsc.disconnect(); } catch (e) {}
          currentOsc = null;
        }
        if (audioCtx) {
          try { audioCtx.close(); } catch (e) {}
          audioCtx = null;
        }
      }, 200);
    }
  } catch (e) {
    currentOsc = null;
    audioCtx = null;
  }
};
