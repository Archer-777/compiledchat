import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

const MessagesScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Team');
  const [deletedContactId, setDeletedContactId] = useState(null);

  const safeNavigate = (screenName) => {
    if (navigation && typeof navigation.navigate === 'function') {
      try {
        navigation.navigate(screenName);
      } catch (e) {
        Alert.alert('Navigation', `Navigating to ${screenName}`);
      }
    } else {
      Alert.alert('Navigation', `Navigating to ${screenName}`);
    }
  };

  const contactsData = [
    {
      id: '1',
      name: 'Leo Das',
      initials: 'LD',
      avatarBg: '#00bcd4',
      message: 'Hello, how are you?',
      time: '10:42 AM',
      unread: 2,
      isAI: false,
    },
    {
      id: '2',
      name: 'Adeline Palmerston',
      initials: 'AP',
      avatarBg: '#ec4899',
      message: 'Are we meeting for the review?',
      time: '09:15 AM',
      unread: 0,
      isAI: false,
      showDeleteSwipe: true,
      thankYouNote: 'Thank you ❤️',
    },
    {
      id: '3',
      name: 'Daniel Gallego',
      initials: 'DG',
      avatarBg: '#7c3aed',
      message: "Wow, that's amazing",
      time: 'Yesterday',
      unread: 0,
      isAI: false,
    },
    {
      id: '4',
      name: 'Juliana Silva',
      initials: 'JS',
      avatarBg: '#10b981',
      message: 'Nice works 👌',
      time: 'Yesterday',
      unread: 1,
      isAI: false,
    },
    {
      id: '5',
      name: 'Pedro Fernandes',
      initials: 'PF',
      avatarBg: '#d4a017',
      message: 'OK, see you tomorrow',
      time: 'Jul 25',
      unread: 0,
      isAI: false,
    },
    {
      id: '6',
      name: 'Spiritualise AI',
      initials: 'AI',
      avatarBg: '#00d4ff',
      message: 'I think you are overthinking... Yes!',
      time: 'Just now',
      unread: 3,
      isAI: true,
    },
  ];

  const handleDeleteContact = (id, name) => {
    Alert.alert('Delete Contact', `Are you sure you want to delete message with ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => setDeletedContactId(id),
      },
    ]);
  };

  const filteredContacts = contactsData.filter((item) => item.id !== deletedContactId);

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

        <Text style={styles.headerTitle}>Messages</Text>

        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={() => Alert.alert('Settings', 'Message Settings Opened')}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-outline" size={22} color="#1a1a2e" />
        </TouchableOpacity>
      </View>

      {/* Navigation Tabs */}
      <View style={styles.tabContainer}>
        {['Team', 'Projects', 'Wish'].map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, isActive && styles.activeTabButton]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>{tab}</Text>
              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Contact List */}
      <ScrollView
        style={styles.scrollList}
        contentContainerStyle={styles.scrollListContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredContacts.map((contact) => {
          return (
            <View key={contact.id} style={styles.contactWrapper}>
              <TouchableOpacity
                style={styles.contactCard}
                onPress={() => safeNavigate('Challenge')}
                activeOpacity={0.75}
              >
                {/* Circle Avatar */}
                <View style={styles.avatarContainer}>
                  {contact.isAI ? (
                    <LinearGradient
                      colors={['#00d4ff', '#7c3aed']}
                      style={styles.avatarGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <MaterialCommunityIcons name="sparkles" size={22} color="#ffffff" />
                    </LinearGradient>
                  ) : (
                    <View style={[styles.avatarCircle, { backgroundColor: contact.avatarBg }]}>
                      <Text style={styles.avatarInitials}>{contact.initials}</Text>
                    </View>
                  )}
                  {contact.isAI && <View style={styles.onlineBadge} />}
                </View>

                {/* Info Container */}
                <View style={styles.contactInfo}>
                  <View style={styles.contactHeaderRow}>
                    <Text style={styles.contactName} numberOfLines={1}>
                      {contact.name}
                    </Text>
                    <Text style={styles.contactTime}>{contact.time}</Text>
                  </View>

                  <View style={styles.messageRow}>
                    <Text
                      style={[styles.lastMessage, contact.isAI && styles.aiMessageText]}
                      numberOfLines={1}
                    >
                      {contact.message}
                    </Text>

                    {contact.unread > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>{contact.unread}</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Swipe Delete Button visual representation for Adeline Palmerston */}
                {contact.showDeleteSwipe && (
                  <TouchableOpacity
                    style={styles.deleteSwipeButton}
                    onPress={() => handleDeleteContact(contact.id, contact.name)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="trash-outline" size={16} color="#ffffff" />
                    <Text style={styles.deleteSwipeText}>Delete</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>

              {/* Thank you message pill under contact */}
              {contact.thankYouNote && (
                <View style={styles.thankYouContainer}>
                  <View style={styles.thankYouBubble}>
                    <MaterialCommunityIcons name="heart" size={16} color="#ef4444" />
                    <Text style={styles.thankYouText}>{contact.thankYouNote}</Text>
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
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
    justify: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a2e',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tabButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    position: 'relative',
  },
  activeTabButton: {},
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#00bcd4',
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 12,
    right: 12,
    height: 3,
    backgroundColor: '#00bcd4',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  scrollList: {
    flex: 1,
  },
  scrollListContent: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  contactWrapper: {
    marginBottom: 8,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 14,
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  contactInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  contactHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a2e',
    flex: 1,
    marginRight: 8,
  },
  contactTime: {
    fontSize: 12,
    color: '#a0a0b0',
    fontWeight: '500',
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
    marginRight: 8,
  },
  aiMessageText: {
    color: '#00bcd4',
    fontWeight: '600',
  },
  unreadBadge: {
    backgroundColor: '#00bcd4',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  deleteSwipeButton: {
    backgroundColor: '#ef4444',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginLeft: 6,
  },
  deleteSwipeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  thankYouContainer: {
    marginTop: 4,
    marginLeft: 64,
    flexDirection: 'row',
  },
  thankYouBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  thankYouText: {
    fontSize: 13,
    color: '#ef4444',
    fontWeight: '600',
    marginLeft: 6,
  },
  bottomBar: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 4,
  },
  bottomNavItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  activeNavPill: {
    backgroundColor: '#e0f7fa',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bottomNavLabel: {
    fontSize: 11,
    color: '#a0a0b0',
    marginTop: 2,
    fontWeight: '500',
  },
  activeNavLabel: {
    color: '#00bcd4',
    fontWeight: '700',
  },
});

export default MessagesScreen;
