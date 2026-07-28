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

const EmpowerCommunityScreen = ({ navigation }) => {
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (inputText.trim()) {
      Alert.alert('Message Sent', `Your message: "${inputText}" has been sent.`);
      setInputText('');
    } else {
      Alert.alert('Notice', 'Please type a message before sending.');
    }
  };

  const handlePhoneCall = () => {
    Alert.alert('Call Started', 'Connecting to your scheduled consultation session...');
  };

  const handleNavigateWish = () => {
    if (navigation?.navigate) {
      navigation.navigate('WishScreen');
    } else {
      Alert.alert('Wish Screen', 'Navigating to Wish Screen');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => (navigation?.goBack ? navigation.goBack() : Alert.alert('Back', 'Navigating back'))}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#1f2937" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Empower Community</Text>

        <View style={styles.headerRightGroup}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => Alert.alert('Settings', 'Community settings opened.')}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={22} color="#1f2937" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerIconBtn, { marginLeft: 6 }]}
            onPress={() => (navigation?.goBack ? navigation.goBack() : Alert.alert('Close', 'Closing screen'))}
            activeOpacity={0.7}
          >
            <Ionicons name="close-outline" size={26} color="#1f2937" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Premium Call Banner with Gold Crown Icon */}
      <View style={styles.bannerCard}>
        <MaterialCommunityIcons name="crown" size={22} color="#d4a017" style={{ marginRight: 10 }} />
        <Text style={styles.bannerText}>Premium call starts in one hour</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Wish Screen Navigation Button */}
        <TouchableOpacity
          style={styles.wishNavButton}
          onPress={handleNavigateWish}
          activeOpacity={0.8}
        >
          <View style={styles.wishNavLeft}>
            <MaterialCommunityIcons name="star-shooting" size={20} color="#7c3aed" />
            <Text style={styles.wishNavText}>View Community Wish Screen</Text>
          </View>
          <Ionicons name="arrow-forward" size={18} color="#7c3aed" />
        </TouchableOpacity>

        {/* Date Subheader & User Type Label */}
        <View style={styles.metaRow}>
          <Text style={styles.dateSubheader}>Today</Text>
          <View style={styles.userTypeBadge}>
            <Text style={styles.userTypePrefix}>User - </Text>
            <Text style={styles.userTypeBold}>Home Maker</Text>
          </View>
        </View>

        {/* Chat Conversation */}
        <View style={styles.chatContainer}>
          {/* User Message 1 */}
          <View style={styles.messageRowLeft}>
            <View style={styles.avatarCircleUser}>
              <Ionicons name="person" size={18} color="#4b5563" />
            </View>
            <View style={styles.bubbleUser}>
              <Text style={styles.bubbleUserText}>
                I know through app that I have suppressed anger, what should I do?
              </Text>
              <Text style={styles.timestampLeft}>10:45 AM</Text>
            </View>
          </View>

          {/* Section label: Psychologists in bold */}
          <View style={styles.sectionLabelContainer}>
            <MaterialIcons name="verified-user" size={16} color="#10b981" style={{ marginRight: 6 }} />
            <Text style={styles.sectionLabelBold}>Psychologists</Text>
          </View>

          {/* Psychologist response in coral/salmon bubble with avatar photo circle */}
          <View style={styles.messageRowRight}>
            <View style={styles.bubbleCoral}>
              <Text style={styles.bubbleCoralText}>Hey, Adeline</Text>
              <Text style={styles.timestampRight}>10:45 AM</Text>
            </View>
            <View style={styles.avatarCirclePsych}>
              <FontAwesome5 name="user-md" size={16} color="#ffffff" />
            </View>
          </View>

          {/* User: Sure, just give me a call in one hour in coral bubble */}
          <View style={styles.messageRowRight}>
            <View style={styles.bubbleCoral}>
              <Text style={styles.bubbleCoralText}>Sure, just give me a call in one hour</Text>
              <Text style={styles.timestampRight}>10:46 AM</Text>
            </View>
            <View style={styles.avatarCircleUserRight}>
              <Ionicons name="person" size={18} color="#ffffff" />
            </View>
          </View>

          {/* Thank you message with red heart emoji */}
          <View style={styles.messageRowLeft}>
            <View style={styles.avatarCircleUser}>
              <Ionicons name="person" size={18} color="#4b5563" />
            </View>
            <View style={styles.bubbleThankYou}>
              <Text style={styles.bubbleThankYouText}>Thank you so much! ❤️</Text>
              <Text style={styles.timestampLeft}>10:47 AM</Text>
            </View>
          </View>

          {/* AI footer: small AI icon + text */}
          <View style={styles.aiFooterCard}>
            <View style={styles.aiIconBadge}>
              <MaterialCommunityIcons name="robot-spark-outline" size={20} color="#00bcd4" />
            </View>
            <Text style={styles.aiFooterText}>
              I will assist in following the personal practise and tracking for session
            </Text>
          </View>
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
  headerRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerCard: {
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
  bannerText: {
    color: '#92400e',
    fontSize: 14,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  wishNavButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    borderWidth: 1,
    borderColor: '#7c3aed',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 14,
  },
  wishNavLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wishNavText: {
    color: '#7c3aed',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 12,
  },
  dateSubheader: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
  },
  userTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  userTypePrefix: {
    color: '#4b5563',
    fontSize: 13,
  },
  userTypeBold: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '800',
  },
  chatContainer: {
    marginTop: 8,
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
  avatarCircleUser: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarCircleUserRight: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ff6b6b',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  avatarCirclePsych: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ff6b6b',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
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
  sectionLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    paddingHorizontal: 4,
  },
  sectionLabelBold: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '800',
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
  bubbleThankYou: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 16,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  bubbleThankYouText: {
    color: '#1f2937',
    fontSize: 14,
    fontWeight: '600',
  },
  aiFooterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 188, 212, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 188, 212, 0.3)',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  aiIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  aiFooterText: {
    flex: 1,
    color: '#00bcd4',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
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

export default EmpowerCommunityScreen;
