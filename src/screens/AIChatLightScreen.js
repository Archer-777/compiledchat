import React, { useState } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const AIChatLightScreen = ({ navigation }) => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'ai',
      text: 'Hello! How are you today?',
    },
    {
      id: '2',
      sender: 'user',
      text: 'Hi',
    },
    {
      id: '3',
      sender: 'ai',
      text: 'This would be a normal conversation within 30 words.',
    },
    {
      id: '4',
      type: 'badge',
      text: 'Conversation Streak From User',
    },
    {
      id: '5',
      sender: 'ai',
      text: 'Knowledge base response for enlightening pleasant surprises and neuron enlightenment',
    },
  ]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText.trim(),
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    // Simulated AI response
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

  const handleMicPress = () => {
    Alert.alert('Voice Input', 'Listening for your voice input...');
  };

  const handleGoBack = () => {
    if (navigation && navigation.goBack) {
      navigation.goBack();
    } else if (navigation && navigation.navigate) {
      navigation.navigate('SuperchargeScreen');
    }
  };

  const handleSwitchToDark = () => {
    if (navigation && navigation.navigate) {
      navigation.navigate('AIChatDark');
    } else {
      Alert.alert('Theme Switch', 'Navigating to Dark Theme');
    }
  };

  return (
    <LinearGradient
      colors={['#87CEEB', '#c4e3f3', '#f5d5c8']}
      style={styles.gradientContainer}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#87CEEB" />

      {/* Cloud-like Floating Decorative Views */}
      <View style={[styles.cloud, styles.cloud1]} />
      <View style={[styles.cloud, styles.cloud2]} />
      <View style={[styles.cloud, styles.cloud3]} />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardContainer}
        >
          {/* Top Bar Header */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleGoBack}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#1a1a2e" />
            </TouchableOpacity>

            <View style={styles.titleContainer}>
              <Text style={styles.headerTitle}>Hey Neha ⭐</Text>
              <Text style={styles.headerSubtitle}>Sky Consciousness Mode</Text>
            </View>

            <TouchableOpacity
              style={styles.themeToggleBtn}
              onPress={handleSwitchToDark}
              activeOpacity={0.7}
            >
              <Ionicons name="moon" size={20} color="#1a1a2e" />
            </TouchableOpacity>
          </View>

          {/* Chat ScrollView */}
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
                      <Ionicons name="flame" size={16} color="#ffffff" style={styles.badgeIcon} />
                      <Text style={styles.streakBadgeText}>{item.text}</Text>
                    </View>
                  </View>
                );
              }

              const isAI = item.sender === 'ai';
              return (
                <View
                  key={item.id}
                  style={[
                    styles.messageRow,
                    isAI ? styles.messageRowLeft : styles.messageRowRight,
                  ]}
                >
                  {isAI && (
                    <View style={styles.aiAvatar}>
                      <MaterialCommunityIcons name="robot" size={22} color="#7c3aed" />
                    </View>
                  )}

                  <View
                    style={[
                      styles.bubble,
                      isAI ? styles.aiBubble : styles.userBubble,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        isAI ? styles.aiMessageText : styles.userMessageText,
                      ]}
                    >
                      {item.text}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Bottom Input Section */}
          <View style={styles.bottomSection}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Message..."
                placeholderTextColor="#6b7280"
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={handleSend}
              />

              <TouchableOpacity
                style={styles.micButton}
                onPress={handleMicPress}
                activeOpacity={0.7}
              >
                <Ionicons name="mic" size={22} color="#7c3aed" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.sendButton,
                  !inputText.trim() && styles.sendButtonDisabled,
                ]}
                onPress={handleSend}
                disabled={!inputText.trim()}
                activeOpacity={0.8}
              >
                <Ionicons name="send" size={18} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* Footer Text */}
            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>
                I AM NOT PERFECT. LET'S TRANSCEND CONSCIOUSNESS
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  keyboardContainer: {
    flex: 1,
  },
  // Floating Cloud Decorations
  cloud: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderRadius: 50,
  },
  cloud1: {
    width: 140,
    height: 50,
    top: 70,
    left: -30,
  },
  cloud2: {
    width: 180,
    height: 60,
    top: 130,
    right: -40,
  },
  cloud3: {
    width: 100,
    height: 40,
    top: 240,
    left: 20,
    opacity: 0.5,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0a0a1a',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#4b5563',
    marginTop: 1,
  },
  themeToggleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatScrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  chatContent: {
    paddingVertical: 16,
    gap: 14,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 4,
  },
  messageRowLeft: {
    justifyContent: 'flex-start',
  },
  messageRowRight: {
    justifyContent: 'flex-end',
  },
  aiAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f8ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  aiBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: '#7c3aed',
    borderBottomRightRadius: 4,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  aiMessageText: {
    color: '#1a1a2e',
  },
  userMessageText: {
    color: '#ffffff',
    fontWeight: '500',
  },
  streakBadgeContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00bcd4',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    shadowColor: '#00bcd4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeIcon: {
    marginRight: 6,
  },
  streakBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.4,
  },
  bottomSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 26,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  textInput: {
    flex: 1,
    height: 42,
    color: '#0a0a1a',
    fontSize: 15,
    paddingHorizontal: 6,
  },
  micButton: {
    padding: 8,
    marginRight: 4,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#a0a0b0',
    opacity: 0.6,
  },
  footerContainer: {
    marginTop: 10,
    marginBottom: 4,
    alignItems: 'center',
  },
  footerText: {
    color: '#4b5563',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.0,
    textAlign: 'center',
  },
});

export default AIChatLightScreen;
