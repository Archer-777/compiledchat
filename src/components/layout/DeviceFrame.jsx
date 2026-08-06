import React from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';

export default function DeviceFrame({ isMobileFrame, children, currentStep, setCurrentStep }) {
  // Get current time formatted HH:MM
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (!isMobileFrame) {
    return (
      <div className="w-full min-h-[calc(100vh-65px)] flex flex-col items-center justify-start py-6 px-4">
        <div className="w-full max-w-lg mx-auto">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-65px)] flex flex-col items-center justify-center py-4 px-2">
      {/* Mobile Device Enclosure */}
      <div className="relative w-full max-w-[380px] h-[750px] rounded-[44px] border-[8px] border-spiritual-800 bg-black shadow-[0_0_50px_rgba(255,255,255,0.08),0_25px_50px_-12px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden ring-1 ring-white/20 select-none">
        
        {/* Dynamic Island / Notch Header */}
        <div className="absolute top-0 inset-x-0 h-10 bg-black z-50 flex items-center justify-between px-6 pt-1">
          <span className="text-[11px] font-semibold text-white font-mono tracking-tight">{timeStr}</span>
          
          {/* Center Dynamic Notch Pill */}
          <div className="w-20 h-4 bg-spiritual-900 rounded-full border border-white/10 flex items-center justify-end px-2 space-x-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse" />
            <div className="w-1 h-1 rounded-full bg-white/40" />
          </div>

          <div className="flex items-center space-x-1 text-white/80">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <Battery className="w-3.5 h-3.5 fill-white" />
          </div>
        </div>

        {/* Screen Content Scroll Area */}
        <div className="w-full h-full pt-10 pb-6 overflow-y-auto overflow-x-hidden flex flex-col scrollbar-thin relative">
          {children}
        </div>

        {/* Home Indicator Bar */}
        <div className="absolute bottom-1.5 inset-x-0 flex justify-center pointer-events-none z-50">
          <div className="w-28 h-1 bg-white/40 rounded-full" />
        </div>

      </div>

      {/* Screen step controls below mobile frame */}
      <div className="mt-3 flex items-center space-x-2 text-xs text-spiritual-400">
        <span>View {currentStep} of 2</span>
        <span>•</span>
        <button 
          onClick={() => setCurrentStep(1)}
          disabled={currentStep === 1}
          className="hover:text-white disabled:opacity-30 underline cursor-pointer"
        >
          Setup View
        </button>
        <span>/</span>
        <button 
          onClick={() => setCurrentStep(2)}
          disabled={currentStep === 2}
          className="hover:text-white disabled:opacity-30 underline cursor-pointer"
        >
          Soul Card View
        </button>
      </div>
    </div>
  );
}
