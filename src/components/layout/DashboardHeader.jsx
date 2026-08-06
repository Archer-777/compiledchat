import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MaslowPyramid from '@/components/visuals/MaslowPyramid';
import ChakraFigure from '@/components/visuals/ChakraFigure';

const SLIDES = [
  { id: 'chakra', title: 'UNIVERSAL ENERGY' },
  { id: 'maslow', title: 'CONSCIOUSNESS AWARENESS' },
];

function VisualizerCarousel({ maslowLevels, chakras }) {
  const [index, setIndex] = useState(0);

  const handleDragEnd = (_, info) => {
    const threshold = 30;
    if (info.offset.x < -threshold || info.velocity.x < -150) {
      setIndex(1);
    } else if (info.offset.x > threshold || info.velocity.x > 150) {
      setIndex(0);
    }
  };

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="relative w-full overflow-hidden rounded-2xl">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={index}
            initial={{ opacity: 0, x: index === 1 ? 80 : -80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: index === 1 ? -80 : 80 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="w-full cursor-grab active:cursor-grabbing select-none"
          >
            {index === 0 ? (
              <ChakraFigure chakras={chakras} />
            ) : (
              <MaslowPyramid levels={maslowLevels} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-center items-center gap-1.5 py-1">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.id}
            onClick={() => setIndex(i)}
            className="p-1 cursor-pointer group"
          >
            <span
              className={`block rounded-full transition-all duration-300 ${
                index === i
                  ? 'w-5 h-1.5 bg-cyan-400 shadow-[0_0_8px_rgba(0,229,255,0.7)]'
                  : 'w-1.5 h-1.5 bg-gray-600 group-hover:bg-gray-400'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function DashboardHeader({ userName = 'Neha', maslowLevels, chakras, onBack }) {
  const [currentSlide, setCurrentSlide] = useState('chakra');

  return (
    <header className="w-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/10 cursor-pointer"
          >
            ←
          </button>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight font-['Poppins']">
              Soul Matrix
            </h1>
            <p className="text-xs text-purple-300 font-medium">
              Welcome back, <span className="text-cyan-300 font-bold">{userName}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-300">Synchronized</span>
        </div>
      </div>

      <div className="flex bg-black/40 p-1 rounded-full border border-white/10 max-w-xs mx-auto">
        <button
          onClick={() => setCurrentSlide('chakra')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
            currentSlide === 'chakra'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Universal Energy
        </button>
        <button
          onClick={() => setCurrentSlide('maslow')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
            currentSlide === 'maslow'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Maslow Matrix
        </button>
      </div>

      <div className="w-full">
        {currentSlide === 'chakra' ? (
          <ChakraFigure chakras={chakras} />
        ) : (
          <MaslowPyramid levels={maslowLevels} />
        )}
      </div>
    </header>
  );
}
