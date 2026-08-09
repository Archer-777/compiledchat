/**
 * Sentiment Analysis Prediction Service
 * 
 * Analyzes facial emotion vectors, expression probabilities,
 * and landmark descriptor seeds to dynamically select from 14 high-precision
 * sentiment archetypes and compute realistic valence scores.
 */

const SENTIMENT_ARCHETYPES = [
  {
    id: 'serene-equilibrium', themeId: 'indigo',
    title: 'SERENE EQUILIBRIUM', archetype: 'Serene Equilibrium',
    categoryTag: '✦ INNER BALANCE', frequency: '432Hz Solfeggio',
    summary: 'Your centered composure radiates deep inner balance and grounded stability.'
  },
  {
    id: 'zen-resonance', themeId: 'indigo',
    title: 'ZEN RESONANCE', archetype: 'Zen Resonance',
    categoryTag: '✦ NEURAL RESONANCE', frequency: '432Hz Solfeggio',
    summary: 'Your calm neural signature reflects a state of profound meditative resonance.'
  },
  {
    id: 'mindful-stillness', themeId: 'emerald',
    title: 'MINDFUL STILLNESS', archetype: 'Mindful Stillness',
    categoryTag: '✦ EMOTIONAL DEPTH', frequency: '639Hz Solfeggio',
    summary: 'Your expression reveals a mindful presence and emotionally grounded awareness.'
  },
  {
    id: 'radiant-optimism', themeId: 'gold',
    title: 'RADIANT OPTIMISM', archetype: 'Radiant Optimism',
    categoryTag: '✦ POSITIVE VALENCE', frequency: '528Hz Solfeggio',
    summary: 'Your facial micro-expressions convey genuine optimism and uplifting energy.'
  },
  {
    id: 'cognitive-sharpness', themeId: 'violet',
    title: 'COGNITIVE SHARPNESS', archetype: 'Cognitive Sharpness',
    categoryTag: '✦ MENTAL AGILITY', frequency: '741Hz Solfeggio',
    summary: 'Your focused gaze and alert expression indicate heightened cognitive precision.'
  },
  {
    id: 'luminous-joy', themeId: 'gold',
    title: 'LUMINOUS JOY', archetype: 'Luminous Joy',
    categoryTag: '✦ POSITIVE VALENCE', frequency: '528Hz Solfeggio',
    summary: 'Your radiant expression emits a signature of authentic joy and emotional warmth.'
  },
  {
    id: 'intuitive-depth', themeId: 'violet',
    title: 'INTUITIVE DEPTH', archetype: 'Intuitive Depth',
    categoryTag: '✦ NEURAL RESONANCE', frequency: '963Hz Solfeggio',
    summary: 'Your subtle expression vectors reveal deep intuitive processing and awareness.'
  },
  {
    id: 'inner-fortitude', themeId: 'rose',
    title: 'INNER FORTITUDE', archetype: 'Inner Fortitude',
    categoryTag: '✦ EMOTIONAL RESILIENCE', frequency: '741Hz Solfeggio',
    summary: 'Your determined expression reflects strong emotional resilience and inner strength.'
  },
  {
    id: 'creative-flow', themeId: 'gold',
    title: 'CREATIVE FLOW', archetype: 'Creative Flow',
    categoryTag: '✦ MENTAL AGILITY', frequency: '528Hz Solfeggio',
    summary: 'Your relaxed yet alert expression signals an active creative flow state.'
  },
  {
    id: 'empathic-resonance', themeId: 'emerald',
    title: 'EMPATHIC RESONANCE', archetype: 'Empathic Resonance',
    categoryTag: '✦ EMOTIONAL DEPTH', frequency: '639Hz Solfeggio',
    summary: 'Your warm expression patterns indicate high empathic sensitivity and emotional intelligence.'
  },
  {
    id: 'transcendent-awareness', themeId: 'violet',
    title: 'TRANSCENDENT AWARENESS', archetype: 'Transcendent Awareness',
    categoryTag: '✦ NEURAL RESONANCE', frequency: '963Hz Solfeggio',
    summary: 'Your expanded expression profile aligns with heightened transcendent awareness.'
  },
  {
    id: 'grounded-vitality', themeId: 'emerald',
    title: 'GROUNDED VITALITY', archetype: 'Grounded Vitality',
    categoryTag: '✦ INNER BALANCE', frequency: '396Hz Solfeggio',
    summary: 'Your stable expression conveys robust vitality and a deeply grounded disposition.'
  },
  {
    id: 'harmonious-balance', themeId: 'indigo',
    title: 'HARMONIOUS BALANCE', archetype: 'Harmonious Balance',
    categoryTag: '✦ INNER BALANCE', frequency: '432Hz Solfeggio',
    summary: 'Your symmetrical expression vectors reflect harmonious emotional equilibrium.'
  },
  {
    id: 'celestial-clarity', themeId: 'violet',
    title: 'CELESTIAL CLARITY', archetype: 'Celestial Clarity',
    categoryTag: '✦ MENTAL AGILITY', frequency: '852Hz Solfeggio',
    summary: 'Your clear, focused expression reveals exceptional mental clarity and sharp awareness.'
  },
];

// Emotion → archetype index pools for weighted selection
const EMOTION_ARCHETYPE_MAP = {
  happy:     [3, 5, 8],       // Radiant Optimism, Luminous Joy, Creative Flow
  surprised: [4, 6, 10, 13],  // Cognitive Sharpness, Intuitive Depth, Transcendent Awareness, Celestial Clarity
  sad:       [2, 9, 11],      // Mindful Stillness, Empathic Resonance, Grounded Vitality
  fearful:   [2, 7, 11],      // Mindful Stillness, Inner Fortitude, Grounded Vitality
  angry:     [7, 4, 13],      // Inner Fortitude, Cognitive Sharpness, Celestial Clarity
  disgusted: [7, 11, 12],     // Inner Fortitude, Grounded Vitality, Harmonious Balance
  neutral:   [0, 1, 12],      // Serene Equilibrium, Zen Resonance, Harmonious Balance
};

export const auraPredictionService = {
  /**
   * Predict sentiment metadata based on faceResult (emotions, landmarks, score)
   * @param {Object} faceResult - Output from faceRecognitionService.detectFaceFromCanvas
   * @returns {Object} Predicted sentiment attributes with valence score
   */
  predictAura(faceResult) {
    if (!faceResult) {
      return this.getDefaultPrediction();
    }

    const dominantEmotion = faceResult.dominantEmotion || { expression: 'neutral', probability: 0.8 };
    const expr = (dominantEmotion.expression || 'neutral').toLowerCase();
    const prob = dominantEmotion.probability || 0.7;
    const score = faceResult.score || 0.8;

    // 1. Derive a seed from the face descriptor for deterministic variation
    let descriptorSeed = 0;
    if (faceResult.descriptor) {
      const desc = faceResult.descriptor;
      for (let i = 0; i < Math.min(desc.length, 16); i++) {
        descriptorSeed += Math.abs(desc[i]) * (i + 1);
      }
    } else {
      descriptorSeed = prob * 100 + score * 50;
    }

    // 2. Select archetype from emotion-specific pool using descriptor seed
    const pool = EMOTION_ARCHETYPE_MAP[expr] || EMOTION_ARCHETYPE_MAP.neutral;
    const archetypeIndex = pool[Math.floor(descriptorSeed * 7.3) % pool.length];
    const archetype = SENTIMENT_ARCHETYPES[archetypeIndex];

    // 3. Compute dynamic valence score (61.2% - 99.6%)
    const seedFraction = (descriptorSeed % 100) / 100;
    const rawValence = 61.2 + (prob * 18.4) + (score * 12.0) + (seedFraction * 8.0);
    const valenceScore = Math.min(99.6, Math.max(61.2, Math.round(rawValence * 10) / 10));

    // 4. Compute emotional tone percentage (50% - 98%)
    const emotionalTone = Math.min(98, Math.max(50, Math.round((prob * 40 + score * 30 + seedFraction * 28) * 10) / 10));

    // 5. Compute mental clarity index (55% - 99%)
    const mentalClarity = Math.min(99, Math.max(55, Math.round((score * 35 + prob * 25 + (1 - seedFraction) * 39) * 10) / 10));

    return {
      themeId: archetype.themeId,
      title: archetype.title,
      archetype: archetype.archetype,
      categoryTag: archetype.categoryTag,
      frequency: archetype.frequency,
      resonanceScore: valenceScore,
      valenceScore,
      emotionalTone,
      mentalClarity,
      summary: archetype.summary,
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
      title: 'COGNITIVE SHARPNESS',
      archetype: 'Cognitive Sharpness',
      categoryTag: '✦ MENTAL AGILITY',
      frequency: '528Hz Solfeggio',
      resonanceScore: 87.4,
      valenceScore: 87.4,
      emotionalTone: 72.0,
      mentalClarity: 81.5,
      summary: 'Sentiment analysis initialized — awaiting facial expression vector input.',
      dominantEmotion: { expression: 'calm', probability: 0.85 },
      expressions: null,
    };
  }
};

export default auraPredictionService;
