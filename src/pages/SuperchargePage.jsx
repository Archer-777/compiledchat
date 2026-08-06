import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaDollarSign } from 'react-icons/fa';
import { MdFileDownload, MdTrendingUp } from 'react-icons/md';
import { IoIosFlash } from 'react-icons/io';
import { IoShieldCheckmarkOutline, IoSparkles } from 'react-icons/io5';
import AmbientBackground from '@/components/visuals/AmbientBackground';
import Toast from '@/components/common/Toast';
import './SuperchargePage.css';

export default function SuperchargePage() {
  const navigate = useNavigate();
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleStartSupercharge = () => {
    let firstName = '';
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem('@spiritual_register_user');
        if (raw) {
          const parsed = JSON.parse(raw);
          firstName = parsed.firstName || (parsed.full_name ? parsed.full_name.split(' ')[0] : '');
        }
      }
    } catch (e) {}
    const query = firstName ? `?firstName=${encodeURIComponent(firstName)}` : '';
    window.location.href = `http://localhost:8081${query}`;
  };

  const features = [
    {
      id: '1',
      icon: <IoIosFlash size={24} color="#00e5ff" />,
      title: 'Under 10-Min Micro Tasks',
      desc: 'Complete quick AI tasks to build steady passive earnings.',
    },
    {
      id: '2',
      icon: <MdTrendingUp size={24} color="#ffe57f" />,
      title: 'Automated Yield',
      desc: 'Let AI optimize your free time into high-value streams.',
    },
    {
      id: '3',
      icon: <IoShieldCheckmarkOutline size={24} color="#10b981" />,
      title: 'Zero Capital Required',
      desc: '100% free entrance with instant payout setup.',
    },
  ];

  return (
    <AmbientBackground>
      <Toast message={toastMsg} />

      <div className="supercharge-container">
        {/* Top Header */}
        <div className="supercharge-header-section">
          <div className="supercharge-logo-glow">
            <img src="/logo.png" alt="Logo" className="supercharge-logo-img" />
          </div>
          <h1 className="supercharge-title">Additional Supercharge</h1>
          <p className="supercharge-subtitle">
            Get passive income with free time under 10 minutes
          </p>
        </div>

        {/* Action Cards */}
        <div className="supercharge-action-cards-grid">
          <div
            className="supercharge-circle-card"
            onClick={() => showToast('Passive income tools activated.')}
          >
            <div className="supercharge-gold-circle">
              <FaDollarSign size={34} />
            </div>
            <h3 className="supercharge-card-label">PASSIVE INCOME</h3>
            <p className="supercharge-card-subtext">&lt; 10 Mins / Day</p>
          </div>

          <div
            className="supercharge-circle-card"
            onClick={() => showToast('Downloading free supercharge pack...')}
          >
            <div className="supercharge-free-badge">FREE</div>
            <div className="supercharge-cyan-circle">
              <MdFileDownload size={38} />
            </div>
            <h3 className="supercharge-card-label">FREE DOWNLOAD</h3>
            <p className="supercharge-card-subtext">Instant Access</p>
          </div>
        </div>

        {/* Feature Cards Section */}
        <div className="supercharge-features-section">
          <h2 className="supercharge-section-header">SUPERCHARGE HIGHLIGHTS</h2>
          <div className="supercharge-feature-grid">
            {features.map((item) => {
              const isSelected = selectedFeature === item.id;
              return (
                <div
                  key={item.id}
                  className={`supercharge-feature-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedFeature(isSelected ? null : item.id)}
                >
                  <div className="supercharge-feature-icon-box">{item.icon}</div>
                  <div>
                    <h3 className="supercharge-feature-title">{item.title}</h3>
                    <p className="supercharge-feature-desc">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Primary Action Button */}
        <button
          className="supercharge-primary-btn"
          onClick={handleStartSupercharge}
        >
          <IoSparkles size={20} />
          <span>Start Supercharging</span>
        </button>

        {/* Footer Text */}
        <p className="supercharge-footer-text">
          I AM NOT PERFECT. LET'S TRANSCEND CONSCIOUSNESS
        </p>
      </div>
    </AmbientBackground>
  );
}
