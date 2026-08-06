import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar, Platform, View, StyleSheet } from 'react-native';
import './styles/aurora.css';

// Import only the chat screens and Consciousness redirect screen
import AIChatDarkScreen from './src/screens/AIChatDarkScreen';
import AIChatLightScreen from './src/screens/AIChatLightScreen';
import ConsciousnessScreen from './src/screens/ConsciousnessScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const styleId = 'aurora-css-injected';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700;800&display=swap');
          * { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          .chat-bg { transition: background 1000ms ease-in-out, background-color 1000ms ease-in-out; background-size: 200% 200%; }
          .chat-bg--day { background-image: radial-gradient(120% 120% at 20% 0%, #2b2f45 0%, #14151f 55%, #0a0a0f 100%); }
          .chat-bg--evening { background-image: radial-gradient(120% 120% at 80% 0%, #3d1f52 0%, #23163f 45%, #0d0912 100%); }
          .chat-bg--night { background-image: radial-gradient(130% 130% at 50% -10%, #10142b 0%, #0a0a12 50%, #050507 100%); }
          @keyframes aurora-sway-a {
            0%   { transform: translate3d(-4%, 2%, 0) skewX(-6deg) scaleY(1); opacity: 0.75; }
            50%  { transform: translate3d(6%, -3%, 0) skewX(8deg) scaleY(1.12); opacity: 1; }
            100% { transform: translate3d(-4%, 2%, 0) skewX(-6deg) scaleY(1); opacity: 0.75; }
          }
          @keyframes aurora-sway-b {
            0%   { transform: translate3d(5%, -2%, 0) skewX(7deg) scaleY(1.08); opacity: 0.6; }
            50%  { transform: translate3d(-7%, 4%, 0) skewX(-9deg) scaleY(0.94); opacity: 0.95; }
            100% { transform: translate3d(5%, -2%, 0) skewX(7deg) scaleY(1.08); opacity: 0.6; }
          }
          @keyframes aurora-sway-c {
            0%   { transform: translate3d(0, 4%, 0) skewX(4deg) scaleY(1.05); opacity: 0.5; }
            50%  { transform: translate3d(8%, -5%, 0) skewX(-7deg) scaleY(1.2); opacity: 0.9; }
            100% { transform: translate3d(0, 4%, 0) skewX(4deg) scaleY(1.05); opacity: 0.5; }
          }
          .aurora-strand {
            transform-origin: 40% 90%;
            will-change: transform, opacity;
          }
          @keyframes aurora-drift { 0% { transform: translate3d(0, 0, 0) scale(1); } 50% { transform: translate3d(4%, -6%, 0) scale(1.12); } 100% { transform: translate3d(-5%, 4%, 0) scale(0.96); } }
          @media (prefers-reduced-motion: reduce) { .aurora-strand { animation: none !important; } .aurora-blob { animation: none; } .chat-bg { transition: none; } }
          .relative { position: relative; } .absolute { position: absolute; } .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
          .z-0 { z-index: 0; } .z-10 { z-index: 10; } .pointer-events-none { pointer-events: none; }
          .overflow-hidden { overflow: hidden; } .opacity-0 { opacity: 0; } .opacity-100 { opacity: 1; }
          .transition-opacity { transition: opacity 1500ms cubic-bezier(0.4, 0, 0.2, 1); }
          .backdrop-blur-md { backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
          .bg-black\\/20 { background-color: rgba(0, 0, 0, 0.2); } .bg-black\\/30 { background-color: rgba(0, 0, 0, 0.3); }
          .bg-white\\/10 { background-color: rgba(255, 255, 255, 0.1); } .bg-violet-500\\/30 { background-color: rgba(139, 92, 246, 0.3); }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);

  const content = (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a1a" />
      <Stack.Navigator initialRouteName="AIChatDark" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AIChatDark" component={AIChatDarkScreen} />
        <Stack.Screen name="AIChatLight" component={AIChatLightScreen} />
        <Stack.Screen name="Consciousness" component={ConsciousnessScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );

  return content;
}

const styles = StyleSheet.create({
  webOuterContainer: {
    flex: 1,
    backgroundColor: '#0a0a1a',
    width: '100%',
    height: '100vh',
  },
});
