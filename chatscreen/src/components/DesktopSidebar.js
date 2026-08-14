import React, { useState, useEffect } from 'react';
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

import { getChatSessions } from '../utils/storage';
import { getMainAppUrl } from '../config/urls';

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
  historyItems = [],
}) {
  const [userName, setUserName] = useState('Archer');
  const [isRegistered, setIsRegistered] = useState(false);
  const [localHistoryItems, setLocalHistoryItems] = useState([]);

  const loadSessions = async () => {
    try {
      const sessions = await getChatSessions(null, 'spiritual');
      if (Array.isArray(sessions)) {
        setLocalHistoryItems(sessions);
      }
    } catch (e) {}
  };

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const activeAuth = window.localStorage.getItem('@active_auth_session');
        if (activeAuth) {
          const parsed = JSON.parse(activeAuth);
          if (parsed && parsed.email) {
            const name = parsed.firstName || parsed.first_name || (parsed.full_name ? parsed.full_name.split(' ')[0] : '');
            if (name) {
              setUserName(name.trim());
              setIsRegistered(true);
            }
          }
        }
      }
    } catch (e) {}

    loadSessions();

    if (typeof window !== 'undefined') {
      window.addEventListener('chat-sessions-changed', loadSessions);
      return () => window.removeEventListener('chat-sessions-changed', loadSessions);
    }
  }, []);

  const displayHistory = localHistoryItems.length > 0 ? localHistoryItems : (historyItems || []);

  const handleProfileClick = () => {
    if (typeof window !== 'undefined') {
      window.location.href = getMainAppUrl('/soul-matrix');
    }
  };

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
          <Image source={require('../../assets/logo_in_white.svg')} resizeMode="contain" style={styles.brandLogo} />
        </View>
        <View>
          <Text style={[styles.brandTitle, { color: textColor }]}>Next Archer</Text>
          <Text style={[styles.brandSubtitle, { color: subTextColor }]}>DESKTOP WORKSPACE</Text>
        </View>
      </View>

      {/* New Chat Button */}
      <TouchableOpacity
        style={[styles.newChatBtn, { backgroundColor: 'rgba(0, 212, 255, 0.18)', borderColor: 'rgba(0, 212, 255, 0.4)', marginBottom: 8 }]}
        onPress={onNewChat}
        activeOpacity={0.7}
      >
        <Ionicons name="add-circle-outline" size={20} color="#00d4ff" />
        <Text style={[styles.newChatBtnText, { color: '#00d4ff' }]}>New Chat</Text>
      </TouchableOpacity>

      {/* Twin Chat Button */}
      <TouchableOpacity
        style={[styles.newChatBtn, { backgroundColor: 'rgba(168, 85, 247, 0.18)', borderColor: 'rgba(168, 85, 247, 0.4)', marginBottom: 20 }]}
        onPress={() => {
          if (typeof window !== 'undefined') {
            window.location.href = getMainAppUrl('/twin-chat');
          }
        }}
        activeOpacity={0.7}
      >
        <Ionicons name="hardware-chip-outline" size={20} color="#a855f7" />
        <Text style={[styles.newChatBtnText, { color: '#a855f7' }]}>Chat-TWIN</Text>
      </TouchableOpacity>

      {/* Chat History Section */}
      <View style={styles.historySection}>
        <Text style={[styles.sectionTitle, { color: subTextColor }]}>RECENT CHATS</Text>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {displayHistory.length > 0 ? (
            displayHistory.map((item) => (
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
            ))
          ) : (
            <View style={{ paddingVertical: 16, paddingHorizontal: 4 }}>
              <Text style={{ fontFamily: Fonts.inter, fontSize: 12, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
                No past sessions saved.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* User Profile Footer (Only for Registered Users) */}
      {isRegistered && (
        <TouchableOpacity
          style={[styles.userProfileFooter, { borderTopColor: borderColor }]}
          onPress={handleProfileClick}
          activeOpacity={0.7}
        >
          <View style={[styles.userAvatarSmall, { overflow: 'hidden', backgroundColor: 'transparent', borderWidth: 0, padding: 0 }]}>
            <Image
              source={require('../../assets/user_icon.svg')}
              style={{ width: 32, height: 32, borderRadius: 16 }}
              resizeMode="cover"
            />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={[styles.userName, { color: textColor }]}>{userName}</Text>
            <Text style={[styles.userStatus, { color: subTextColor }]}>Registered User • Active</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={14} color={subTextColor} />
        </TouchableOpacity>
      )}
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
