import React from 'react';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'chat', label: 'AI Sanctuary', icon: '💬' },
  { id: 'wish', label: 'Manifest', icon: '⭐' },
  { id: 'profile', label: 'Soul Card', icon: '👤' },
];

export default function BottomNav({ activeTab = 'dashboard', onTabChange }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-4 py-2 bg-[#0A081E]/95 backdrop-blur-xl border-t border-white/10 max-w-md mx-auto rounded-t-2xl shadow-2xl">
      {NAV_ITEMS.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange && onTabChange(item.id)}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all cursor-pointer ${
              isActive ? 'text-cyan-400 bg-white/10 scale-105' : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="text-base">{item.icon}</span>
            <span className="text-[10px] font-bold uppercase tracking-tight">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
