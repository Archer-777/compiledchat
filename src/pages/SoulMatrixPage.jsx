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
  const [profile, setProfile] = useState(FALLBACK_SOUL_MATRIX_PROFILE);
  const [userName, setUserName] = useState(FALLBACK_SOUL_MATRIX_PROFILE.user_name);

  useEffect(() => {
    const fetchUserAndTelemetry = async () => {
      const data = await getUserData();
      if (data) {
        const name = data.firstName || data.fullName || (data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : null);
        if (name) setUserName(name);
      }

      try {
        let storedTelemetry = window.localStorage.getItem('@telemetry_analysis_result');
        if (typeof window !== 'undefined' && window.location.search) {
          const params = new URLSearchParams(window.location.search);
          const urlTelemetry = params.get('telemetry');
          if (urlTelemetry) {
            try {
              const decoded = JSON.parse(urlTelemetry);
              window.localStorage.setItem('@telemetry_analysis_result', JSON.stringify(decoded));
              storedTelemetry = JSON.stringify(decoded);
            } catch (pErr) {}
          }
        }

        // Fetch latest telemetry directly from Backend DB Endpoint if missing
        if (!storedTelemetry) {
          try {
            const baseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BACKEND_URL)
              ? import.meta.env.VITE_BACKEND_URL.replace(/\/+$/, '')
              : 'http://localhost:4000';
            const dbRes = await fetch(`${baseUrl}/api/v1/chat/sai/telemetry${data?.email ? `?email=${encodeURIComponent(data.email)}` : ''}`);
            const dbData = await dbRes.json();
            if (dbData && dbData.telemetry) {
              storedTelemetry = JSON.stringify(dbData.telemetry);
              window.localStorage.setItem('@telemetry_analysis_result', storedTelemetry);
            }
          } catch (dbErr) {}
        }

        if (storedTelemetry) {
          const telemetry = JSON.parse(storedTelemetry);
          setProfile(prev => {
            const updated = { ...prev };
            if (telemetry.energy?.score) updated.karma_rating = telemetry.energy.score;
            if (telemetry.world_balance) {
              updated.my_world_sliders = {
                business: telemetry.world_balance.business?.score || prev.my_world_sliders.business,
                family: telemetry.world_balance.family?.score || prev.my_world_sliders.family,
                friend: telemetry.world_balance.friend?.score || prev.my_world_sliders.friend,
              };
            }
            if (telemetry.growth_consciousness || telemetry.consciousness) {
              const gc = telemetry.growth_consciousness || {};
              const getVal = (v) => typeof v === 'number' ? v : (v?.score ?? undefined);
              
              const ci = getVal(gc.collective_intelligence_index) ?? getVal(gc.collective_intelligence) ?? telemetry.consciousness?.Ci?.score;
              if (ci !== undefined) updated.collective_intelligence = ci;
              
              const gcs = getVal(gc.global_consciousness_score) ?? getVal(gc.global_consciousness) ?? telemetry.consciousness?.C?.score;
              if (gcs !== undefined) updated.global_consciousness = gcs;
              
              const bt = getVal(gc.balanced_thinking_ratio) ?? getVal(gc.balanced_thinking) ?? telemetry.truth?.T?.score;
              if (bt !== undefined) updated.balanced_thinking = bt;
            }
            if (telemetry.chakras) {
              const weak = telemetry.chakras.weak_chakras || [];
              const rawChakras = prev.chakras || {};
              if (Array.isArray(rawChakras)) {
                updated.chakras = rawChakras.map(c => {
                  const cKey = c.id || c.name?.toLowerCase().replace(/\s+/g, '_');
                  const isWeak = weak.includes(cKey) || weak.includes(c.id);
                  return {
                    ...c,
                    is_weak: isWeak,
                    score: telemetry.chakras[cKey]?.score ?? c.score ?? 0,
                  };
                });
              } else {
                const mappedObj = {};
                const keys = ['root', 'sacral', 'solar_plexus', 'heart', 'throat', 'third_eye', 'crown'];
                keys.forEach(k => {
                  mappedObj[k] = telemetry.chakras[k]?.score ?? 0;
                });
                updated.chakras = mappedObj;
                updated.weak_chakras = weak;
              }
            }
            if (telemetry.maslow) {
              const rawMaslow = prev.maslow_levels || {};
              if (Array.isArray(rawMaslow)) {
                updated.maslow_levels = rawMaslow.map(m => {
                  const mKey = m.id || m.name?.toLowerCase().replace(/\s+/g, '_');
                  const scoreVal = telemetry.maslow[mKey]?.score ?? (mKey === 'love_belonging' ? telemetry.maslow['belonging_love']?.score : undefined) ?? m.score ?? 0;
                  return {
                    ...m,
                    score: scoreVal,
                  };
                });
              } else {
                const mappedMaslow = {};
                const mKeys = ['physiological', 'safety', 'belonging_love', 'esteem', 'cognitive', 'aesthetic', 'self_actualization', 'transcendence'];
                mKeys.forEach(k => {
                  mappedMaslow[k] = telemetry.maslow[k]?.score ?? 0;
                });
                mappedMaslow['love_belonging'] = telemetry.maslow['belonging_love']?.score ?? telemetry.maslow['love_belonging']?.score ?? 0;
                updated.maslow_levels = mappedMaslow;
              }
            }
            return updated;
          });
        }
      } catch (e) {
        console.warn('Telemetry load notice:', e);
      }
    };
    fetchUserAndTelemetry();
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

                {/* HEAL MY CHAKRA & INSTANT AI ANALYSIS BUTTONS */}
                <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => navigate('/healing')}
                    className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-extrabold text-sm sm:text-base tracking-wider uppercase shadow-[0_0_25px_rgba(168,85,247,0.4)] transition-all transform hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2 border border-white/20 font-['Poppins']"
                  >
                    <span>✨ HEAL MY CHAKRA →</span>
                  </button>

                  <button
                    onClick={async () => {
                      try {
                        const baseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BACKEND_URL)
                          ? import.meta.env.VITE_BACKEND_URL.replace(/\/+$/, '')
                          : 'http://localhost:4000';
                        const uData = await getUserData();
                        const email = uData?.email || '';
                        const res = await fetch(`${baseUrl}/api/v1/chat/sai/analyze`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email }),
                        });
                        const data = await res.json();
                        if (data && data.telemetry) {
                          window.localStorage.setItem('@telemetry_analysis_result', JSON.stringify(data.telemetry));
                          window.location.reload();
                        }
                      } catch (e) {
                        console.error('Instant AI Analysis error:', e);
                      }
                    }}
                    className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-500 hover:from-cyan-500 hover:to-emerald-400 text-white font-extrabold text-sm sm:text-base tracking-wider uppercase shadow-[0_0_25px_rgba(20,184,166,0.4)] transition-all transform hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2 border border-white/20 font-['Poppins']"
                  >
                    <span>⚡ INSTANT AI ANALYSIS</span>
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
                      Platform Karma Rating
                    </h2>
                  </div>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-amber-300 font-mono">
                    {profile.karma_rating}
                  </span>
                  <span className="text-sm font-semibold text-gray-400 font-sans">/ 100</span>
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
                  balancedThinking={profile.balanced_thinking || 0}
                />
              </div>

            </div>

          </div>

        </div>

      </div>
    </AmbientBackground>
  );
}
