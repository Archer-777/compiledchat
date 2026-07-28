import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
  FontAwesome5,
} from '@expo/vector-icons';

const WishScreen = ({ navigation }) => {
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (inputText.trim()) {
      Alert.alert('Message Sent', `Your message: "${inputText}" has been sent to the discussion.`);
      setInputText('');
    } else {
      Alert.alert('Notice', 'Please type a message before sending.');
    }
  };

  const handlePhoneCall = () => {
    Alert.alert('Live Consultation', 'Connecting to Nobel Laureate & AI advisory audio room...');
  };

  const handleFileDownload = () => {
    Alert.alert('Document Download', 'Opening "King Wind Turbine.pdf" (2.4 MB)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => (navigation?.goBack ? navigation.goBack() : Alert.alert('Back', 'Navigating back'))}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#1f2937" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Wish Screen</Text>

        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => Alert.alert('Wish Settings', 'Wish management options opened.')}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-outline" size={22} color="#1f2937" />
        </TouchableOpacity>
      </View>

      {/* Status Banner */}
      <View style={styles.statusBannerCard}>
        <MaterialCommunityIcons name="crown" size={22} color="#d4a017" style={{ marginRight: 10 }} />
        <Text style={styles.statusBannerText}>Premium chat starts in ten minutes</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Info Header */}
        <View style={styles.userInfoCard}>
          <Text style={styles.userInfoSubheader}>Supported User Today</Text>
          <View style={styles.userTypeBadge}>
            <Text style={styles.userTypePrefix}>User - </Text>
            <Text style={styles.userTypeBold}>Boy from LMIC</Text>
          </View>
        </View>

        {/* Chat Conversation Area */}
        <View style={styles.chatContainer}>
          {/* Message 1: Boy from LMIC */}
          <View style={styles.messageRowLeft}>
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarCircleUser}>
                <FontAwesome5 name="user-alt" size={16} color="#ffffff" />
              </View>
              <View style={styles.onlineDot} />
            </View>
            <View style={styles.bubbleUser}>
              <Text style={styles.bubbleUserText}>
                Hi, I want to run a wind turbine in my village that helps us farm better
              </Text>
              <Text style={styles.timestampLeft}>10:45 AM</Text>
            </View>
          </View>

          {/* Invited Users Label + Nobel Laureate in bold */}
          <View style={styles.invitedSectionRow}>
            <MaterialIcons name="stars" size={18} color="#d4a017" style={{ marginRight: 6 }} />
            <Text style={styles.invitedLabel}>Invited Users: </Text>
            <Text style={styles.invitedBold}>Nobel Laureate</Text>
          </View>

          {/* Message 2: Nobel Laureate (Hey, king) */}
          <View style={styles.messageRowRight}>
            <View style={styles.bubbleSalmon}>
              <Text style={styles.bubbleSalmonText}>Hey, king</Text>
            </View>
            <View style={styles.avatarCircleNobel}>
              <FontAwesome5 name="award" size={16} color="#ffffff" />
            </View>
          </View>

          {/* Message 3: Nobel Laureate (Can you send me some details) */}
          <View style={styles.messageRowRight}>
            <View style={styles.bubbleCoral}>
              <Text style={styles.bubbleCoralText}>Can you send me some details</Text>
              <Text style={styles.timestampRight}>10:46 AM</Text>
            </View>
            <View style={styles.avatarCircleNobel}>
              <FontAwesome5 name="award" size={16} color="#ffffff" />
            </View>
          </View>

          {/* Message 4: File Attachment Card */}
          <View style={styles.messageRowLeft}>
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarCircleUser}>
                <FontAwesome5 name="user-alt" size={16} color="#ffffff" />
              </View>
              <View style={styles.onlineDot} />
            </View>
            <View style={{ flex: 1 }}>
              <TouchableOpacity
                style={styles.fileCard}
                onPress={handleFileDownload}
                activeOpacity={0.8}
              >
                <View style={styles.fileIconContainer}>
                  <MaterialCommunityIcons name="file-pdf-box" size={32} color="#ef4444" />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.fileNameText}>King Wind Turbine.pdf</Text>
                  <Text style={styles.fileSizeText}>PDF Document • 2.4 MB</Text>
                </View>
                <Ionicons name="download-outline" size={20} color="#7c3aed" />
              </TouchableOpacity>
              <Text style={styles.timestampLeft}>10:47 AM</Text>
            </View>
          </View>

          {/* Message 5: AI Clarification Message */}
          <View style={styles.messageRowLeft}>
            <View style={styles.avatarCircleAi}>
              <MaterialCommunityIcons name="robot-spark-outline" size={18} color="#ffffff" />
            </View>
            <View style={styles.bubbleAi}>
              <Text style={styles.bubbleAiText}>
                Hi King, you are doing amazing, Noble has asked me to clarify a few things with you.
              </Text>
              <Text style={styles.timestampLeft}>11:47 AM</Text>
            </View>
          </View>
        </View>

        {/* Footer Text */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            CONFIDENTIAL. 2024 Next Archer &gt;&gt;&lt;/&gt;
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Input Area */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          placeholder="Write your message here"
          placeholderTextColor="#9ca3af"
          value={inputText}
          onChangeText={setInputText}
        />
        <TouchableOpacity style={styles.phoneBtn} onPress={handlePhoneCall} activeOpacity={0.7}>
          <Ionicons name="call" size={20} color="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend} activeOpacity={0.7}>
          <Ionicons name="send" size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  headerIconBtn: {
    padding: 4,
  },
  headerTitle: {
    color: '#1f2937',
    fontSize: 18,
    fontWeight: '700',
  },
  statusBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
  },
  statusBannerText: {
    color: '#92400e',
    fontSize: 14,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  userInfoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfoSubheader: {
    color: '#6b7280',
    fontSize: 13,
    fontWeight: '600',
  },
  userTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  userTypePrefix: {
    color: '#4b5563',
    fontSize: 13,
  },
  userTypeBold: {
    color: '#7c3aed',
    fontSize: 13,
    fontWeight: '800',
  },
  chatContainer: {
    marginTop: 16,
  },
  messageRowLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  messageRowRight: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  avatarCircleUser: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00d4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10b981',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  avatarCircleNobel: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#d4a017',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  avatarCircleAi: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#7c3aed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  bubbleUser: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 16,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  bubbleUserText: {
    color: '#1f2937',
    fontSize: 14,
    lineHeight: 20,
  },
  timestampLeft: {
    color: '#9ca3af',
    fontSize: 10,
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  timestampRight: {
    color: '#7f1d1d',
    fontSize: 10,
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  invitedSectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    paddingHorizontal: 4,
  },
  invitedLabel: {
    color: '#4b5563',
    fontSize: 14,
    fontWeight: '600',
  },
  invitedBold: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '800',
  },
  bubbleSalmon: {
    maxWidth: '80%',
    backgroundColor: '#f5d5c8',
    borderColor: '#ff6b6b',
    borderWidth: 1,
    padding: 12,
    borderRadius: 16,
    borderTopRightRadius: 4,
  },
  bubbleSalmonText: {
    color: '#7f1d1d',
    fontSize: 14,
    fontWeight: '600',
  },
  bubbleCoral: {
    maxWidth: '80%',
    backgroundColor: '#f5d5c8',
    borderColor: '#ff6b6b',
    borderWidth: 1,
    padding: 14,
    borderRadius: 16,
    borderTopRightRadius: 4,
  },
  bubbleCoralText: {
    color: '#7f1d1d',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
  },
  fileIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileNameText: {
    color: '#1f2937',
    fontSize: 14,
    fontWeight: '700',
  },
  fileSizeText: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 2,
  },
  bubbleAi: {
    flex: 1,
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
    padding: 14,
    borderRadius: 16,
    borderTopLeftRadius: 4,
  },
  bubbleAiText: {
    color: '#4c1d95',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  footerContainer: {
    marginTop: 24,
    marginBottom: 12,
    alignItems: 'center',
  },
  footerText: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#1f2937',
    fontSize: 14,
    marginRight: 8,
  },
  phoneBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7c3aed',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default WishScreen;
