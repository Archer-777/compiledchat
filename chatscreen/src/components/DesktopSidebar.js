import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Fonts } from '../theme/fonts';

export function DesktopSidebar({
  isDark = true,
  currentSlot,
  timeIcon,
  manualAurora,
  onToggleAurora,
  onCycleTimeSlot,
  onToggleTheme,
  onNewChat,
  onSelectHistoryItem,
}) {
  const historyItems = [
    { id: '1', title: 'Morning Alignment', time: 'Today' },
    { id: '2', title: 'Deep Focus & Clarity', time: 'Yesterday' },
    { id: '3', title: 'Cosmic Energy Check-in', time: '3 days ago' },
    { id: '4', title: 'Night Affirmations', time: '1 week ago' },
  ];

  const bgColor = '#000000';
  const borderColor = 'rgba(255, 255, 255, 0.12)';
  const textColor = '#ffffff';
  const subTextColor = 'rgba(255, 255, 255, 0.6)';
  const cardBg = 'rgba(255, 255, 255, 0.06)';

  return (
    <View style={[styles.sidebarContainer, { backgroundColor: bgColor, borderColor: borderColor }]}>
      {/* Brand Header */}
      <View style={styles.brandHeader}>
        <View style={styles.brandBadge}>
          <Image source={require('../../nextarcherlogo.jpeg')} style={styles.brandLogo} />
        </View>
        <View>
          <Text style={[styles.brandTitle, { color: textColor }]}>Next Archer</Text>
          <Text style={[styles.brandSubtitle, { color: subTextColor }]}>DESKTOP WORKSPACE</Text>
        </View>
      </View>

      {/* New Chat Button */}
      <TouchableOpacity
        style={[styles.newChatBtn, { backgroundColor: 'rgba(0, 212, 255, 0.18)', borderColor: 'rgba(0, 212, 255, 0.4)' }]}
        onPress={onNewChat}
        activeOpacity={0.7}
      >
        <Ionicons name="add-circle-outline" size={20} color="#00d4ff" />
        <Text style={[styles.newChatBtnText, { color: '#00d4ff' }]}>New Chat</Text>
      </TouchableOpacity>

      {/* Chat History Section */}
      <View style={styles.historySection}>
        <Text style={[styles.sectionTitle, { color: subTextColor }]}>RECENT CHATS</Text>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {historyItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.historyCard, { backgroundColor: cardBg }]}
              onPress={() => onSelectHistoryItem && onSelectHistoryItem(item)}
              activeOpacity={0.7}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={16} color={subTextColor} style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.historyTitle, { color: textColor }]} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={[styles.historyTime, { color: subTextColor }]}>{item.time}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>


      {/* User Profile Footer */}
      <View style={[styles.userProfileFooter, { borderTopColor: borderColor }]}>
        <View style={styles.userAvatarSmall}>
          <Ionicons name="person" size={16} color="#ffffff" />
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={[styles.userName, { color: textColor }]}>Archer User</Text>
          <Text style={[styles.userStatus, { color: subTextColor }]}>Pro Plan • Active</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebarContainer: {
    width: 260,
    height: '100%',
    backgroundColor: '#000000',
    borderRightWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 18,
    flexDirection: 'column',
    zIndex: 50,
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
    gap: 12,
  },
  brandBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  brandLogo: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  brandTitle: {
    fontFamily: Fonts.poppins,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  brandSubtitle: {
    fontFamily: Fonts.poppins,
    fontSize: 9.5,
    fontWeight: '600',
    letterSpacing: 1.4,
  },
  newChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
    marginBottom: 20,
  },
  newChatBtnText: {
    fontFamily: Fonts.inter,
    fontSize: 14,
    fontWeight: '600',
  },
  historySection: {
    flex: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: Fonts.poppins,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 8,
  },
  historyTitle: {
    fontFamily: Fonts.inter,
    fontSize: 13,
    fontWeight: '500',
  },
  historyTime: {
    fontFamily: Fonts.inter,
    fontSize: 10,
    marginTop: 2,
  },
  controlsSection: {
    borderTopWidth: 1,
    paddingTop: 14,
    marginBottom: 14,
    gap: 6,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  controlLabel: {
    fontFamily: Fonts.inter,
    fontSize: 13,
    fontWeight: '500',
  },
  userProfileFooter: {
    borderTopWidth: 1,
    paddingTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00d4ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontFamily: Fonts.inter,
    fontSize: 13,
    fontWeight: '600',
  },
  userStatus: {
    fontFamily: Fonts.inter,
    fontSize: 10,
  },
});
