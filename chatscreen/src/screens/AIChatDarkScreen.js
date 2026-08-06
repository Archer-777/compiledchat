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
import { useSolarAmbience, computeSolarState } from '../hooks/useSolarAmbience';
import { Fonts } from '../theme/fonts';

// ── Custom Avatars ───────────────────────────────────────────────────────────

function AIAvatar({ timeName, auroraActive }) {
  const isEvening = !auroraActive && timeName === 'Evening';
  const isNight = auroraActive || timeName === 'Night';
  const bg = isEvening ? 'rgba(110, 60, 140, 0.85)' : isNight ? 'rgba(22, 32, 58, 0.85)' : '#355a73';
  const border = isEvening ? 'rgba(255, 255, 255, 0.35)' : isNight ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.3)';
  return (
    <View style={[styles.aiAvatarCircle, { backgroundColor: bg, borderColor: border }]}>
      <Svg width={32} height={32} viewBox="0 0 36 36">
        {/* Glowing Golden Halo Crown */}
        <Ellipse
          cx="18"
          cy="7"
          rx="11"
          ry="3.2"
          fill="none"
          stroke="#ffd700"
          strokeWidth="2"
        />
        {/* White 'AI' text in Poppins Bold */}
        <SvgText
          x="18"
          y="23"
          fill="#ffffff"
          fontSize="13"
          fontWeight="800"
          fontFamily={Fonts.poppins}
          textAnchor="middle"
        >
          AI
        </SvgText>
        {/* Orange Smile Curve Underscore */}
        <Path
          d="M 8 26 Q 18 32 28 26"
          fill="none"
          stroke="#ff9500"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}

function UserAvatar() {
  const orangeColor = '#ff9500';
  return (
    <View style={styles.avatarCircle}>
      <Svg width={28} height={28} viewBox="0 0 32 32">
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

// ── Main Component ───────────────────────────────────────────────────────────

const AIChatDarkScreen = ({ navigation, route }) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showTenMinModal, setShowTenMinModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState('spiritualize'); // 'spiritualize' | 'twin'
  const [showModelDropdown, setShowModelDropdown] = useState(false);

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

  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleKeyDown = (e) => {
        if (e.ctrlKey && e.key === '/') {
          e.preventDefault();
          setShowModelDropdown((prev) => !prev);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, []);

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

  // --- Day/Night Cycle Toggle: cycles Morning → Afternoon → Evening → Night ---
  const TIME_SLOTS = [
    { label: 'Morning',   icon: '🌅', hour: 8  },
    { label: 'Afternoon', icon: '☀️', hour: 14 },
    { label: 'Evening',   icon: '🌆', hour: 19 },
    { label: 'Night',     icon: '🌙', hour: 23 },
  ];
  const [timeSlotIndex, setTimeSlotIndex] = useState(null); // null = use real clock
  const currentSlot = timeSlotIndex !== null ? TIME_SLOTS[timeSlotIndex] : null;

  const cycleTimeSlot = () => {
    setTimeSlotIndex((prev) => {
      if (prev === null) return 0;
      return (prev + 1) % TIME_SLOTS.length;
    });
  };

  // Profile dropdown state
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // --- Automatic Emotional Weather State ---
  const [weatherState, setWeatherState] = useState('clear'); // 'clear' | 'happy' | 'rain'
  const [neutralMessageCount, setNeutralMessageCount] = useState(0);

  // Dynamic username from route params (defaults to 'User' if unsigned)
  const userName = route?.params?.userName ?? 'User';

  const solar = useSolarAmbience({
    testAurora: isAuroraTime,
    auroraDelayMs: 180_000,
    countryCode: undefined,
    simulatedDayMs: demoMode ? 120_000 : undefined,
    // When a time slot is manually selected, override the hook's real-clock hour
    now: currentSlot ? () => { const d = new Date(); d.setHours(currentSlot.hour, 0, 0, 0); return d; } : undefined,
  });

  useEffect(() => {
    const parent = navigation?.getParent();
    if (parent) {
      parent.setOptions({ tabBarStyle: { display: 'none' } });
    }
  }, [navigation]);

  // Adaptive dark UI detection (used for input + bubble styles)
  const isSkyDark = solar.auroraActive || solar.nightOpacity > 0.4 || solar.sunOpacity <= 0.35;

  // --- Slot-computed solar override: bypass stale hook closure ---
  // When a time slot is manually selected, compute the solar state directly
  // from that hour so sky visuals (moon, stars, sun, gradient) immediately reflect it.
  const slotSolar = currentSlot
    ? { ...computeSolarState(currentSlot.hour, 6, 19), auroraActive: solar.auroraActive }
    : null;
  const displaySolar = slotSolar ?? solar;

  // --- Toast Popup Notification ---
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

  // Contextual 3-Tier Emotion Sentiment Analyzer
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
      // Neutral message handling: Auto-clear rain after 2 neutral messages
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
          text: 'Consciousness expanded. The ambient sky shifts with you...',
        },
      ]);
    }, 1000);
  };

  const handleMicPress = () => Alert.alert('Voice Input', 'Listening...');

  const handleGoBack = () => {
    if (navigation?.goBack) navigation.goBack();
    else if (navigation?.navigate) navigation.navigate('AIChatLight');
  };

  // Dynamic time greeting — use slot when active, else real clock
  const h = displaySolar.fractionalHour;
  let timeIcon = '🌅';
  let timeName = 'Morning';
  if (h >= 12 && h < 17) {
    timeIcon = '☀️';
    timeName = 'Afternoon';
  } else if (h >= 17 && h < 21) {
    timeIcon = '🌆';
    timeName = 'Evening';
  } else if (h >= 21 || h < 5) {
    timeIcon = '🌙';
    timeName = 'Night';
  }
  // When slot is manually toggled, use its label directly (no stale clock)
  const displayTimeName = currentSlot ? currentSlot.label : timeName;
  const displayIcon = currentSlot ? currentSlot.icon : timeIcon;
  const isNightOrEvening =
    displayTimeName === 'Night' ||
    displayTimeName === 'Evening' ||
    displayTimeName.toLowerCase().includes('night') ||
    displayTimeName.toLowerCase().includes('evening') ||
    isSkyDark;

  const getBubbleStyle = (isAI) => {
    const isAurora = solar.auroraActive;
    const isEvening = !isAurora && displayTimeName === 'Evening';
    const isNight = isAurora || displayTimeName === 'Night';

    const baseStyle = isAI
      ? (isSkyDark ? styles.aiBubbleDark : styles.aiBubbleLight)
      : (isSkyDark ? styles.userBubbleDark : styles.userBubbleLight);

    if (isEvening) {
      return [
        styles.bubble,
        baseStyle,
        {
          backgroundColor: 'rgba(110, 60, 140, 0.58)', // glowing violet glass
          borderColor: 'rgba(255, 255, 255, 0.28)',
        }
      ];
    }

    if (isNight) {
      return [
        styles.bubble,
        baseStyle,
        {
          backgroundColor: 'rgba(22, 32, 58, 0.65)', // midnight navy glass
          borderColor: 'rgba(255, 255, 255, 0.25)',
        }
      ];
    }

    return [styles.bubble, baseStyle];
  };

  return (
    <View style={{ flex: 1, flexDirection: Platform.OS === 'web' ? 'row' : 'column' }}>
      {Platform.OS === 'web' && (
        <DesktopSidebar
          isDark={isSkyDark}
          currentSlot={currentSlot}
          timeIcon={timeIcon}
          manualAurora={manualAurora}
          onToggleAurora={() => {
            const next = !manualAurora;
            setManualAurora(next);
            showToast(next ? '🌌 Aurora Mode Active' : '☀️ Aurora Off');
          }}
          onCycleTimeSlot={cycleTimeSlot}
          onToggleTheme={() => {
            if (navigation?.navigate) {
              navigation.navigate('AIChatLight');
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
        <AmbientBackground {...displaySolar} weatherState={weatherState} />

        {/* Full-Screen Crystal-Clear Ambient Dark Veil (Option 1: Crisp sky, soft dimmed glare, zero blur) */}
        <View
          style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor: isSkyDark
                ? 'rgba(10, 14, 28, 0.22)'
                : 'rgba(0, 0, 0, 0.06)',
              pointerEvents: 'none',
            },
          ]}
        />

        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />

        <SafeAreaView style={styles.safeArea}>
          <View style={styles.centerDesktopColumn}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ flex: 1 }}
            >


          {/* Full Screen Scrollable Chat Messages */}
          <ScrollView
            style={styles.chatScrollView}
            contentContainerStyle={[styles.chatContent, { paddingTop: 10 }]}
            showsVerticalScrollIndicator={false}
          >
              {messages.map((item) => {
                if (item.type === 'badge') {
                  const isAurora = solar.auroraActive;
                  const isEvening = !isAurora && displayTimeName === 'Evening';
                  const isNight = isAurora || displayTimeName === 'Night';
                  const badgeBg = isEvening 
                    ? 'rgba(110, 60, 140, 0.72)' 
                    : isNight 
                      ? 'rgba(22, 32, 58, 0.72)' 
                      : 'rgba(67, 123, 153, 0.72)';
                  const badgeBorder = isEvening 
                    ? 'rgba(255, 255, 255, 0.38)' 
                    : isNight 
                      ? 'rgba(255, 255, 255, 0.28)' 
                      : 'rgba(255, 255, 255, 0.38)';

                  return (
                    <View key={item.id} style={styles.streakBadgeContainer}>
                      <View style={[styles.streakBadge, { backgroundColor: badgeBg, borderColor: badgeBorder }]}>
                        <Ionicons name="flame" size={14} color="#f59e0b" style={{ marginRight: 5 }} />
                        <Text style={styles.streakBadgeText}>{item.text}</Text>
                      </View>
                    </View>
                  );
                }
                const isAI = item.sender === 'ai';
                return (
                  <View key={item.id} style={[styles.messageRow, isAI ? styles.rowLeft : styles.rowRight]}>
                    {isAI && <AIAvatar timeName={displayTimeName} auroraActive={solar.auroraActive} />}

                    <View style={getBubbleStyle(isAI)}>
                      <Text style={styles.messageText}>
                        {item.text}
                      </Text>
                    </View>

                    {!isAI && <UserAvatar />}
                  </View>
                );
              })}
            </ScrollView>

          {/* Input Bar (Prototype White Capsule Pill) */}
          <View style={styles.bottomSection}>
            {/* Model Selector Bar & Dropdown Container */}
            <View style={{ position: 'relative', zIndex: 200 }}>
              <View style={styles.modelSelectorBar}>
                <TouchableOpacity
                  style={styles.modelSelectorPill}
                  onPress={() => setShowModelDropdown(!showModelDropdown)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.modelSelectorLabel}>
                    {selectedModel === 'spiritualize' ? 'Spiritualize AI' : 'Digital Twin'}
                  </Text>
                  <Ionicons
                    name={showModelDropdown ? 'chevron-up-outline' : 'chevron-down-outline'}
                    size={14}
                    color="#ffffff"
                    style={{ marginLeft: 6 }}
                  />
                </TouchableOpacity>
              </View>

              {/* Floating Dropdown Selector Menu */}
              {showModelDropdown && (
                <View style={styles.dropdownPopover}>
                  <TouchableOpacity
                    style={[
                      styles.dropdownOption,
                      selectedModel === 'spiritualize' && styles.dropdownOptionActive,
                    ]}
                    onPress={() => {
                      setSelectedModel('spiritualize');
                      setShowModelDropdown(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selectedModel === 'spiritualize' && styles.optionTextActive,
                      ]}
                    >
                      Spiritualize AI
                    </Text>
                    {selectedModel === 'spiritualize' && (
                      <Ionicons name="checkmark-outline" size={14} color="#ffffff" />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.dropdownOption,
                      styles.dropdownOptionDisabled,
                    ]}
                    onPress={() => {
                      // Show custom Toast popup
                      showToast('🔒 Digital Twin is locked until registration is completed.');
                      setShowModelDropdown(false);
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={[styles.optionText, styles.optionTextDisabled]}>
                        Digital Twin
                      </Text>
                      <Ionicons
                        name="lock-closed-outline"
                        size={12}
                        color="rgba(255,255,255,0.4)"
                        style={{ marginLeft: 6 }}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
              )}

              {/* Toast Popup (Right above the pill) */}
              {!!toastText && (
                <Animated.View style={[styles.toastPillContextual, { opacity: toastFade }]} pointerEvents="none">
                  <BlurView intensity={60} tint="dark" style={styles.toastBlurContextual}>
                    <Text style={styles.toastText}>{toastText}</Text>
                  </BlurView>
                </Animated.View>
              )}
            </View>

            <View style={styles.prototypeInputCapsule}>
              <TextInput
                style={styles.prototypeInputText}
                placeholder="Message..."
                placeholderTextColor="#64748b"
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={handleSend}
              />
              <TouchableOpacity style={styles.inputMicBtn} onPress={handleMicPress} activeOpacity={0.7}>
                <Ionicons name="mic-outline" size={20} color="#475569" />
              </TouchableOpacity>
            </View>

            {/* Grounding Footer (Poppins Engine) */}
            <View style={styles.groundingFooterContainer}>
              <Text style={styles.groundingFooterText}>
                I AM NOT PERFECT. LET'S TRANSCEND CONSCIOUSNESS
              </Text>
            </View>
          </View>
          </KeyboardAvoidingView>
        </View>
      </SafeAreaView>

      {/* Top Center Timer Pill */}
      <View style={styles.topCenterTimerContainer} pointerEvents="none">
        <View style={styles.timerPill}>
          <Ionicons
            name="time-outline"
            size={11}
            color={isNightOrEvening ? '#ffffff' : '#000000'}
            style={{ marginRight: 3 }}
          />
          <Text style={[styles.timerText, { color: isNightOrEvening ? '#ffffff' : '#000000' }]}>
            {formatTime(elapsedSeconds)}
          </Text>
        </View>
      </View>

      {/* Floating Transparent Header — rendered LAST so it sits on top and receives touches */}
      <View style={styles.floatingHeader}>
        {/* Left Side: Back Arrow + Greeting */}
        <View style={styles.floatingLeft}>
          <TouchableOpacity style={styles.iconCircleBtn} onPress={handleGoBack} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color="#ffffff" />
          </TouchableOpacity>
          <View style={{ marginTop: 4 }}>
            <Text style={styles.floatingGreeting}>
              <Text style={{ fontFamily: Fonts.poppins, fontWeight: '300' }}>Hey </Text>
              <Text style={{ fontFamily: Fonts.poppins, fontWeight: '700' }}>{userProfileName}</Text>
            </Text>
            <Text style={styles.floatingSubtitle}>
              {displayTimeName.toUpperCase()} AMBIENT{solar.auroraActive ? ' • AURORA' : ''}
            </Text>
          </View>
        </View>

        {/* Right Side: Action Icons aligned at EXACT SAME LEVEL as "Hey User" */}
        {/* Order: 1. Aurora -> 2. Day/Night Toggle -> 3. Profile */}
        <View style={styles.floatingRight}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {/* 1. Aurora Toggle Button */}
            <TouchableOpacity
              style={[styles.iconCircleBtn, manualAurora && { backgroundColor: 'rgba(0,212,255,0.35)' }]}
              onPress={() => {
                const next = !manualAurora;
                setManualAurora(next);
                showToast(next ? '🌌 Aurora Mode Active' : '☀️ Aurora Off');
              }}
              activeOpacity={0.7}
              accessibilityLabel="Toggle Aurora"
            >
              <Text style={{ fontSize: 18 }}>🌌</Text>
            </TouchableOpacity>

            {/* 2. Day/Night Ambient Toggle Button (MIDDLE) */}
            <TouchableOpacity
              style={[styles.iconCircleBtn, currentSlot && { backgroundColor: 'rgba(255,200,80,0.25)' }]}
              onPress={cycleTimeSlot}
              activeOpacity={0.7}
              accessibilityLabel="Cycle Day/Night"
            >
              <Text style={{ fontSize: 18 }}>{currentSlot ? currentSlot.icon : timeIcon}</Text>
            </TouchableOpacity>

            {/* 3. Profile Icon (RIGHT EDGE) */}
            <TouchableOpacity
              style={styles.iconCircleBtn}
              onPress={() => {
                if (typeof window !== 'undefined') {
                  window.location.href = 'http://localhost:3000/soul-matrix';
                } else {
                  setShowProfileDropdown(true);
                }
              }}
              activeOpacity={0.7}
              accessibilityLabel="User Profile"
            >
              <Ionicons name="person-circle-outline" size={22} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Inline Profile Dropdown — rendered inside floatingHeader so it stays within screen bounds */}
        {showProfileDropdown && (
          <>
            {/* Invisible full-screen tap-away closer */}
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={() => setShowProfileDropdown(false)}
            />
            <View style={styles.profileDropdown}>
              <TouchableOpacity
                style={styles.profileOption}
                onPress={() => {
                  setShowProfileDropdown(false);
                  if (typeof window !== 'undefined') {
                    window.location.href = 'http://localhost:3000/soul-matrix';
                  } else if (navigation && navigation.navigate) {
                    navigation.navigate('SoulMatrix');
                  }
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="person-outline" size={18} color="#ffffff" style={{ marginRight: 10 }} />
                <Text style={styles.profileOptionText}>Profile Settings</Text>
              </TouchableOpacity>
              <View style={styles.profileDivider} />
              <TouchableOpacity
                style={styles.profileOption}
                onPress={() => {
                  setShowProfileDropdown(false);
                  Alert.alert('Logout', 'Logout functionality coming soon!');
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="log-out-outline" size={18} color="#ff6b6b" style={{ marginRight: 10 }} />
                <Text style={[styles.profileOptionText, { color: '#ff6b6b' }]}>Logout</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>


      {/* 10-Min Session Completion Modal */}
      <Modal visible={showTenMinModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Image source={require('../../nextarcherlogo.jpeg')} resizeMode="contain" style={{ width: 44, height: 44, borderRadius: 12, marginBottom: 12 }} />
            <Text style={styles.modalTitle}>Session Completed</Text>
            <Text style={styles.modalDesc}>
              Your 10-minute reflection cycle is complete.
            </Text>
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => {
                setShowTenMinModal(false);
                if (typeof window !== 'undefined') {
                  window.location.href = 'http://localhost:3000/heal-me';
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
    marginTop: Platform.OS === 'android'
      ? (StatusBar.currentHeight || 28) + 80
      : 125,
  },
  centerDesktopColumn: {
    flex: 1,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
  // ── Floating Sky Header ────────────────────────────────────────────────────
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'web' ? 16 : Platform.OS === 'android' ? (StatusBar.currentHeight || 28) + 8 : 46,
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  floatingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  floatingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chatGlassCard: {
    flex: 1,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
    marginHorizontal: Platform.OS === 'web' ? 'auto' : 10,
    marginTop: Platform.OS === 'web' ? 70 : 82,
    marginBottom: Platform.OS === 'web' ? 16 : 4,
    borderRadius: 24,
    backgroundColor: 'rgba(15, 22, 42, 0.46)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    overflow: 'hidden',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(16px)' } : {}),
  },
  floatingGreeting: {
    fontFamily: Fonts.poppins,
    fontSize: 22,
    color: '#ffffff',
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  floatingSubtitle: {
    fontFamily: Fonts.poppins,
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 1.5,
    color: 'rgba(255,255,255,0.75)',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  iconCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(12px)' } : {}),
  },
  // ── AI & User Avatar Styles ───────────────────────────────────────────────
  aiAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#355a73',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  titleContainer: { alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700' },
  subtitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  headerSubtitle: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  topCenterTimerContainer: {
    position: 'absolute',
    top: Platform.OS === 'android' ? (StatusBar.currentHeight || 28) + 10 : 16,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  timerText: { fontFamily: Fonts.poppins, fontSize: 11, fontWeight: '700' },
  // ── Inline Profile Dropdown (inside floatingHeader, stays within screen) ──
  profileDropdown: {
    position: 'absolute',
    top: Platform.OS === 'android' ? (StatusBar.currentHeight || 28) + 90 : 140,
    right: 0,
    backgroundColor: 'rgba(15, 20, 45, 0.97)',
    borderRadius: 14,
    paddingVertical: 6,
    minWidth: 185,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 20,
    zIndex: 100,
  },
  profileOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  profileOptionText: {
    fontFamily: Fonts.inter,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  profileDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginHorizontal: 12,
  },
  toastPillContextual: {
    position: 'absolute',
    bottom: 34,
    left: 0,
    zIndex: 300,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  toastBlurContextual: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
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
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.38)',
    backgroundColor: 'rgba(67, 123, 153, 0.72)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  streakBadgeText: { fontFamily: Fonts.poppins, color: '#ffffff', fontSize: 12, fontWeight: '700' },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', marginVertical: 4 },
  rowLeft: { justifyContent: 'flex-start' },
  rowRight: { justifyContent: 'flex-end' },
  bubble: {
    maxWidth: '76%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  aiBubbleDark: {
    borderTopLeftRadius: 4,
    backgroundColor: 'rgba(67, 123, 153, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  aiBubbleLight: {
    borderTopLeftRadius: 4,
    backgroundColor: 'rgba(67, 123, 153, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  userBubbleDark: {
    borderBottomRightRadius: 4,
    backgroundColor: 'rgba(67, 123, 153, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  userBubbleLight: {
    borderBottomRightRadius: 4,
    backgroundColor: 'rgba(67, 123, 153, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  messageText: { fontFamily: Fonts.inter, fontSize: 14, lineHeight: 21, fontWeight: '400', color: '#ffffff' },
  bottomSection: {
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 16 : 14,
    backgroundColor: 'transparent',
  },
  modelSelectorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    zIndex: 100,
  },
  modelSelectorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modelSelectorLabel: {
    fontFamily: Fonts.poppins,
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },

  dropdownPopover: {
    position: 'absolute',
    bottom: 34,
    left: 0,
    width: 200,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 12,
    padding: 6,
    zIndex: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginVertical: 2,
  },
  dropdownOptionActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  dropdownOptionDisabled: {
    opacity: 0.65,
  },
  optionText: {
    fontFamily: Fonts.poppins,
    fontSize: 13,
    fontWeight: '500',
    color: '#cbd5e1',
  },
  optionTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  optionTextDisabled: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  prototypeInputCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 25,
    height: 50,
    paddingLeft: 12,
    paddingRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'visible',
  },
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
    bottom: 58,
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
  prototypeInputText: {
    fontFamily: Fonts.inter,
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '400',
    borderWidth: 0,
    outlineWidth: 0,
    outlineStyle: 'none',
    backgroundColor: 'transparent',
    paddingVertical: 0,
  },
  inputMicBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
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
  modalTitle: { fontFamily: Fonts.poppins, color: '#ffffff', fontSize: 18, fontWeight: '700', textAlign: 'center' },
  modalDesc: { fontFamily: Fonts.inter, color: 'rgba(255,255,255,0.85)', fontSize: 13, textAlign: 'center', marginTop: 10, lineHeight: 19 },
  modalBtn: {
    marginTop: 20,
    backgroundColor: '#00ffcc',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  modalBtnText: { fontFamily: Fonts.poppins, color: '#040814', fontSize: 14, fontWeight: '700' },
  // ── Grounding Footer (Poppins Engine) ──────────────────────────────────────
  groundingFooterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingBottom: 2,
  },
  groundingFooterText: {
    fontFamily: Fonts.poppins,
    fontSize: 9.5,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.65)',
    letterSpacing: 1.2,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});

export default AIChatDarkScreen;
