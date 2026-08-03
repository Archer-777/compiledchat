import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar, Platform, View, StyleSheet } from 'react-native';
import './src/styles/aurora.css';

// Import kept screens
import SplashScreen from './src/screens/SplashScreen';
import AuraScannerScreen from './src/screens/AuraScannerScreen';
import SuperchargeScreen from './src/screens/SuperchargeScreen';

const Stack = createNativeStackNavigator();

function MainNavigation() {
  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="AuraScanner" component={AuraScannerScreen} />
      <Stack.Screen name="Supercharge" component={SuperchargeScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const fontId = 'poppins-google-font';
      if (!document.getElementById(fontId)) {
        const link = document.createElement('link');
        link.id = fontId;
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap';
        document.head.appendChild(link);
      }

      let style = document.getElementById('poppins-global-style');
      if (!style) {
        style = document.createElement('style');
        style.id = 'poppins-global-style';
        document.head.appendChild(style);
      }
      style.textContent = `
        body, input, textarea, select, button, [dir] {
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }
      `;
    }
  }, []);

  const content = (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a1a" />
      <MainNavigation />
    </NavigationContainer>
  );

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webOuterContainer}>
        {/* Android Device Mockup Frame */}
        <View style={styles.androidPhoneFrame}>
          {/* Top Notch & Camera Bar */}
          <View style={styles.phoneHeaderNotch}>
            <View style={styles.speakerDot} />
            <View style={styles.cameraLens} />
          </View>

          {/* Screen Content */}
          <View style={styles.phoneScreenContent}>
            {content}
          </View>

          {/* Android Bottom Navigation Pill Bar */}
          <View style={styles.androidHomeBarContainer}>
            <View style={styles.androidHomePill} />
          </View>
        </View>
      </View>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  webOuterContainer: {
    flex: 1,
    backgroundColor: '#05050f',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    paddingVertical: 16,
    paddingHorizontal: 10,
  },
  androidPhoneFrame: {
    width: '100%',
    maxWidth: 412, // Standard Android device width
    height: '92vh',
    maxHeight: 880,
    minHeight: 700,
    backgroundColor: '#0a0a1a',
    borderRadius: 36,
    borderWidth: 8,
    borderColor: '#1f1f33',
    overflow: 'hidden',
    boxShadow: '0px 20px 60px rgba(0, 212, 255, 0.15), 0px 10px 30px rgba(0,0,0,0.8)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  phoneHeaderNotch: {
    height: 24,
    backgroundColor: '#050510',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    zIndex: 999,
  },
  speakerDot: {
    width: 36,
    height: 4,
    backgroundColor: '#2a2a3e',
    borderRadius: 2,
  },
  cameraLens: {
    width: 10,
    height: 10,
    backgroundColor: '#121224',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  phoneScreenContent: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  androidHomeBarContainer: {
    height: 14,
    backgroundColor: '#050510',
    alignItems: 'center',
    justifyContent: 'center',
  },
  androidHomePill: {
    width: 110,
    height: 4,
    backgroundColor: '#4a4a60',
    borderRadius: 2,
  },
});
