import React from 'react';
import { useNavigate } from 'react-router-dom';
import HealMeScreen from '@/components/layout/HealMeScreen';
import WebsiteLayout from '@/components/layout/WebsiteLayout';

export default function HealMePage() {
  const navigate = useNavigate();

  const handleProceed = (chakraId) => {
    navigate(`/healing?chakra=${chakraId || 'heart'}`);
  };

  return (
    <WebsiteLayout>
      <HealMeScreen
        onProceed={handleProceed}
        onTravel={() => navigate('/travel')}
        onBack={() => navigate('/scan')}
      />
    </WebsiteLayout>
  );
}
