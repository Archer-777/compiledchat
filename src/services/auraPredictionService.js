/**
 * Aura Prediction Service
 * 
 * Analyzes facial emotion vectors, facial expression probabilities, 
 * and landmark features to predict a user's Aura Archetype, 
 * Solfeggio Frequency Alignment, and Quantum Resonance Score.
 */

export const auraPredictionService = {
  /**
   * Predict Aura metadata based on faceResult (emotions, landmarks, score)
   * @param {Object} faceResult - Output from faceRecognitionService.detectFaceFromCanvas
   * @returns {Object} Predicted Aura attributes
   */
  predictAura(faceResult) {
    if (!faceResult) {
      return this.getDefaultPrediction();
    }

    const dominantEmotion = faceResult.dominantEmotion || { expression: 'neutral', probability: 0.8 };
    const expr = (dominantEmotion.expression || 'neutral').toLowerCase();
    const prob = dominantEmotion.probability || 0.7;
    const score = faceResult.score || 0.8;

    // 1. Emotion to Theme Mapping
    let themeId = 'indigo';
    let title = 'QUANTUM HARMONY';
    let archetype = 'Deep Resonance';
    let frequency = '432Hz Solfeggio';
    let summary = 'Your grounded focus aligns with universal balance at 432Hz.';

    if (expr === 'happy') {
      themeId = 'gold';
      title = 'SOLFEGGIO GOLD';
      archetype = 'Abundance Matrix';
      frequency = '528Hz Solfeggio';
      summary = 'Your radiant joy radiates transformation energy at 528Hz.';
    } else if (expr === 'surprised') {
      themeId = 'violet';
      title = 'TRANSCENDENT AURA';
      archetype = 'Cosmic Visionary';
      frequency = '963Hz Solfeggio';
      summary = 'Your expanded awareness aligns with crown frequency at 963Hz.';
    } else if (expr === 'sad' || expr === 'fearful') {
      themeId = 'emerald';
      title = 'EMERALD REGENESIS';
      archetype = 'Healing Field';
      frequency = '639Hz Solfeggio';
      summary = 'Your gentle introspection radiates restorative heart energy at 639Hz.';
    } else if (expr === 'angry' || expr === 'disgusted') {
      themeId = 'rose';
      title = 'ROSE VITALITY';
      archetype = 'Vitality Pulse';
      frequency = '741Hz Solfeggio';
      summary = 'Your passionate intensity ignites intuitive awakening at 741Hz.';
    } else {
      // Neutral / Default
      themeId = 'indigo';
      title = 'QUANTUM HARMONY';
      archetype = 'Deep Resonance';
      frequency = '432Hz Solfeggio';
      summary = 'Your calm, centered presence resonates at universal balance frequency 432Hz.';
    }

    // 2. Compute Deterministic Quantum Resonance Score (94.2% - 99.8%)
    const rawResonance = 94.2 + (prob * 3.8) + (score * 1.8);
    const resonanceScore = Math.min(99.8, Math.max(94.2, Math.round(rawResonance * 10) / 10));

    return {
      themeId,
      title,
      archetype,
      frequency,
      resonanceScore,
      summary,
      dominantEmotion,
      expressions: faceResult.expressions || null,
    };
  },

  /**
   * Fallback prediction when face detection is limited
   */
  getDefaultPrediction() {
    return {
      themeId: 'violet',
      title: 'TRANSCENDENT AURA',
      archetype: 'Cosmic Visionary',
      frequency: '528Hz Solfeggio',
      resonanceScore: 98.4,
      summary: 'Cosmic aura alignment initialized at 528Hz Solfeggio Frequency.',
      dominantEmotion: { expression: 'calm', probability: 0.85 },
      expressions: null,
    };
  }
};

export default auraPredictionService;
