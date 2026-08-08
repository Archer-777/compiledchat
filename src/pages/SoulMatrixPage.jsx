import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AmbientBackground from '@/components/visuals/AmbientBackground';
import DashboardHeader from '@/components/layout/DashboardHeader';
import MyWorldSliders from '@/components/features/anish/MyWorldSliders';
import DashboardMetrics from '@/components/features/anish/DashboardMetrics';
import { FALLBACK_SOUL_MATRIX_PROFILE } from '@/data/soulMatrixData';
import { getUserData } from '@/utils/storage';

export default function SoulMatrixPage() {
  const navigate = useNavigate();
  const profile = FALLBACK_SOUL_MATRIX_PROFILE;
  const [userName, setUserName] = useState(profile.user_name);

  useEffect(() => {
    const fetchUser = async () => {
      const data = await getUserData();
      if (data) {
        const name = data.firstName || data.fullName || (data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : null);
        if (name) setUserName(name);
      }
    };
    fetchUser();
  }, []);

  return (
    <AmbientBackground>
      <div className="relative min-h-screen text-white font-sans overflow-x-hidden pt-6 pb-12">
        
        {/* Full Desktop 2-Pane Container */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* ── LEFT PANE (Col Span 7): Primary Visualizer & Stage ── */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="bg-[#0D0A21]/80 backdrop-blur-2xl p-6 lg:p-8 rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_30px_rgba(147,51,234,0.15)]">
                <DashboardHeader
                  userName={userName}
                  maslowLevels={profile.maslow_levels}
                  chakras={profile.chakras}
                  onBack={() => navigate(-1)}
                />

                {/* HEAL MY CHAKRA BUTTON */}
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => navigate('/heal-me')}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-extrabold text-sm sm:text-base tracking-wider uppercase shadow-[0_0_25px_rgba(168,85,247,0.4)] transition-all transform hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2 border border-white/20 font-['Poppins']"
                  >
                    <span>✨ HEAL MY CHAKRA →</span>
                  </button>
                </div>
              </div>
            </div>

            {/* ── RIGHT PANE (Col Span 5): Telemetry Controls & Metrics ── */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Soul Profile & Karma Status Overview */}
              <div className="bg-[#0D0A21]/80 backdrop-blur-2xl p-6 rounded-3xl border border-white/10 shadow-xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 p-0.5 shadow-lg flex items-center justify-center">
                    <div className="w-full h-full bg-[#06060C] rounded-[14px] flex items-center justify-center font-bold text-lg">
                      ✨
                    </div>
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-white tracking-tight font-['Poppins']">
                      Karma Rating
                    </h2>
                    <p className="text-xs text-purple-300">
                      Veto Status: <span className="text-emerald-400 font-semibold">Safe • No Burnout</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-extrabold text-amber-300 font-mono">
                    {profile.karma_rating}
                  </span>
                  <span className="text-xs text-gray-400 block font-sans">/ 100</span>
                </div>
              </div>

              {/* My World Balance Sliders Card */}
              <div className="bg-[#0D0A21]/80 backdrop-blur-2xl p-6 rounded-3xl border border-white/10 shadow-xl">
                <MyWorldSliders
                  initialValues={profile.my_world_sliders}
                  userId={profile.user_id}
                />
              </div>

              {/* Growth & Consciousness Metrics Card */}
              <div className="bg-[#0D0A21]/80 backdrop-blur-2xl p-6 rounded-3xl border border-white/10 shadow-xl">
                <DashboardMetrics
                  collectiveIntelligence={profile.collective_intelligence}
                  globalConsciousness={profile.global_consciousness}
                  balancedThinking={90}
                />
              </div>

            </div>

          </div>

        </div>

      </div>
    </AmbientBackground>
  );
}
