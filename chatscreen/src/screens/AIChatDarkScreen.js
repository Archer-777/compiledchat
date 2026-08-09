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
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Ellipse, Path, Text as SvgText } from 'react-native-svg';
import { BlurView } from 'expo-blur';
import { AmbientBackground } from '../components/AmbientBackground';
import { DesktopSidebar } from '../components/DesktopSidebar';
import { useSolarAmbience, computeSolarState } from '../hooks/useSolarAmbience';
import { Fonts } from '../theme/fonts';
import { saveChatSession, getChatSessions, getChatMessagesForSession, generateUUID, getUserData } from '../utils/storage';
import { sendToSAIStream } from '../utils/saiApi';
import { FormattedMarkdown } from '../components/FormattedMarkdown';
import auroraGlitchImg from '../../assets/aurora_glitch.jpeg';
import aiLogoSvg from '../../assets/2.svg';
import userIconSvg from '../../assets/user_icon.svg';

// ── Custom Avatars ───────────────────────────────────────────────────────────

function AIAvatar() {
  return (
    <View style={{ width: 34, height: 34, borderRadius: 17, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginHorizontal: 4 }}>
      <Image
        source={aiLogoSvg}
        style={{ width: 34, height: 34, borderRadius: 17 }}
        resizeMode="cover"
      />
    </View>
  );
}

function UserAvatar() {
  return (
    <View style={{ width: 34, height: 34, borderRadius: 17, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginHorizontal: 4 }}>
      <Image
        source={userIconSvg}
        style={{ width: 34, height: 34, borderRadius: 17 }}
        resizeMode="cover"
      />
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
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 960; // Universal Sidebar Breakpoint (< 960px)

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showTenMinModal, setShowTenMinModal] = useState(false);
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);
  const [userProfileName, setUserProfileName] = useState('Archer');
  const [historyItems, setHistoryItems] = useState([]);
  const [isGuest, setIsGuest] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        if (isGuest && next === 120) {
          setShowTenMinModal(true);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isGuest, navigation]);

  useEffect(() => {
    let isMounted = true;

    const fetchLatestAccount = async () => {
      let targetEmail = '';
      let targetName = '';
      try {
        if (typeof window !== 'undefined' && window.location) {
          const urlParams = new URLSearchParams(window.location.search);
          targetEmail = urlParams.get('email') || '';
          targetName = urlParams.get('firstName') || urlParams.get('username') || urlParams.get('name') || '';
        }
      } catch (e) {}

      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const raw = window.localStorage.getItem('@active_auth_session') || window.localStorage.getItem('@spiritual_register_user');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (!targetEmail) targetEmail = parsed.email || '';
            if (!targetName) targetName = parsed.firstName || parsed.first_name || '';
          }
        }
      } catch (e) {}

      if (targetEmail && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('@active_auth_session', JSON.stringify({
          email: targetEmail,
          firstName: targetName || 'User',
          isGuest: false
        }));
      }

      if (targetName && isMounted) {
        setUserProfileName(targetName.trim());
        setIsGuest(false);
      }

      if (targetEmail) {
        try {
          const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3bW55b21sZmNoYXphcGtvaGZ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTU1MTgzNCwiZXhwIjoyMTAxMTI3ODM0fQ.n-t9bJZ3juSlIK2OrJRrsSRQhZkbaLZFfNs_Zu8ELuY';
          const endpoint = `https://qwmnyomlfchazapkohfy.supabase.co/rest/v1/users?email=eq.${encodeURIComponent(targetEmail.toLowerCase().trim())}&select=first_name,full_name,email`;
          const res = await fetch(endpoint, {
            headers: {
              'apikey': serviceKey,
              'Authorization': `Bearer ${serviceKey}`,
            },
          });
          if (res.ok) {
            const data = await res.json();
            if (data && data.length > 0 && isMounted) {
              const dbName = data[0].first_name || (data[0].full_name ? data[0].full_name.split(' ')[0] : '');
              if (dbName) {
                setUserProfileName(dbName.trim());
                setIsGuest(false);
              }
            }
          }
        } catch (dbErr) {
          console.warn('Supabase DB fetch failed:', dbErr);
        }
        return;
      }

      // Default state for unauthenticated visitor: ARCHER in GUEST MODE
      if (isMounted) {
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.removeItem('@spiritual_register_user');
            window.localStorage.removeItem('@active_auth_session');
          }
        } catch (e) {}
        setUserProfileName('Archer');
        setIsGuest(true);
      }
    };

    fetchLatestAccount();

    return () => {
      isMounted = false;
    };
  }, []);

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

  const TIME_SLOTS = [
    { label: 'Morning',   icon: '🌅', hour: 8  },
    { label: 'Afternoon', icon: '☀️', hour: 14 },
    { label: 'Evening',   icon: '🌆', hour: 19 },
    { label: 'Night',     icon: '🌙', hour: 23 },
  ];
  const [timeSlotIndex, setTimeSlotIndex] = useState(null);
  const currentSlot = timeSlotIndex !== null ? TIME_SLOTS[timeSlotIndex] : null;

  const cycleTimeSlot = () => {
    setTimeSlotIndex((prev) => {
      if (prev === null) return 0;
      return (prev + 1) % TIME_SLOTS.length;
    });
  };

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [weatherState, setWeatherState] = useState('clear');
  const [neutralMessageCount, setNeutralMessageCount] = useState(0);

  const solar = useSolarAmbience({
    testAurora: isAuroraTime,
    auroraDelayMs: 180_000,
    countryCode: undefined,
    simulatedDayMs: demoMode ? 120_000 : undefined,
    now: currentSlot ? () => { const d = new Date(); d.setHours(currentSlot.hour, 0, 0, 0); return d; } : undefined,
  });

  useEffect(() => {
    const parent = navigation?.getParent();
    if (parent) {
      parent.setOptions({ tabBarStyle: { display: 'none' } });
    }
  }, [navigation]);

  const isSkyDark = solar.auroraActive || solar.nightOpacity > 0.4 || solar.sunOpacity <= 0.35;

  const slotSolar = currentSlot
    ? { ...computeSolarState(currentSlot.hour, 6, 19), auroraActive: solar.auroraActive }
    : null;
  const displaySolar = slotSolar ?? solar;

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

  const [currentSessionId, setCurrentSessionId] = useState(() => generateUUID());
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([
    { id: '0', sender: 'ai', text: 'Namaste 🙏\n\nI\'m SAI — here to enrich your personal "i" — Insights as you move from Point A to Point B.\n\nSAI = A → i → B' },
  ]);

  const [drawerHistoryItems, setDrawerHistoryItems] = useState([]);

  const loadSessions = async () => {
    try {
      const sessions = await getChatSessions(null, 'spiritual');
      if (Array.isArray(sessions)) {
        setHistoryItems(sessions);
        setDrawerHistoryItems(sessions);
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadSessions();
    if (typeof window !== 'undefined') {
      window.addEventListener('chat-sessions-changed', loadSessions);
      return () => window.removeEventListener('chat-sessions-changed', loadSessions);
    }
  }, []);

  useEffect(() => {
    if (showMobileDrawer) {
      const syncMobileSessions = async () => {
        try {
          const sessions = await getChatSessions(null, 'spiritual');
          if (Array.isArray(sessions) && sessions.length > 0) {
            setHistoryItems(sessions);
            setDrawerHistoryItems(sessions);
            return;
          }
          if (typeof window !== 'undefined' && window.localStorage) {
            const raw = window.localStorage.getItem('@spiritual_chat_sessions');
            if (raw) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setHistoryItems(parsed);
                setDrawerHistoryItems(parsed);
              }
            }
          }
        } catch (e) {}
      };
      syncMobileSessions();
    }
  }, [showMobileDrawer]);

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

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const textToSend = inputText.trim();
    const newMsg = { id: Date.now().toString(), sender: 'user', text: textToSend };
    const updatedUserMsgs = [...messages, newMsg];
    setMessages(updatedUserMsgs);
    setInputText('');
    detectEmotionalWeather(textToSend);

    // Save session immediately so New Chat appears in sidebar history in real time
    saveChatSession({
      id: currentSessionId,
      title: textToSend,
      messages: updatedUserMsgs,
    });

    // Insert a placeholder AI bubble immediately so the user sees it typing
    const streamingMsgId = 'streaming_' + Date.now();
    const withStreaming = [
      ...updatedUserMsgs,
      { id: streamingMsgId, sender: 'ai', text: '▍' }
    ];
    setMessages(withStreaming);

    sendToSAIStream(
      updatedUserMsgs,
      // onChunk — update the placeholder bubble with accumulated text
      (accumulated) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === streamingMsgId ? { ...m, text: accumulated + ' ▍' } : m
          )
        );
      },
      // onDone — finalise and save session
      (fullText) => {
        const finalText = fullText || 'Consciousness expanded. The ambient sky shifts with you...';
        const finalMsgs = updatedUserMsgs.concat([
          { id: streamingMsgId, sender: 'ai', text: finalText }
        ]);
        setMessages(finalMsgs);
        saveChatSession({
          id: currentSessionId,
          title: updatedUserMsgs.find(m => m.sender === 'user')?.text || textToSend,
          messages: finalMsgs
        });
      },
      // onError — replace placeholder with fallback
      (err) => {
        console.error('SAI stream error:', err);
        const fallbackMsgs = updatedUserMsgs.concat([
          { id: streamingMsgId, sender: 'ai', text: 'Consciousness expanded. The ambient sky shifts with you...' }
        ]);
        setMessages(fallbackMsgs);
        saveChatSession({
          id: currentSessionId,
          title: updatedUserMsgs.find(m => m.sender === 'user')?.text || textToSend,
          messages: fallbackMsgs
        });
      }
    );
  };


  const handleMicPress = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('⚠️ Voice input not supported in browser (Use Chrome/Edge)');
      return;
    }

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
      showToast('🎤 Voice input stopped');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        showToast('🎙️ Listening... Speak now');
      };

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInputText(transcript);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'network') {
          showToast('🎙️ Web Speech API blocked by browser/adblocker (Use Win+H for Voice Typing)');
        } else if (event.error === 'not-allowed') {
          showToast('⚠️ Mic permission denied in browser settings');
        } else if (event.error !== 'no-speech') {
          showToast(`⚠️ Voice input: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Speech recognition start failed:', err);
      setIsListening(false);
      showToast('⚠️ Could not access microphone');
    }
  };

  const handleGoBack = () => {
    if (navigation?.goBack) navigation.goBack();
    else if (navigation?.navigate) navigation.navigate('AIChatLight');
  };

  const handleEndSession = async () => {
    try {
      // Trigger SAI CONVERSATION ANALYSIS + CONSCIOUSNESS TELEMETRY ENGINE
      let telemetryParam = '';
      try {
        const uData = await getUserData();
        const email = uData?.email || '';
        const res = await fetch('http://localhost:4000/api/v1/chat/sai/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages, email }),
        });
        const data = await res.json();
        if (data && data.telemetry) {
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem('@telemetry_analysis_result', JSON.stringify(data.telemetry));
          }
          telemetryParam = `?telemetry=${encodeURIComponent(JSON.stringify(data.telemetry))}`;
        }
      } catch (err) {
        console.warn('Telemetry analysis call notice:', err);
      }

      if (isGuest) {
        window.location.href = 'http://localhost:3000/register';
      } else {
        window.location.href = `http://localhost:3000/soul-matrix${telemetryParam}`;
      }
    } catch (e) {
      console.error("End session error", e);
    }
  };

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

  const displayTimeName = currentSlot ? currentSlot.label : timeName;
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
          backgroundColor: 'rgba(110, 60, 140, 0.58)',
          borderColor: 'rgba(255, 255, 255, 0.28)',
        }
      ];
    }

    if (isNight) {
      return [
        styles.bubble,
        baseStyle,
        {
          backgroundColor: 'rgba(22, 32, 58, 0.65)',
          borderColor: 'rgba(255, 255, 255, 0.25)',
        }
      ];
    }

    return [styles.bubble, baseStyle];
  };

  return (
    <View style={{ flex: 1, flexDirection: Platform.OS === 'web' && !isSmallScreen ? 'row' : 'column' }}>
      {/* Desktop Sidebar — Hidden automatically on screens < 960px */}
      {Platform.OS === 'web' && !isSmallScreen && (
        <DesktopSidebar
          isDark={isSkyDark}
          currentSlot={currentSlot}
          timeIcon={timeIcon}
          manualAurora={manualAurora}
          historyItems={historyItems}
          onSelectHistoryItem={async (item) => {
            if (!item || !item.id) return;
            setCurrentSessionId(item.id);
            let msgs = item.messages;
            if (!msgs || msgs.length === 0) {
              msgs = await getChatMessagesForSession(item.id);
            }
            if (msgs && msgs.length > 0) {
              setMessages(msgs);
              showToast(`Restored: ${item.title || 'Chat'}`);
            }
          }}
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
            const newId = generateUUID();
            setCurrentSessionId(newId);
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
                  const isAI = item.sender === 'ai' || item.sender === 'twin' || item.sender === 'assistant';
                  return (
                    <View key={item.id} style={[styles.messageRow, isAI ? styles.rowLeft : styles.rowRight]}>
                      {isAI && <AIAvatar timeName={displayTimeName} auroraActive={solar.auroraActive} />}

                      <View style={getBubbleStyle(isAI)}>
                        <FormattedMarkdown text={item.text} style={styles.messageText} />
                      </View>

                      {!isAI && <UserAvatar />}
                    </View>
                  );
                })}
              </ScrollView>

              {/* Input Bar */}
              <View style={styles.bottomSection}>
                <View style={{ position: 'relative', zIndex: 200 }}>
                  {/* Toast Popup */}
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

                {/* Grounding Footer */}
                <View style={styles.groundingFooterContainer}>
                  <Text style={styles.groundingFooterText}>
                    I AM NOT PERFECT. LET'S TRANSCEND CONSCIOUSNESS
                  </Text>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </SafeAreaView>

        {/* Top Center Timer Pill — Hidden on small screens to avoid header collision */}
        {!isSmallScreen && isGuest && (
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
        )}

        {/* Floating Transparent Header */}
        <View style={styles.floatingHeader}>
          {/* Left Side: Hamburger Drawer Trigger (<960px) or Back Arrow + Greeting */}
          <View style={styles.floatingLeft}>
            {isSmallScreen ? (
              <TouchableOpacity style={styles.iconCircleBtn} onPress={() => setShowMobileDrawer(true)} activeOpacity={0.7}>
                <Ionicons name="menu" size={22} color="#ffffff" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.iconCircleBtn} onPress={handleGoBack} activeOpacity={0.7}>
                <Ionicons name="arrow-back" size={22} color="#ffffff" />
              </TouchableOpacity>
            )}

            <View style={{ marginTop: 2 }}>
              <Text style={styles.floatingGreeting}>
                <Text style={{ fontFamily: Fonts.poppins, fontWeight: '300' }}>Hey </Text>
                <Text style={{ fontFamily: Fonts.poppins, fontWeight: '700' }}>{userProfileName}</Text>
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 1 }}>
                <Text style={styles.floatingSubtitle}>
                  {displayTimeName.toUpperCase()} AMBIENT{solar.auroraActive ? ' • AURORA' : ''}
                </Text>
                {isSmallScreen && isGuest && (
                  <View style={styles.timerPillInline}>
                    <Ionicons name="time-outline" size={10} color={isNightOrEvening ? '#ffffff' : '#000000'} style={{ marginRight: 2 }} />
                    <Text style={[styles.timerTextInline, { color: isNightOrEvening ? '#ffffff' : '#000000' }]}>
                      {formatTime(elapsedSeconds)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Right Side: Simplified Action Controls */}
          <View style={styles.floatingRight}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {!isSmallScreen && (
                <TouchableOpacity
                  style={[styles.iconCircleBtn, { overflow: 'hidden', borderWidth: 0, padding: 0 }]}
                  onPress={() => {
                    const next = !manualAurora;
                    setManualAurora(next);
                    showToast(next ? '🌌 Aurora Mode Active' : '☀️ Aurora Off');
                  }}
                  activeOpacity={0.7}
                >
                  <Image
                    source={auroraGlitchImg}
                    style={{ width: 38, height: 38, borderRadius: 19 }}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.iconCircleBtn, currentSlot && { backgroundColor: 'rgba(255,200,80,0.25)' }]}
                onPress={cycleTimeSlot}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 18 }}>{currentSlot ? currentSlot.icon : timeIcon}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.iconCircleBtn, { backgroundColor: 'rgba(239, 68, 68, 0.25)', borderColor: 'rgba(239, 68, 68, 0.5)' }]}
                onPress={handleEndSession}
                activeOpacity={0.7}
              >
                <Ionicons name="stop-circle-outline" size={20} color="#ffb3b3" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.iconCircleBtn, { overflow: 'hidden', backgroundColor: 'transparent', borderWidth: 0 }]}
                onPress={() => {
                  if (typeof window !== 'undefined') {
                    window.location.href = 'http://localhost:3000/soul-matrix';
                  } else {
                    setShowProfileDropdown(true);
                  }
                }}
                activeOpacity={0.7}
              >
                <Image
                  source={require('../../assets/user_icon.svg')}
                  style={{ width: 34, height: 34, borderRadius: 17 }}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Profile Dropdown Menu */}
          {showProfileDropdown && (
            <>
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
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Image
                    source={require('../../assets/user_icon.svg')}
                    style={{ width: 18, height: 18, borderRadius: 9, marginRight: 10 }}
                    resizeMode="cover"
                  />
                  <Text style={styles.profileOptionText}>Profile Settings</Text>
                </TouchableOpacity>
                <View style={styles.profileDivider} />
                <TouchableOpacity
                  style={styles.profileOption}
                  onPress={() => {
                    setShowProfileDropdown(false);
                    try {
                      if (typeof window !== 'undefined' && window.localStorage) {
                        window.localStorage.removeItem('@active_auth_session');
                        window.localStorage.removeItem('@spiritual_register_user');
                        window.localStorage.removeItem('user_profile');
                        window.localStorage.removeItem('@telemetry_analysis_result');
                        const guestSession = { firstName: 'Archer', lastName: '', fullName: 'Archer', isGuest: true };
                        window.localStorage.setItem('@active_auth_session', JSON.stringify(guestSession));
                      }
                    } catch (e) {}
                    if (typeof window !== 'undefined') {
                      window.location.href = 'http://localhost:3000/scan';
                    }
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

        {/* Mobile Navigation Glass Drawer (< 960px) */}
        <Modal visible={showMobileDrawer} transparent animationType="slide">
          <View style={styles.drawerOverlay}>
            <BlurView intensity={80} tint="dark" style={styles.drawerContent}>
              <View style={styles.drawerHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Image source={require('../../assets/logo_in_white.svg')} resizeMode="contain" style={{ width: 36, height: 36 }} />
                  <Text style={{ fontFamily: Fonts.poppins, fontSize: 16, fontWeight: '700', color: '#ffffff' }}>Next Archer</Text>
                </View>
                <TouchableOpacity onPress={() => setShowMobileDrawer(false)}>
                  <Ionicons name="close" size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>
              
              <View style={{ marginTop: 20, gap: 12 }}>
                <TouchableOpacity
                  style={styles.drawerBtn}
                  onPress={() => {
                    setShowMobileDrawer(false);
                    setMessages([{ id: '1', sender: 'ai', text: 'Hello! Welcome to Next Archer. How can I help you today?', time: 'Just now' }]);
                    showToast('✨ New conversation started');
                  }}
                >
                  <Ionicons name="add-circle-outline" size={20} color="#00d4ff" />
                  <Text style={styles.drawerBtnText}>New Chat</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.drawerBtn}
                  onPress={() => {
                    setShowMobileDrawer(false);
                    if (typeof window !== 'undefined') window.location.href = 'http://localhost:3000/twin-chat';
                  }}
                >
                  <Ionicons name="hardware-chip-outline" size={20} color="#a855f7" />
                  <Text style={styles.drawerBtnText}>Twin Chat</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.drawerBtn}
                  onPress={() => {
                    setShowMobileDrawer(false);
                    if (typeof window !== 'undefined') window.location.href = 'http://localhost:3000/soul-matrix';
                  }}
                >
                  <Ionicons name="person-outline" size={20} color="#ffffff" />
                  <Text style={styles.drawerBtnText}>View-Life on DashBoard</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.drawerBtn}
                  onPress={() => {
                    setShowMobileDrawer(false);
                    if (typeof window !== 'undefined') window.location.href = 'http://localhost:3000/healing';
                  }}
                >
                  <Ionicons name="heart-outline" size={20} color="#00ffcc" />
                  <Text style={styles.drawerBtnText}>Act-Heal Me</Text>
                </TouchableOpacity>

                {/* RECENT CHATS Section in Mobile Drawer */}
                <View style={{ marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.12)', flex: 1, maxHeight: 340 }}>
                  <Text style={{ fontFamily: Fonts.inter, fontSize: 11, fontWeight: '700', color: 'rgba(255, 255, 255, 0.5)', letterSpacing: 1.2, marginBottom: 12 }}>
                    RECENT CHATS
                  </Text>
                  <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                    {((drawerHistoryItems && drawerHistoryItems.length > 0) ? drawerHistoryItems : historyItems) && ((drawerHistoryItems && drawerHistoryItems.length > 0) ? drawerHistoryItems : historyItems).length > 0 ? (
                      ((drawerHistoryItems && drawerHistoryItems.length > 0) ? drawerHistoryItems : historyItems).map((item) => (
                        <TouchableOpacity
                          key={item.id}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            borderRadius: 12,
                            paddingVertical: 10,
                            paddingHorizontal: 12,
                            marginBottom: 8,
                          }}
                          onPress={async () => {
                            setShowMobileDrawer(false);
                            if (!item || !item.id) return;
                            setCurrentSessionId(item.id);
                            let msgs = item.messages;
                            if (!msgs || msgs.length === 0) {
                              msgs = await getChatMessagesForSession(item.id);
                            }
                            if (msgs && msgs.length > 0) {
                              setMessages(msgs);
                              showToast(`Restored: ${item.title || 'Chat'}`);
                            }
                          }}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="chatbubble-ellipses-outline" size={16} color="rgba(255, 255, 255, 0.6)" style={{ marginRight: 10 }} />
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontFamily: Fonts.poppins, fontSize: 13, fontWeight: '600', color: '#ffffff' }} numberOfLines={1}>
                              {item.title}
                            </Text>
                            <Text style={{ fontFamily: Fonts.inter, fontSize: 10, color: 'rgba(255, 255, 255, 0.5)' }}>{item.time}</Text>
                          </View>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <Text style={{ fontFamily: Fonts.inter, fontSize: 12, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', paddingVertical: 8 }}>
                        No past sessions saved.
                      </Text>
                    )}
                  </ScrollView>
                </View>
              </View>
            </BlurView>
            <TouchableOpacity style={styles.drawerBackdrop} activeOpacity={1} onPress={() => setShowMobileDrawer(false)} />
          </View>
        </Modal>

        {/* 2-Min Session Completion Modal */}
        <Modal visible={showTenMinModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Image source={require('../../assets/logo_in_white.svg')} resizeMode="contain" style={{ width: 44, height: 44, marginBottom: 12 }} />
              <Text style={styles.modalTitle}>Session Completed</Text>
              <Text style={styles.modalDesc}>
                Your 2-minute trial reflection cycle is complete. Register for unlimited spiritual AI sessions.
              </Text>
              <TouchableOpacity
                style={styles.modalBtn}
                onPress={() => {
                  setShowTenMinModal(false);
                  if (typeof window !== 'undefined') {
                    if (window.parent && window.parent !== window) {
                      window.parent.location.href = 'http://localhost:3000/register';
                    } else {
                      window.location.href = 'http://localhost:3000/register';
                    }
                  } else if (navigation && navigation.navigate) {
                    navigation.navigate('Register');
                  }
                }}
              >
                <Text style={styles.modalBtnText}>Proceed to Register ✨</Text>
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
      : 110,
  },
  centerDesktopColumn: {
    flex: 1,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
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
    paddingHorizontal: 20,
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
  floatingGreeting: {
    fontFamily: Fonts.poppins,
    fontSize: 20,
    color: '#ffffff',
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  floatingSubtitle: {
    fontFamily: Fonts.poppins,
    fontSize: 9.5,
    fontWeight: '500',
    letterSpacing: 1.2,
    color: 'rgba(255,255,255,0.75)',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    textTransform: 'uppercase',
  },
  timerPillInline: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  timerTextInline: {
    fontFamily: Fonts.poppins,
    fontSize: 10,
    fontWeight: '700',
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
    maxWidth: '72%',
    paddingHorizontal: 18,
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
    paddingLeft: 16,
    paddingRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  prototypeInputText: {
    fontFamily: Fonts.inter,
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '400',
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
  groundingFooterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    paddingBottom: 2,
    width: '100%',
  },
  groundingFooterText: {
    fontFamily: Fonts.poppins,
    fontSize: 8.5,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.45)',
    letterSpacing: 0.8,
    textAlign: 'center',
    textTransform: 'uppercase',
    ...(Platform.OS === 'web' ? { whiteSpace: 'nowrap' } : {}),
  },
  // Mobile Drawer Overlay Styles (< 960px)
  drawerOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  drawerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  drawerContent: {
    width: 280,
    height: '100%',
    padding: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRightWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  drawerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  drawerBtnText: {
    fontFamily: Fonts.inter,
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default AIChatDarkScreen;
