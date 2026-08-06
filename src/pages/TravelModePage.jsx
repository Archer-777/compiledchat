import React from 'react';
import { useNavigate } from 'react-router-dom';
import TravelModeScreen from '@/components/layout/TravelModeScreen';
import WebsiteLayout from '@/components/layout/WebsiteLayout';

export default function TravelModePage() {
  const navigate = useNavigate();

  return (
    <WebsiteLayout>
      <TravelModeScreen
        onBack={() => navigate('/healing')}
        onNavigateNext={() => navigate('/supercharge')}
      />
    </WebsiteLayout>
  );
}
