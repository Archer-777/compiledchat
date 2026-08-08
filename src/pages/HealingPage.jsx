import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import HealingScreen from '@/components/layout/HealingScreen';
import WebsiteLayout from '@/components/layout/WebsiteLayout';

export default function HealingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialChakra = searchParams.get('chakra') || 'heart';
  const [currentChakra, setCurrentChakra] = useState(initialChakra);

  return (
    <WebsiteLayout>
      <HealingScreen
        currentChakra={currentChakra}
        onChakraChange={(id) => setCurrentChakra(id)}
        onRegister={() => navigate('/register')}
        onDigitalTwin={() => navigate('/digital-twin')}
        onBack={() => navigate('/heal-me')}
      />
    </WebsiteLayout>
  );
}
