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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

const UtopiaScreen = ({ navigation }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(42);

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

  const handleToggleLike = () => {
    if (isLiked) {
      setIsLiked(false);
      setLikeCount((prev) => prev - 1);
    } else {
      setIsLiked(true);
      setLikeCount((prev) => prev + 1);
    }
  };

  const projectSuggestions = [
    { id: '1', name: 'Alex', color: '#7c3aed', initials: 'AX' },
    { id: '2', name: 'Sarah', color: '#ec4899', initials: 'SR' },
    { id: '3', name: 'David', color: '#00bcd4', initials: 'DV' },
    { id: '4', name: 'Elena', color: '#10b981', initials: 'EL' },
    { id: '5', name: 'Kobe', color: '#d4a017', initials: 'KB' },
    { id: '6', name: 'Maya', color: '#ff6b6b', initials: 'MY' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      {/* Header Top Area */}
      <View style={styles.headerArea}>
        <View style={styles.headerTopRow}>
          <Text style={styles.headerLabelTag}>Utopia Screen</Text>
          <TouchableOpacity
            onPress={() => Alert.alert('Utopia', 'Utopia Info & Filters')}
            activeOpacity={0.7}
          >
            <Ionicons name="options-outline" size={22} color="#1a1a2e" />
          </TouchableOpacity>
        </View>

        <Text style={styles.mainTitle}>Auto- Selected Scroll Like Shorts</Text>
        <Text style={styles.subtitle}>A 5-minute Scroll For Free User</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Horizontal Suggestions Row */}
        <View style={styles.suggestionsContainer}>
          <Text style={styles.sectionTitle}>Suggestions for Project</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionsHorizontalList}
          >
            {projectSuggestions.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.suggestionItem}
                onPress={() => safeNavigate('Challenge')}
                activeOpacity={0.8}
              >
                <View style={[styles.suggestionAvatar, { backgroundColor: item.color }]}>
                  <Text style={styles.suggestionInitials}>{item.initials}</Text>
                  <View style={styles.smallGreenDot} />
                </View>
                <Text style={styles.suggestionName} numberOfLines={1}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Post Card */}
        <View style={styles.featuredCard}>
          {/* Featured User Header */}
          <View style={styles.featuredCardHeader}>
            <View style={styles.userInfoLeft}>
              <View style={styles.michelleAvatarWrapper}>
                <View style={styles.michelleAvatarCircle}>
                  <Text style={styles.avatarInitialsText}>M</Text>
                </View>
                {/* Green Dot (Online Status) */}
                <View style={styles.greenOnlineDot} />
                {/* Red Notification Dot */}
                <View style={styles.redNotifDot} />
              </View>

              <View style={styles.userTitleCol}>
                <Text style={styles.featuredUserName}>Michelle</Text>
                <View style={styles.topProjectLabelTag}>
                  <Text style={styles.topProjectLabelText}>Top Project Name</Text>
                </View>
              </View>
            </View>

            {/* Header Right Action Icons */}
            <View style={styles.cardHeaderRightIcons}>
              <TouchableOpacity
                style={styles.cardHeaderIconButton}
                onPress={() => Alert.alert('Grid View', 'Grid view option toggled')}
                activeOpacity={0.7}
              >
                <Ionicons name="grid-outline" size={18} color="#6b7280" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cardHeaderIconButton}
                onPress={handleToggleLike}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isLiked ? 'heart' : 'heart-outline'}
                  size={20}
                  color={isLiked ? '#ef4444' : '#6b7280'}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cardHeaderIconButton}
                onPress={() => Alert.alert('Options', 'Post options menu')}
                activeOpacity={0.7}
              >
                <Ionicons name="ellipsis-vertical" size={18} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Large Image Area (Dark Teal/Ocean themed placeholder view 200px tall) */}
          <View style={styles.oceanPlaceholderArea}>
            <LinearGradient
              colors={['#0a1a2a', '#00bcd4', '#1a1a2e']}
              style={styles.oceanGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialCommunityIcons name="waves" size={54} color="rgba(255,255,255,0.7)" />
              <Text style={styles.oceanTitle}>Oceanic Hope Initiative</Text>
              <Text style={styles.oceanSubtitle}>Community Impact Project</Text>
              <View style={styles.oceanBadge}>
                <Ionicons name="earth" size={12} color="#ffffff" style={{ marginRight: 4 }} />
                <Text style={styles.oceanBadgeText}>Utopia Global</Text>
              </View>
            </LinearGradient>
          </View>

          {/* Post Text */}
          <Text style={styles.postBodyText}>
            Today I created a fun application with South African Boy and it's has changed 3 people's lives...
          </Text>

          {/* Engagement Line */}
          <View style={styles.engagementRow}>
            <View style={styles.engagementMeta}>
              <Ionicons name="time-outline" size={14} color="#9ca3af" />
              <Text style={styles.metaText}>2m ago</Text>

              <Text style={styles.metaDot}>•</Text>

              <Ionicons name="people-outline" size={14} color="#9ca3af" />
              <Text style={styles.metaText}>with Avery Davis</Text>

              <Text style={styles.metaDot}>•</Text>

              <Ionicons name="location-outline" size={14} color="#9ca3af" />
              <Text style={styles.metaText}>at Shanghai</Text>
            </View>
          </View>

          {/* Collaborate, Connect or Help Link in Coral */}
          <View style={styles.collaborateContainer}>
            <TouchableOpacity
              style={styles.collaborateLink}
              onPress={() => safeNavigate('Challenge')}
              activeOpacity={0.8}
            >
              <Text style={styles.collaborateText}>Collaborate, Connect or Help</Text>

              <View style={styles.applyNowBadge}>
                <Text style={styles.applyNowText}>APPLY NOW</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* User Section Below: Taylor Star */}
          <View style={styles.taylorUserSection}>
            <View style={styles.taylorAvatarWrapper}>
              <View style={styles.taylorAvatarCircle}>
                <Text style={styles.avatarInitialsText}>TS</Text>
              </View>
              <View style={styles.taylorNotifDot} />
            </View>

            <View style={styles.taylorInfoCol}>
              <View style={styles.taylorNameRow}>
                <Text style={styles.taylorName}>Taylor Star</Text>
                <Ionicons name="flag-outline" size={14} color="#ff6b6b" style={{ marginLeft: 6 }} />
              </View>
              <Text style={styles.taylorSubtitle}>Houdini</Text>
            </View>

            <TouchableOpacity
              style={styles.connectButton}
              onPress={() => safeNavigate('MessagesScreen')}
              activeOpacity={0.8}
            >
              <Ionicons name="person-add" size={14} color="#00bcd4" style={{ marginRight: 4 }} />
              <Text style={styles.connectButtonText}>Connect</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  headerArea: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f5',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerLabelTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00bcd4',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a2e',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  suggestionsContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 10,
  },
  suggestionsHorizontalList: {
    paddingRight: 10,
  },
  suggestionItem: {
    alignItems: 'center',
    marginRight: 14,
    width: 60,
  },
  suggestionAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justify: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 4,
  },
  suggestionInitials: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  smallGreenDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10b981',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  suggestionName: {
    fontSize: 11,
    color: '#4b5563',
    fontWeight: '600',
    textAlign: 'center',
  },
  featuredCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  featuredCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  michelleAvatarWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  michelleAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ec4899',
    justify: 'center',
    alignItems: 'center',
  },
  avatarInitialsText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  greenOnlineDot: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: '#10b981',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  redNotifDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: '#ef4444',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  userTitleCol: {
    justify: 'center',
  },
  featuredUserName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  topProjectLabelTag: {
    backgroundColor: '#e0f7fa',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 2,
    alignSelf: 'flex-start',
  },
  topProjectLabelText: {
    fontSize: 10,
    color: '#00bcd4',
    fontWeight: '700',
  },
  cardHeaderRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardHeaderIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justify: 'center',
    alignItems: 'center',
  },
  oceanPlaceholderArea: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
  },
  oceanGradient: {
    flex: 1,
    justify: 'center',
    alignItems: 'center',
    padding: 16,
  },
  oceanTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 8,
    textAlign: 'center',
  },
  oceanSubtitle: {
    color: '#e0f7fa',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  oceanBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 10,
  },
  oceanBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  postBodyText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 12,
    fontWeight: '500',
  },
  engagementRow: {
    marginBottom: 14,
  },
  engagementMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  metaDot: {
    fontSize: 12,
    color: '#9ca3af',
    marginHorizontal: 6,
  },
  collaborateContainer: {
    backgroundColor: '#fff5f5',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#fed7d7',
    marginBottom: 16,
  },
  collaborateLink: {
    flexDirection: 'row',
    justify: 'space-between',
    alignItems: 'center',
  },
  collaborateText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ff6b6b',
    flex: 1,
  },
  applyNowBadge: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  applyNowText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  taylorUserSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f5',
  },
  taylorAvatarWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  taylorAvatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#7c3aed',
    justify: 'center',
    alignItems: 'center',
  },
  taylorNotifDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ef4444',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  taylorInfoCol: {
    flex: 1,
  },
  taylorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taylorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  taylorSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f7fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  connectButtonText: {
    fontSize: 12,
    color: '#00bcd4',
    fontWeight: '700',
  },
  bottomBar: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    justify: 'space-around',
    alignItems: 'center',
    paddingBottom: 4,
  },
  bottomNavItem: {
    alignItems: 'center',
    justify: 'center',
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

export default UtopiaScreen;
