import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ShieldCheck, Share2, Sparkles, RefreshCw, Cpu, Activity, CheckCircle2, ArrowRight } from 'lucide-react';
import { getUserData } from '@/utils/storage';

export default function SoulCardScreen({
  twinName,
  avatarImage,
  filterMode,
  overlayPattern,
  auraIntensity,
  onReset,
  playHaptic
}) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [workspaceActive, setWorkspaceActive] = useState(false);

  // Motion values for 3D card tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  useEffect(() => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#ffffff', '#a1a1aa', '#52525b', '#e4e4e7']
      });
    } catch (e) {
      // safe fallback
    }
  }, []);

  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const data = await getUserData();
      if (data) setUserData(data);
    };
    fetchUser();
  }, []);

  const getFilterClass = () => {
    switch (filterMode) {
      case 'dramatic': return 'filter-bw-dramatic';
      case 'ethereal': return 'filter-bw-ethereal';
      case 'mystic': return 'filter-bw-mystic';
      default: return 'grayscale(100%)';
    }
  };

  const displayName = (twinName && twinName.trim()) 
    || userData?.fullName 
    || (userData?.firstName && userData?.lastName ? `${userData.firstName} ${userData.lastName}` : null)
    || userData?.firstName 
    || 'My Digital Twin';

  const displayInitials = displayName.split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'DT';

  const handleShare = () => {
    playHaptic();
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-xl mx-auto flex flex-col justify-between text-left px-4 py-4 min-h-[580px] space-y-4"
    >
      {/* Header Notification */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full border border-white/30 bg-white/10 text-[11px] font-medium text-white uppercase">
          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
          <span>DIGITAL TWIN ACTIVATED</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-wide">
          Your Soul Matrix Card
        </h2>
      </div>

      {/* 3D Holographic Interactive Soul Card */}
      <div 
        className="my-2 flex justify-center perspective-1000"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          style={{ rotateX, rotateY }}
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="relative w-full max-w-[340px] rounded-3xl p-5 border border-white/30 bg-gradient-to-b from-spiritual-850 via-black to-spiritual-950 shadow-[0_0_50px_rgba(255,255,255,0.12)] overflow-hidden cursor-grab active:cursor-grabbing"
        >
          {/* Shimmer overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none animate-shimmer" />

          {/* Card Top Row: Branding */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <img src="/logo.png" alt="Next Archer" className="w-6 h-auto filter invert" />
              <span className="text-xs font-bold tracking-widest text-white uppercase">
                NEXT ARCHER
              </span>
            </div>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded border border-white/20 text-spiritual-300">
              UNLOCKED
            </span>
          </div>

          {/* Card Avatar Section */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-white/40 bg-black flex-shrink-0 shadow-lg">
              {avatarImage ? (
                <img 
                  src={avatarImage} 
                  alt={displayName} 
                  className={`w-full h-full object-cover ${getFilterClass()}`} 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl font-bold text-white">
                  {displayInitials}
                </div>
              )}
              {/* Overlay ring indicator */}
              <div 
                className="absolute inset-0 border-2 border-white/40 rounded-2xl pointer-events-none"
                style={{ opacity: auraIntensity / 100 }}
              />
            </div>

            <div>
              <div className="text-[10px] text-spiritual-400 uppercase tracking-wider">
                Digital Twin Name:
              </div>
              <div className="text-lg font-bold text-white tracking-wide truncate max-w-[180px]">
                {displayName}
              </div>
              <div className="text-[11px] text-spiritual-300 flex items-center space-x-1 mt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-white" />
                <span>Next Archer Sync Active</span>
              </div>
            </div>
          </div>

          {/* Trait Meters */}
          <div className="space-y-2 border-t border-b border-white/10 py-3 my-2 text-[11px]">
            <div>
              <div className="flex justify-between text-spiritual-300 mb-1">
                <span>Intuitive Alignment</span>
                <span className="text-white font-bold">98.4%</span>
              </div>
              <div className="w-full h-1 bg-spiritual-800 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full w-[98%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-spiritual-300 mb-1">
                <span>Neural Focus</span>
                <span className="text-white font-bold">99.1%</span>
              </div>
              <div className="w-full h-1 bg-spiritual-800 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full w-[99%]" />
              </div>
            </div>
          </div>

          {/* Card Bottom Signature */}
          <div className="flex items-center justify-between pt-1">
            <div className="text-[10px] text-spiritual-500 font-mono">
              SYNC STATUS: ONLINE
            </div>
            <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
          </div>
        </motion.div>
      </div>

      {/* Interactive Twin Workspace Output */}
      {workspaceActive && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="glass-panel p-3 rounded-xl border border-white/20 text-xs text-spiritual-200 space-y-1 my-1"
        >
          <div className="flex items-center space-x-2 text-white font-semibold">
            <Activity className="w-4 h-4 text-emerald-400 animate-spin" />
            <span>Digital Twin Neural Stream:</span>
          </div>
          <p className="text-[11px] text-spiritual-300 font-light italic">
            "{displayName} is online and active. Synchronization complete."
          </p>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2.5 pt-1">
        <button
          onClick={() => {
            if (playHaptic) playHaptic();
            navigate('/soul-matrix');
          }}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-xs tracking-wider uppercase shadow-[0_0_25px_rgba(168,85,247,0.4)] flex items-center justify-center space-x-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>Synthesize & View Soul Card</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="flex space-x-2">
          <button
            onClick={handleShare}
            className="flex-1 py-3 px-4 rounded-xl border border-white/30 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            <span>{copied ? 'Card Link Copied!' : 'Share Soul Card'}</span>
          </button>

          <button
            onClick={() => {
              playHaptic();
              setWorkspaceActive(!workspaceActive);
            }}
            className="py-3 px-4 rounded-xl border border-white/30 bg-spiritual-900 text-white text-xs flex items-center justify-center space-x-1 hover:border-white cursor-pointer"
            title="Toggle Neural Workspace"
          >
            <Cpu className="w-4 h-4" />
            <span className="hidden sm:inline">Workspace</span>
          </button>
        </div>

        <button
          onClick={() => {
            playHaptic();
            onReset();
          }}
          className="w-full py-2.5 px-4 rounded-xl border border-white/10 text-spiritual-400 hover:text-white text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Edit Twin Name & Photo</span>
        </button>
      </div>

    </motion.div>
  );
}
