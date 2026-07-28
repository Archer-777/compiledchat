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

// Generate static star positions for the night sky effect
const STARS = Array.from({ length: 28 }).map((_, index) => ({
  id: index,
  top: (index * 27) % 550 + 10,
  left: (index * 47) % 360 + 10,
  size: index % 3 === 0 ? 3 : 2,
  opacity: 0.3 + (index % 5) * 0.15,
}));

const AIChatDarkScreen = ({ navigation }) => {
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

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: 'Consciousness expanded. Deep calm initialized in dark mode...',
        },
      ]);
    }, 1000);
  };

  const handleMicPress = () => {
    Alert.alert('Voice Input', 'Listening in ambient dark mode...');
  };

  const handleGoBack = () => {
    if (navigation && navigation.goBack) {
      navigation.goBack();
    } else if (navigation && navigation.navigate) {
      navigation.navigate('SuperchargeScreen');
    }
  };

  const handleSwitchToLight = () => {
    if (navigation && navigation.navigate) {
      navigation.navigate('AIChatLight');
    } else {
      Alert.alert('Theme Switch', 'Navigating to Light Sky Theme');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a1a" />

      {/* Aurora Borealis Glow Effects */}
      <View style={styles.auroraContainer} pointerEvents="none">
        <LinearGradient
          colors={['rgba(0, 212, 255, 0.25)', 'rgba(124, 58, 237, 0.2)', 'transparent']}
          style={styles.auroraTop}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <LinearGradient
          colors={['rgba(0, 188, 212, 0.2)', 'rgba(236, 72, 153, 0.15)', 'transparent']}
          style={styles.auroraRight}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </View>

      {/* Night Sky Stars */}
      <View style={styles.starsContainer} pointerEvents="none">
        {STARS.map((star) => (
          <View
            key={star.id}
            style={[
              styles.star,
              {
                top: star.top,
                left: star.left,
                width: star.size,
                height: star.size,
                borderRadius: star.size / 2,
                opacity: star.opacity,
              },
            ]}
          />
        ))}
      </View>

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardContainer}
        >
          {/* Header */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleGoBack}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>

            <View style={styles.titleContainer}>
              <Text style={styles.headerTitle}>Hey Neha 🌙</Text>
              <Text style={styles.headerSubtitle}>Night Calm Mode</Text>
            </View>

            <TouchableOpacity
              style={styles.themeToggleBtn}
              onPress={handleSwitchToLight}
              activeOpacity={0.7}
            >
              <Ionicons name="sunny-outline" size={22} color="#00d4ff" />
            </TouchableOpacity>
          </View>

          {/* Main Chat Scroll */}
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
                      <Ionicons name="sparkles" size={15} color="#0a0a1a" style={styles.badgeIcon} />
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
                      <MaterialCommunityIcons name="robot" size={22} color="#00d4ff" />
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

            {/* Visual Awareness & Relaxation Description Callout */}
            <View style={styles.descriptionCard}>
              <View style={styles.descHeader}>
                <Ionicons name="time-outline" size={18} color="#00d4ff" style={{ marginRight: 6 }} />
                <Text style={styles.descTitle}>DIGITAL WELLBEING & AWARENESS</Text>
              </View>
              <Text style={styles.descriptionText}>
                This effect will make the user aware of their digital time spent and enhance the visual appeal for relaxation during interactions on stressful topics after 3 minutes of chat
              </Text>
            </View>
          </ScrollView>

          {/* Bottom Message Input Bar */}
          <View style={styles.bottomSection}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Message..."
                placeholderTextColor="#a0a0b0"
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={handleSend}
              />

              <TouchableOpacity
                style={styles.micButton}
                onPress={handleMicPress}
                activeOpacity={0.7}
              >
                <Ionicons name="mic" size={22} color="#00d4ff" />
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
                <Ionicons name="send" size={18} color="#0a0a1a" />
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

      {/* Floating Button to Switch to Light Theme */}
      <TouchableOpacity
        style={styles.floatingLightBtn}
        onPress={handleSwitchToLight}
        activeOpacity={0.85}
      >
        <Ionicons name="sunny" size={22} color="#0a0a1a" />
        <Text style={styles.floatingLightText}>Light Mode</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  auroraContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 320,
    zIndex: 0,
  },
  auroraTop: {
    position: 'absolute',
    top: -50,
    left: -50,
    width: 300,
    height: 260,
    borderRadius: 130,
    transform: [{ rotate: '-25deg' }],
  },
  auroraRight: {
    position: 'absolute',
    top: 20,
    right: -60,
    width: 280,
    height: 280,
    borderRadius: 140,
    transform: [{ rotate: '15deg' }],
  },
  starsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#ffffff',
  },
  safeArea: {
    flex: 1,
    zIndex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  keyboardContainer: {
    flex: 1,
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
    backgroundColor: 'rgba(26, 26, 46, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  titleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#a0a0b0',
    marginTop: 1,
  },
  themeToggleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(26, 26, 46, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.3)',
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
    backgroundColor: '#12121f',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: '#00d4ff',
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 3,
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  aiBubble: {
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#00d4ff',
    borderBottomLeftRadius: 4,
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  userBubble: {
    backgroundColor: '#7c3aed',
    borderBottomRightRadius: 4,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  aiMessageText: {
    color: '#ffffff',
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
    backgroundColor: '#00d4ff',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  badgeIcon: {
    marginRight: 6,
  },
  streakBadgeText: {
    color: '#0a0a1a',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.4,
  },
  descriptionCard: {
    backgroundColor: 'rgba(26, 26, 46, 0.85)',
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.3)',
  },
  descHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  descTitle: {
    color: '#00d4ff',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.8,
  },
  descriptionText: {
    color: '#a0a0b0',
    fontSize: 12,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  bottomSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 26,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.4)',
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  textInput: {
    flex: 1,
    height: 42,
    color: '#ffffff',
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
    backgroundColor: '#00d4ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#12121f',
    opacity: 0.5,
  },
  footerContainer: {
    marginTop: 10,
    marginBottom: 4,
    alignItems: 'center',
  },
  footerText: {
    color: '#6b7280',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.0,
    textAlign: 'center',
  },
  floatingLightBtn: {
    position: 'absolute',
    right: 20,
    bottom: 85,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0c040',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: '#f0c040',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 6,
    zIndex: 10,
  },
  floatingLightText: {
    color: '#0a0a1a',
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 6,
  },
});

export default AIChatDarkScreen;
