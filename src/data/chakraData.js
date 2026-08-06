// EXACT CHAKRA COLORS MAP
export const chakraColors = {
  root: "#DA0807",
  sacral: "#F45A1C",
  solar: "#F49021",
  heart: "#069140",
  throat: "#06A5A8",
  thirdEye: "#2F15AE",
  crown: "#5D10C0",
  universal: "#7C4DFF"
};

// ADAPTIVE COLORS (brighter variants for backgrounds/glows)
export const adaptiveColors = {
  root: '#FF1E27',
  sacral: '#FF7300',
  solar: '#FFD700',
  heart: '#00FF66',
  throat: '#00E5FF',
  thirdEye: '#4B0082',
  crown: '#9D00FF',
  universal: '#7C4DFF',
};

// CHAKRA DATA REGISTRY
export const chakraData = [
  {
    id: "root",
    name: "Root Chakra",
    sanskrit: "Muladhara",
    color: chakraColors.root,
    exactColor: chakraColors.root,
    frequency: "396 Hz",
    frequencyNumber: 396,
    description: "Grounding, stability, safety and survival.",
    element: "Earth",
    mantra: "LAM",
    imagePath: "/chakras/root_chakra_red-removebg-preview.png",
  },
  {
    id: "sacral",
    name: "Sacral Chakra",
    sanskrit: "Svadhisthana",
    color: chakraColors.sacral,
    exactColor: chakraColors.sacral,
    frequency: "417 Hz",
    frequencyNumber: 417,
    description: "Creativity, emotions, pleasure and relationships.",
    element: "Water",
    mantra: "VAM",
    imagePath: "/chakras/slar_plexus_chakra_deep_yellow-removebg-preview.png",
  },
  {
    id: "solar",
    name: "Solar Plexus Chakra",
    sanskrit: "Manipura",
    color: chakraColors.solar,
    exactColor: chakraColors.solar,
    frequency: "528 Hz",
    frequencyNumber: 528,
    description: "Confidence, transformation and personal power.",
    element: "Fire",
    mantra: "RAM",
    imagePath: "/chakras/slar_plexus_chakra_deep_yellow-removebg-preview.png",
  },
  {
    id: "heart",
    name: "Heart Chakra",
    sanskrit: "Anahata",
    color: chakraColors.heart,
    exactColor: chakraColors.heart,
    frequency: "639 Hz",
    frequencyNumber: 639,
    description: "Love, compassion, emotional healing and balance.",
    element: "Air",
    mantra: "YAM",
    imagePath: "/chakras/heart_chakra_green-removebg-preview.png",
  },
  {
    id: "throat",
    name: "Throat Chakra",
    sanskrit: "Vishuddha",
    color: chakraColors.throat,
    exactColor: chakraColors.throat,
    frequency: "741 Hz",
    frequencyNumber: 741,
    description: "Communication, truth and authentic expression.",
    element: "Ether",
    mantra: "HAM",
    imagePath: "/chakras/throat_chakra_teal-removebg-preview.png",
  },
  {
    id: "thirdEye",
    name: "Third Eye Chakra",
    sanskrit: "Ajna",
    color: chakraColors.thirdEye,
    exactColor: chakraColors.thirdEye,
    frequency: "852 Hz",
    frequencyNumber: 852,
    description: "Intuition, perception and spiritual awareness.",
    element: "Light",
    mantra: "OM",
    imagePath: "/chakras/third_eye_chakra_blue-removebg-preview.png",
  },
  {
    id: "crown",
    name: "Crown Chakra",
    sanskrit: "Sahasrara",
    color: chakraColors.crown,
    exactColor: chakraColors.crown,
    frequency: "963 Hz",
    frequencyNumber: 963,
    description: "Higher consciousness and divine connection.",
    element: "Cosmos",
    mantra: "AH",
    imagePath: "/chakras/crown_chakra_indigo-removebg-preview.png",
  },
  {
    id: "universal",
    name: "Universal Energy",
    sanskrit: "Brahmanda",
    color: chakraColors.universal,
    exactColor: chakraColors.universal,
    frequency: "432 Hz",
    frequencyNumber: 432,
    description: "Universal healing energy connecting mind, body and consciousness.",
    element: "Divine Energy",
    mantra: "SO HUM",
    imagePath: "/chakras/crown_chakra_indigo-removebg-preview.png",
  },
];

export const getChakraData = (id) => {
  if (!id) return chakraData[3];
  const norm = String(id).toLowerCase();
  return (
    chakraData.find(
      c => c.id.toLowerCase() === norm ||
      (norm === 'thirdeye' && c.id === 'thirdEye') ||
      (norm === 'third_eye' && c.id === 'thirdEye') ||
      (norm === 'solar_plexus' && c.id === 'solar')
    ) || chakraData[3]
  );
};
