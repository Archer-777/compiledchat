import React, { useState, useEffect } from 'react';
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
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

const ChallengeScreen = ({ navigation }) => {
  const [secondsLeft, setSecondsLeft] = useState(3 * 86400 + 22 * 3600 + 29 * 60 + 57);
  const [messageInput, setMessageInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      id: '1',
      sender: 'user',
      text: 'Im working on new design',
      time: '0:01 AM',
      hasImage: false,
    },
    {
      id: '2',
      sender: 'user',
      text: 'What you think SA?',
      time: '0:02 AM',
      hasImage: true,
    },
    {
      id: '3',
      sender: 'ai',
      text: "Wonderful, but time is running out. Maybe Alex can help. I'll follow up with him. Give me 10 minutes.",
      time: '0:03 AM',
      hasImage: false,
    },
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = () => {
    const days = Math.floor(secondsLeft / (3600 * 24));
    const hours = Math.floor((secondsLeft % (3600 * 24)) / 3600);
    const mins = Math.floor((secondsLeft % 3600) / 60);
    const secs = secondsLeft % 60;

    const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
    return {
      days: pad(days),
      hours: pad(hours),
      mins: pad(mins),
      secs: pad(secs),
    };
  };

  const timerValues = formatTimer();

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    const newMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: messageInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      hasImage: false,
    };
    setChatMessages((prev) => [...prev, newMsg]);
    setMessageInput('');

    // Simulate AI response
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: "I'm analyzing your update. Everything looks on track for the challenge goal!",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          hasImage: false,
        },
      ]);
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={() => (navigation?.goBack ? navigation.goBack() : Alert.alert('Back', 'Navigating back'))}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={26} color="#1a1a2e" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Challenge</Text>

        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={() => Alert.alert('Settings', 'Challenge Settings Opened')}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-outline" size={22} color="#1a1a2e" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Countdown Timer Section */}
          <View style={styles.timerCard}>
            <Text style={styles.timerCardTitle}>TIME REMAINING</Text>

            {/* Timer Digits Row */}
            <View style={styles.timerRow}>
              <View style={styles.timerBox}>
                <Text style={styles.timerDigit}>{timerValues.days}</Text>
                <Text style={styles.timerLabel}>DAYS</Text>
              </View>

              <Text style={styles.timerColon}>:</Text>

              <View style={styles.timerBox}>
                <Text style={styles.timerDigit}>{timerValues.hours}</Text>
                <Text style={styles.timerLabel}>HRS</Text>
              </View>

              <Text style={styles.timerColon}>:</Text>

              <View style={styles.timerBox}>
                <Text style={styles.timerDigit}>{timerValues.mins}</Text>
                <Text style={styles.timerLabel}>MIN</Text>
              </View>

              <Text style={styles.timerColon}>:</Text>

              <View style={styles.timerBox}>
                <Text style={styles.timerDigit}>{timerValues.secs}</Text>
                <Text style={styles.timerLabel}>SEC</Text>
              </View>
            </View>
          </View>

          {/* Team Info Section */}
          <View style={styles.teamSection}>
            <View style={styles.teamHeaderRow}>
              <View>
                <Text style={styles.teamName}>Purple Soda</Text>
                <Text style={styles.teamMembersCount}>7 Members</Text>
              </View>

              {/* Avatar Stack + +4 Badge */}
              <View style={styles.avatarStackRow}>
                {['#7c3aed', '#ec4899', '#00bcd4', '#f0c040'].map((color, index) => (
                  <View
                    key={index}
                    style={[
                      styles.memberAvatarCircle,
                      { backgroundColor: color, marginLeft: index === 0 ? 0 : -10 },
                    ]}
                  >
                    <FontAwesome5 name="user" size={12} color="#ffffff" />
                  </View>
                ))}
                <View style={[styles.memberAvatarCircle, styles.badgeCircle, { marginLeft: -10 }]}>
                  <Text style={styles.badgeText}>+4</Text>
                </View>
              </View>
            </View>
            <View style={styles.tealDotIndicator} />
          </View>

          {/* Chat Messages */}
          <View style={styles.chatArea}>
            {chatMessages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <View
                  key={msg.id}
                  style={[
                    styles.messageRowContainer,
                    isUser ? styles.userRowRight : styles.aiRowLeft,
                  ]}
                >
                  {!isUser && (
                    <LinearGradient
                      colors={['#00d4ff', '#7c3aed']}
                      style={styles.aiAvatarIcon}
                    >
                      <MaterialCommunityIcons name="robot" size={18} color="#ffffff" />
                    </LinearGradient>
                  )}

                  <View
                    style={[
                      styles.messageBubble,
                      isUser ? styles.userBubble : styles.aiBubble,
                    ]}
                  >
                    {/* Image placeholder inside second user message */}
                    {msg.hasImage && (
                      <View style={styles.imagePlaceholderCard}>
                        <LinearGradient
                          colors={['#ff6b6b', '#f5d5c8', '#f0c040']}
                          style={styles.imagePlaceholderGradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        >
                          <MaterialCommunityIcons name="palette" size={32} color="#ffffff" />
                          <Text style={styles.imagePlaceholderText}>Design Pattern Preview</Text>
                        </LinearGradient>
                      </View>
                    )}

                    <Text style={[styles.messageText, isUser ? styles.userMsgText : styles.aiMsgText]}>
                      {msg.text}
                    </Text>

                    <Text style={[styles.messageTimeText, isUser ? styles.userTime : styles.aiTime]}>
                      {msg.time}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.bottomInputBar}>
          <TouchableOpacity
            style={styles.aiButtonLeft}
            onPress={() => Alert.alert('Spiritualise AI', 'AI Assistant Ready')}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#00d4ff', '#7c3aed']}
              style={styles.aiButtonGradient}
            >
              <MaterialCommunityIcons name="sparkles" size={18} color="#ffffff" />
            </LinearGradient>
          </TouchableOpacity>

          <TextInput
            style={styles.textInput}
            placeholder="Write your message here"
            placeholderTextColor="#9ca3af"
            value={messageInput}
            onChangeText={setMessageInput}
          />

          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendMessage}
            activeOpacity={0.7}
          >
            <Ionicons name="send" size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Footer Notice */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>CONFIDENTIAL. 2024 Next Archer &gt;&gt;&lt;/&gt;</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 20 : 0,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f5',
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  timerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  timerCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerBox: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    width: 62,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  timerDigit: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
  },
  timerLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#e6f4ea',
    marginTop: 2,
  },
  timerColon: {
    fontSize: 24,
    fontWeight: '800',
    color: '#10b981',
    marginHorizontal: 6,
  },
  teamSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  teamHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  teamMembersCount: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
    fontWeight: '500',
  },
  avatarStackRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  badgeCircle: {
    backgroundColor: '#00bcd4',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  tealDotIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00bcd4',
    marginTop: 10,
  },
  chatArea: {
    flex: 1,
    paddingVertical: 8,
  },
  messageRowContainer: {
    flexDirection: 'row',
    marginBottom: 14,
    alignItems: 'flex-end',
  },
  userRowRight: {
    justifyContent: 'flex-end',
  },
  aiRowLeft: {
    justifyContent: 'flex-start',
  },
  aiAvatarIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justify: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 4,
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userBubble: {
    backgroundColor: '#e0f2fe',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userMsgText: {
    color: '#0369a1',
  },
  aiMsgText: {
    color: '#1e293b',
  },
  messageTimeText: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  userTime: {
    color: '#0284c7',
  },
  aiTime: {
    color: '#94a3b8',
  },
  imagePlaceholderCard: {
    width: 180,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  imagePlaceholderGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  imagePlaceholderText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
    textAlign: 'center',
  },
  bottomInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  aiButtonLeft: {
    marginRight: 8,
  },
  aiButtonGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    color: '#1f2937',
    marginRight: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00bcd4',
    justify: 'center',
    alignItems: 'center',
  },
  footerContainer: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 6,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  footerText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.8,
  },
});

export default ChallengeScreen;
