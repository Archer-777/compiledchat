import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar, Platform, View, StyleSheet } from 'react-native';

// Import all screens
import SplashScreen from './src/screens/SplashScreen';
import AuraScannerScreen from './src/screens/AuraScannerScreen';
import SuperchargeScreen from './src/screens/SuperchargeScreen';
import AIChatLightScreen from './src/screens/AIChatLightScreen';
import AIChatDarkScreen from './src/screens/AIChatDarkScreen';
import ConsciousnessScreen from './src/screens/ConsciousnessScreen';
import HealMeScreen from './src/screens/HealMeScreen';
import HealingSuperchargeScreen from './src/screens/HealingSuperchargeScreen';
import ClarityOnDemandScreen from './src/screens/ClarityOnDemandScreen';
import LetsMatrixScreen from './src/screens/LetsMatrixScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import DashboardCompetitiveScreen from './src/screens/DashboardCompetitiveScreen';
import EmpowerCommunityScreen from './src/screens/EmpowerCommunityScreen';
import WishScreen from './src/screens/WishScreen';
import MessagesScreen from './src/screens/MessagesScreen';
import ChallengeScreen from './src/screens/ChallengeScreen';
import MyProfileScreen from './src/screens/MyProfileScreen';
import UtopiaScreen from './src/screens/UtopiaScreen';
import UtopianExchangeScreen from './src/screens/UtopianExchangeScreen';
import NFTSearchScreen from './src/screens/NFTSearchScreen';

const StackHome = createNativeStackNavigator();
const StackDash = createNativeStackNavigator();
const StackChat = createNativeStackNavigator();
const StackWish = createNativeStackNavigator();
const StackProfile = createNativeStackNavigator();

const Tab = createBottomTabNavigator();

// Helper to register unique screen names
function registerAllScreens(StackNav) {
  return (
    <>
      <StackNav.Screen name="Splash" component={SplashScreen} />
      <StackNav.Screen name="AuraScanner" component={AuraScannerScreen} />
      <StackNav.Screen name="Supercharge" component={SuperchargeScreen} />
      <StackNav.Screen name="SuperchargeScreen" component={SuperchargeScreen} />
      <StackNav.Screen name="AIChatLight" component={AIChatLightScreen} />
      <StackNav.Screen name="AIChatDark" component={AIChatDarkScreen} />
      <StackNav.Screen name="Consciousness" component={ConsciousnessScreen} />
      <StackNav.Screen name="HealMe" component={HealMeScreen} />
      <StackNav.Screen name="HealingSupercharge" component={HealingSuperchargeScreen} />
      <StackNav.Screen name="ClarityOnDemand" component={ClarityOnDemandScreen} />
      <StackNav.Screen name="LetsMatrix" component={LetsMatrixScreen} />
      <StackNav.Screen name="Dashboard" component={DashboardScreen} />
      <StackNav.Screen name="DashboardCompetitive" component={DashboardCompetitiveScreen} />
      <StackNav.Screen name="DashboardCompetitiveScreen" component={DashboardCompetitiveScreen} />
      <StackNav.Screen name="EmpowerCommunity" component={EmpowerCommunityScreen} />
      <StackNav.Screen name="EmpowerCommunityScreen" component={EmpowerCommunityScreen} />
      <StackNav.Screen name="Wish" component={WishScreen} />
      <StackNav.Screen name="WishScreen" component={WishScreen} />
      <StackNav.Screen name="Messages" component={MessagesScreen} />
      <StackNav.Screen name="MessagesScreen" component={MessagesScreen} />
      <StackNav.Screen name="Challenge" component={ChallengeScreen} />
      <StackNav.Screen name="ChallengeScreen" component={ChallengeScreen} />
      <StackNav.Screen name="MyProfile" component={MyProfileScreen} />
      <StackNav.Screen name="MyProfileScreen" component={MyProfileScreen} />
      <StackNav.Screen name="Utopia" component={UtopiaScreen} />
      <StackNav.Screen name="UtopianExchange" component={UtopianExchangeScreen} />
      <StackNav.Screen name="NFTSearch" component={NFTSearchScreen} />
    </>
  );
}

// Home Stack - Onboarding + Utopia Feed + Chat + Healing flows
function HomeStack() {
  return (
    <StackHome.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      {registerAllScreens(StackHome)}
    </StackHome.Navigator>
  );
}

// Dashboard Stack
function DashboardStack() {
  return (
    <StackDash.Navigator initialRouteName="Dashboard" screenOptions={{ headerShown: false }}>
      {registerAllScreens(StackDash)}
    </StackDash.Navigator>
  );
}

// Chat/Community Stack
function ChatStack() {
  return (
    <StackChat.Navigator initialRouteName="Messages" screenOptions={{ headerShown: false }}>
      {registerAllScreens(StackChat)}
    </StackChat.Navigator>
  );
}

// Wish Stack
function WishStack() {
  return (
    <StackWish.Navigator initialRouteName="Wish" screenOptions={{ headerShown: false }}>
      {registerAllScreens(StackWish)}
    </StackWish.Navigator>
  );
}

// Profile Stack
function ProfileStack() {
  return (
    <StackProfile.Navigator initialRouteName="MyProfile" screenOptions={{ headerShown: false }}>
      {registerAllScreens(StackProfile)}
    </StackProfile.Navigator>
  );
}

function MainNavigation() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Dashboard') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Wish') {
            iconName = focused ? 'star' : 'star-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size || 22} color={color} />;
        },
        tabBarActiveTintColor: '#00d4ff',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#0a0a1a',
          borderTopColor: '#1a1a2e',
          borderTopWidth: 1,
          height: Platform.OS === 'web' ? 56 : 54,
          paddingBottom: Platform.OS === 'web' ? 6 : 4,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Dashboard" component={DashboardStack} />
      <Tab.Screen name="Chat" component={ChatStack} />
      <Tab.Screen name="Wish" component={WishStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}

export default function App() {
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
