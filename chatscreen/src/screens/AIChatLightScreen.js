import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  Alert,
  Modal,
  Animated,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Ellipse, Path, Text as SvgText } from 'react-native-svg';
import { BlurView } from 'expo-blur';
import { AmbientBackground } from '../components/AmbientBackground';
import { DesktopSidebar } from '../components/DesktopSidebar';
import { useSolarAmbience } from '../hooks/useSolarAmbience';
import { Fonts } from '../theme/fonts';

function AIAvatar({ isDarkUI = false }) {
  const color = isDarkUI ? '#ffffff' : '#0f172a';
  return (
    <View style={styles.avatarContainer}>
      <Svg width={30} height={30} viewBox="0 0 32 32">
        <Ellipse cx="16" cy="7" rx="8" ry="2.5" fill="none" stroke={color} strokeWidth="1.6" />
        <SvgText
          x="16"
          y="23"
          fill={color}
          fontSize="11"
          fontWeight="bold"
          textAnchor="middle"
          letterSpacing="0.5"
        >
          AI
        </SvgText>
      </Svg>
    </View>
  );
}

function UserAvatar() {
  const orangeColor = '#ff9500';
  return (
    <View style={styles.avatarContainer}>
      <Svg width={30} height={30} viewBox="0 0 32 32">
        <Circle cx="10" cy="11" r="4.5" fill={orangeColor} />
        <Circle cx="10" cy="11" r="2" fill="#040814" />
        <Circle cx="22" cy="11" r="4.5" fill={orangeColor} />
        <Circle cx="22" cy="11" r="2" fill="#040814" />
        <Path
          d="M 8 20 Q 16 26 24 20"
          fill="none"
          stroke={orangeColor}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}

// ── Sentiment & Context Pattern Engine ───────────────────────────────────────

const HEAVY_PATTERNS = [
  /\b(sad|sadd|depressed|crying|cry|heavy|stressed|stress|anxious|anxiety|overthink|dwelling|drained|exhausted|alone|lonely|hopeless|lost|struggling|hard)\b/i,
  /\b(staring at|ceiling|can't sleep|wont shut|shut off|why am i|why do i|everything goes wrong|nothing works)\b/i,
  /😔|🥺|😢|😭|💔|🌧️/
];

const HAPPY_PATTERNS = [
  /\b(happy|hapy|happi|good|gud|great|gr8|fine|better|nice|love|glad|joy|joyful|peace|peaceful|calm|smile|awesome|wonderful|amazing|blessed)\b/i,
  /\b(worked out|finally|lighter|breathe|finished|progress|looking forward|feel good|feeling good|so much better|made my day)\b/i,
  /\b(haha|hahaha|lol|lmao|hehe)\b/i,
  /😊|☀️|❤️|✨|🙂|😄|😁|🎉|🥳|🌸/
];

const AIChatLightScreen = ({ navigation, route }) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showTenMinModal, setShowTenMinModal] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        if (next === 600) {
          setShowTenMinModal(true);
        }
        return next;
      });
    }, 1000); // REAL TIME: 1 second interval (600s = 10 Minutes)
    return () => clearInterval(timer);
  }, [navigation]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const paramAurora =
    route?.params?.testAurora === true ||
    (typeof window !== 'undefined' &&
      new URLSearchParams(window?.location?.search ?? '').has('testAurora'));

  const [manualAurora, setManualAurora] = useState(paramAurora);
  const demoMode = route?.params?.demoMode === true;
  const isAuroraTime = elapsedSeconds >= 180 || manualAurora;

  const [weatherState, setWeatherState] = useState('clear');
  const [neutralMessageCount, setNeutralMessageCount] = useState(0);

  const solar = useSolarAmbience({
    testAurora: isAuroraTime,
    auroraDelayMs: 180_000,
    countryCode: undefined,
    simulatedDayMs: demoMode ? 120_000 : undefined,
  });

  useEffect(() => {
    const parent = navigation?.getParent();
    if (parent) {
      parent.setOptions({ tabBarStyle: { display: 'none' } });
    }
  }, [navigation]);

  const [themeMode, setThemeMode] = useState('auto');
  const isSkyDark = solar.auroraActive || solar.nightOpacity > 0.4 || solar.sunOpacity <= 0.35;
  const isDarkUI = themeMode === 'auto' ? isSkyDark : themeMode === 'dark';

  const [toastText, setToastText] = useState('');
  const toastFade = useRef(new Animated.Value(0)).current;
  const toastTimeoutRef = useRef(null);

  const showToast = (msg) => {
    setToastText(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);

    toastFade.setValue(0);
    Animated.timing(toastFade, {
      toValue: 1,
      duration: 250,
      useNativeDriver: false,
    }).start();

    toastTimeoutRef.current = setTimeout(() => {
      Animated.timing(toastFade, {
        toValue: 0,
        duration: 350,
        useNativeDriver: false,
      }).start(() => setToastText(''));
    }, 2000);
  };

  const toggleThemeMode = () => {
    let nextMode = 'auto';
    if (themeMode === 'auto') {
      nextMode = isSkyDark ? 'light' : 'dark';
    } else if (themeMode === 'dark') {
      nextMode = 'light';
    } else {
      nextMode = 'auto';
    }
    setThemeMode(nextMode);

    if (nextMode === 'light') {
      showToast('☀️ Light Mode Active');
    } else if (nextMode === 'dark') {
      showToast('🌙 Dark Mode Active');
    } else {
      showToast('🌌 Auto Ambient Theme Active');
    }
  };

  const [inputText, setInputText] = useState('');
  const [selectedModel, setSelectedModel] = useState('Spiritualize AI');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [messages, setMessages] = useState([
    { id: '1', sender: 'ai', text: 'Hello! How are you today?' },
    { id: '2', sender: 'user', text: 'Hi' },
    { id: '3', sender: 'ai', text: 'This would be a normal conversation within 30 words.' },
    { id: '4', type: 'badge', text: 'Conversation Streak From User' },
    { id: '5', sender: 'ai', text: 'Knowledge base response for enlightening pleasant surprises and neuron enlightenment' },
  ]);

  const detectEmotionalWeather = (text) => {
    const isHeavy = HEAVY_PATTERNS.some((pattern) => pattern.test(text));
    const isHappy = HAPPY_PATTERNS.some((pattern) => pattern.test(text));

    if (isHeavy) {
      setWeatherState('rain');
      setNeutralMessageCount(0);
    } else if (isHappy) {
      setWeatherState('happy');
      setNeutralMessageCount(0);
    } else {
      setNeutralMessageCount((prev) => {
        const next = prev + 1;
        if (next >= 2 && weatherState === 'rain') {
          setWeatherState('clear');
        }
        return next;
      });
    }
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    const textToSend = inputText.trim();
    const newMsg = { id: Date.now().toString(), sender: 'user', text: textToSend };
    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    detectEmotionalWeather(textToSend);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: 'Thank you for expressing your thought! Transcending consciousness...',
        },
      ]);
    }, 1000);
  };

  const handleMicPress = () => Alert.alert('Voice Input', 'Listening...');

  const handleGoBack = () => {
    if (navigation?.goBack) navigation.goBack();
    else if (navigation?.navigate) navigation.navigate('AIChatDark');
  };

  const h = solar.fractionalHour;
  let greeting = 'Good Morning ☀️';
  let timeName = 'Morning';
  if (h >= 12 && h < 17) {
    greeting = 'Good Afternoon ☀️';
    timeName = 'Afternoon';
  } else if (h >= 17 && h < 21) {
    greeting = 'Good Evening 普遍';
    timeName = 'Evening';
  } else if (h >= 21 || h < 5) {
    greeting = 'Good Night 🌙';
    timeName = 'Night';
  }

  return (
    <View style={{ flex: 1, flexDirection: Platform.OS === 'web' ? 'row' : 'column' }}>
      {Platform.OS === 'web' && (
        <DesktopSidebar
          isDark={false}
          currentSlot={null}
          timeIcon="☀️"
          manualAurora={false}
          onToggleAurora={() => showToast('☀️ Switched to Light Mode')}
          onCycleTimeSlot={() => {}}
          onToggleTheme={() => {
            if (navigation?.navigate) {
              navigation.navigate('AIChatDark');
            }
          }}
          onNewChat={() => {
            setMessages([
              {
                id: '1',
                sender: 'ai',
                text: "Hello! Welcome to Next Archer. How can I help you today?",
                time: 'Just now',
              },
            ]);
            showToast('✨ New conversation started');
          }}
        />
      )}

      <View style={{ flex: 1, position: 'relative' }}>
        <AmbientBackground {...solar} weatherState={weatherState} />

        <StatusBar
          barStyle={isDarkUI ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
          translucent
        />

        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
          {/* Header */}
          <BlurView
            intensity={40}
            tint={isDarkUI ? 'dark' : 'light'}
            style={styles.topBar}
          >
            <TouchableOpacity style={styles.backButton} onPress={handleGoBack} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={24} color={isDarkUI ? '#ffffff' : '#0f172a'} />
            </TouchableOpacity>

            <View style={styles.titleContainer}>
              <Text style={[styles.headerTitle, isDarkUI ? styles.textBright : styles.textDark]}>
                {greeting}
              </Text>
              <View style={styles.subtitleRow}>
                <Text
                  style={[
                    styles.headerSubtitle,
                    {
                      color: solar.auroraActive
                        ? '#00ffcc'
                        : isDarkUI
                        ? '#38bdf8'
                        : '#0284c7',
                      textShadowColor: 'rgba(0,0,0,0.4)',
                      textShadowOffset: { width: 0, height: 1 },
                      textShadowRadius: 2,
                    },
                  ]}
                >
                  SKY CONSCIOUSNESS • {timeName.toUpperCase()}{solar.auroraActive ? ' • AURORA' : ''}
                </Text>
                <View style={styles.timerPill}>
                  <Ionicons name="time-outline" size={12} color="#00ffcc" style={{ marginRight: 3 }} />
                  <Text style={styles.timerText}>{formatTime(elapsedSeconds)}</Text>
                </View>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {/* 1. Aurora Toggle */}
              <TouchableOpacity
                style={[styles.themeToggleBtn, manualAurora && { backgroundColor: 'rgba(0,212,255,0.3)' }]}
                onPress={() => {
                  const next = !manualAurora;
                  setManualAurora(next);
                  showToast(next ? '🌌 Aurora Mode Active' : '☀️ Light Mode Active');
                }}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 16 }}>🌌</Text>
              </TouchableOpacity>

              {/* 2. Ambient Slot Toggle */}
              <TouchableOpacity
                style={[styles.themeToggleBtn, currentSlot && { backgroundColor: 'rgba(255,200,80,0.25)' }]}
                onPress={cycleTimeSlot}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 16 }}>{currentSlot ? currentSlot.icon : timeIcon}</Text>
              </TouchableOpacity>

              {/* 3. Theme/Profile Switch */}
              <TouchableOpacity
                style={styles.themeToggleBtn}
                onPress={toggleThemeMode}
                activeOpacity={0.7}
                accessibilityLabel="Toggle Light/Dark Theme"
              >
                <Ionicons
                  name={isDarkUI ? 'sunny' : 'moon'}
                  size={20}
                  color={isDarkUI ? '#ffb703' : '#0f172a'}
                />
              </TouchableOpacity>
            </View>
          </BlurView>

          {/* Toast Popup Notification */}
          {!!toastText && (
            <Animated.View style={[styles.toastPill, { opacity: toastFade }]}>
              <BlurView intensity={50} tint="dark" style={styles.toastBlur}>
                <Text style={styles.toastText}>{toastText}</Text>
              </BlurView>
            </Animated.View>
          )}

          {/* Messages */}
          <ScrollView
            style={styles.chatScrollView}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((item) => {
              if (item.type === 'badge') {
                return (
                  <View key={item.id} style={styles.streakBadgeContainer}>
                    <View style={styles.streakBadge}>
                      <Ionicons name="flame" size={14} color="#f59e0b" style={{ marginRight: 5 }} />
                      <Text style={styles.streakBadgeText}>{item.text}</Text>
                    </View>
                  </View>
                );
              }
              const isAI = item.sender === 'ai';
              return (
                <View key={item.id} style={[styles.messageRow, isAI ? styles.rowLeft : styles.rowRight]}>
                  {isAI && <AIAvatar isDarkUI={isDarkUI} />}

                  <View
                    style={[
                      styles.bubble,
                      isAI
                        ? isDarkUI
                          ? styles.aiBubbleDark
                          : styles.aiBubbleLight
                        : isDarkUI
                        ? styles.userBubbleDark
                        : styles.userBubbleLight,
                    ]}
                  >
                    <Text style={styles.messageText}>
                      {item.text}
                    </Text>
                  </View>

                  {!isAI && <UserAvatar />}
                </View>
              );
            })}
          </ScrollView>

          {/* Input Bar */}
          <BlurView intensity={40} tint={isDarkUI ? 'dark' : 'light'} style={styles.bottomSection}>
            <View style={{ position: 'relative', zIndex: 100 }}>
              {/* Model Selection Dropdown Popup */}
              {showModelDropdown && (
                <>
                  <TouchableOpacity
                    style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 90,
                    }}
                    activeOpacity={1}
                    onPress={() => setShowModelDropdown(false)}
                  />
                  <View style={styles.modelDropdownContainer}>
                    <Text style={styles.modelDropdownHeader}>SELECT MODEL</Text>

                    {/* Model 1: Spiritualize AI (Selected) */}
                    <TouchableOpacity
                      style={[
                        styles.modelOptionRow,
                        selectedModel === 'Spiritualize AI' && styles.modelOptionRowSelected,
                      ]}
                      onPress={() => {
                        setSelectedModel('Spiritualize AI');
                        setShowModelDropdown(false);
                        showToast('✨ Switched to Spiritualize AI');
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                        <Ionicons name="sparkles" size={16} color="#00d4ff" />
                        <Text style={styles.modelOptionTitle}>Spiritualize AI</Text>
                      </View>
                      {selectedModel === 'Spiritualize AI' && (
                        <Ionicons name="checkmark-circle" size={16} color="#00d4ff" />
                      )}
                    </TouchableOpacity>

                    {/* Model 2: Digital Twin (Locked State) */}
                    <TouchableOpacity
                      style={[styles.modelOptionRow, styles.modelOptionRowLocked]}
                      onPress={() => {
                        showToast('🔒 Unlock Digital Twin experience');
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                        <Ionicons name="person-sharp" size={15} color="rgba(255, 255, 255, 0.4)" />
                        <Text style={styles.modelOptionTitleLocked}>Digital Twin</Text>
                      </View>
                      <View style={styles.lockBadge}>
                        <Ionicons name="lock-closed" size={10} color="#ffd166" style={{ marginRight: 3 }} />
                        <Text style={styles.lockBadgeText}>LOCKED</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              <View style={styles.inputRow}>
                {/* Model Selector Dropdown Button (Left Side) */}
                <TouchableOpacity
                  style={styles.modelSelectorBtn}
                  onPress={() => setShowModelDropdown(!showModelDropdown)}
                  activeOpacity={0.7}
                  accessibilityLabel="Select Model"
                >
                  <Ionicons name="sparkles" size={13} color={isDarkUI ? '#00d4ff' : '#0284c7'} />
                  <Text style={[styles.modelSelectorText, { color: isDarkUI ? '#00d4ff' : '#0284c7' }]}>{selectedModel}</Text>
                  <Ionicons name="chevron-down" size={12} color={isDarkUI ? 'rgba(255,255,255,0.6)' : '#64748b'} />
                </TouchableOpacity>

                <View style={styles.modelSelectorDivider} />

                <TextInput
                  style={[styles.textInput, isDarkUI ? styles.textInputDark : styles.textInputLight]}
                  placeholder="Type your response..."
                  placeholderTextColor={isDarkUI ? 'rgba(255,255,255,0.7)' : '#475569'}
                  value={inputText}
                  onChangeText={setInputText}
                  onSubmitEditing={handleSend}
                />
                <TouchableOpacity style={styles.micButton} onPress={handleMicPress} activeOpacity={0.7}>
                  <Ionicons name="mic" size={20} color={isDarkUI ? '#00ffcc' : '#0284c7'} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sendButton, !inputText.trim() && styles.sendDisabled]}
                  onPress={handleSend}
                  disabled={!inputText.trim()}
                  activeOpacity={0.8}
                >
                  <Ionicons name="send" size={17} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <Modal visible={showTenMinModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Image source={require('../../nextarcherlogo.jpeg')} style={{ width: 44, height: 44, borderRadius: 12, marginBottom: 12, resizeMode: 'contain' }} />
            <Text style={styles.modalTitle}>Session Completed</Text>
            <Text style={styles.modalDesc}>
              Your 10-minute reflection cycle is complete.
            </Text>
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => {
                setShowTenMinModal(false);
                if (typeof window !== 'undefined') {
                  window.location.href = 'https://nextarcher.vercel.app/heal-me';
                } else if (navigation && navigation.navigate) {
                  navigation.navigate('HealMe');
                }
              }}
            >
              <Text style={styles.modalBtnText}>Proceed to Heal Me ✨</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  backButton: { padding: 6 },
  themeToggleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: { alignItems: 'center' },
  headerTitle: { fontFamily: Fonts.poppins, fontSize: 16, fontWeight: '700' },
  subtitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  headerSubtitle: { fontFamily: Fonts.poppins, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,255,204,0.15)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,255,204,0.3)',
  },
  timerText: { fontFamily: Fonts.poppins, color: '#00ffcc', fontSize: 10, fontWeight: '700' },
  toastPill: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 74 : 68,
    alignSelf: 'center',
    zIndex: 999,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,255,204,0.4)',
  },
  toastBlur: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(12, 16, 36, 0.88)',
  },
  toastText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  textBright: { color: '#ffffff' },
  textDark: { color: '#0f172a' },
  subBright: { color: '#00ffcc' },
  subDark: { color: '#0284c7' },
  chatScrollView: {
    flex: 1,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
  chatContent: { paddingHorizontal: 14, paddingVertical: 16, gap: 14 },
  streakBadgeContainer: { alignItems: 'center', marginVertical: 6 },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 0,
    backgroundColor: '#4e7b97',
  },
  streakBadgeText: { fontFamily: Fonts.poppins, color: '#ffffff', fontSize: 12, fontWeight: '700' },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', marginVertical: 4 },
  rowLeft: { justifyContent: 'flex-start' },
  rowRight: { justifyContent: 'flex-end' },
  bubble: {
    maxWidth: '76%',
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 18,
    overflow: 'hidden',
  },
  aiBubbleDark: {
    borderTopLeftRadius: 4,
    backgroundColor: '#283250',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  aiBubbleLight: {
    borderTopLeftRadius: 4,
    backgroundColor: '#4e7b97',
    borderWidth: 0,
  },
  userBubbleDark: {
    borderBottomRightRadius: 4,
    backgroundColor: '#283250',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  userBubbleLight: {
    borderBottomRightRadius: 4,
    backgroundColor: '#4e7b97',
    borderWidth: 0,
  },
  messageText: { fontFamily: Fonts.inter, fontSize: 14, lineHeight: 21, fontWeight: '400', color: '#ffffff' },
  bottomSection: {
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 16 : 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  modelSelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(2, 132, 199, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(2, 132, 199, 0.25)',
  },
  modelSelectorText: {
    fontFamily: Fonts.inter,
    fontSize: 12,
    fontWeight: '600',
    color: '#0284c7',
  },
  modelSelectorDivider: {
    width: 1,
    height: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    marginHorizontal: 8,
  },
  modelDropdownContainer: {
    position: 'absolute',
    bottom: 54,
    left: 0,
    width: 235,
    backgroundColor: 'rgba(10, 14, 28, 0.96)',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 20,
    zIndex: 100,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(16px)' } : {}),
  },
  modelDropdownHeader: {
    fontFamily: Fonts.poppins,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: 'rgba(255, 255, 255, 0.5)',
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 6,
  },
  modelOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 10,
    marginBottom: 4,
  },
  modelOptionRowSelected: {
    backgroundColor: 'rgba(0, 212, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.35)',
  },
  modelOptionRowLocked: {
    opacity: 0.65,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  modelOptionTitle: {
    fontFamily: Fonts.inter,
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
  modelOptionTitleLocked: {
    fontFamily: Fonts.inter,
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.45)',
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 209, 102, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 209, 102, 0.3)',
  },
  lockBadgeText: {
    fontFamily: Fonts.poppins,
    fontSize: 9,
    fontWeight: '700',
    color: '#ffd166',
    letterSpacing: 0.5,
  },
  textInput: {
    fontFamily: Fonts.inter,
    flex: 1,
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 18,
    fontSize: 14,
    borderWidth: 1,
    fontWeight: '400',
  },
  textInputDark: {
    backgroundColor: 'rgba(13, 17, 38, 0.95)',
    color: '#ffffff',
    borderColor: 'rgba(255,255,255,0.15)',
  },
  textInputLight: {
    backgroundColor: '#ffffff',
    color: '#0f172a',
    borderColor: '#ffffff',
  },
  micButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,212,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0284c7',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendDisabled: { backgroundColor: 'rgba(2,132,199,0.4)', opacity: 0.5 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(4,8,20,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#000000',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,255,204,0.3)',
  },
  modalTitle: { color: '#ffffff', fontSize: 18, fontWeight: '700', textAlign: 'center' },
  modalDesc: { color: 'rgba(255,255,255,0.85)', fontSize: 13, textAlign: 'center', marginTop: 10, lineHeight: 19 },
  modalBtn: {
    marginTop: 20,
    backgroundColor: '#00ffcc',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  modalBtnText: { color: '#040814', fontSize: 14, fontWeight: '700' },
});

export default AIChatLightScreen;
