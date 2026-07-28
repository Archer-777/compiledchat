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

const MyProfileScreen = ({ navigation }) => {
  const [activeViewMode, setActiveViewMode] = useState('self'); // 'self' or 'audience'

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

  const projectThumbnails = [
    { id: '1', title: 'Eco Energy', tag: '#Green', color: '#10b981', icon: 'leaf' },
    { id: '2', title: 'AI Mind', tag: '#Spiritual', color: '#7c3aed', icon: 'brain' },
    { id: '3', title: 'Karma Token', tag: '#NFT', color: '#00bcd4', icon: 'cube' },
    { id: '4', title: 'Youth Hope', tag: '#Social', color: '#ff6b6b', icon: 'hands-helping' },
  ];

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

        <Text style={styles.headerTitle}>My Profile</Text>

        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={() => Alert.alert('Settings', 'Profile Settings')}
          activeOpacity={0.7}
        >
          <Ionicons name="ellipsis-vertical" size={22} color="#1a1a2e" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card Header Section */}
        <View style={styles.profileHeaderCard}>
          {/* Avatar 100x100 with Teal Border */}
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              <FontAwesome5 name="user-alt" size={44} color="#00bcd4" />
            </View>
            <View style={styles.onlineDot} />
          </View>

          {/* Name & Handle */}
          <Text style={styles.nameText}>Leo Das</Text>
          <Text style={styles.handleText}>@Person NFT Token No (007)</Text>

          {/* Badges Row */}
          <View style={styles.badgesRow}>
            <View style={styles.karmaBadge}>
              <MaterialCommunityIcons name="star-face" size={14} color="#f0c040" style={styles.karmaIcon} />
              <Text style={styles.karmaText}>Platform Karma Rating</Text>
            </View>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>Level 1</Text>
            </View>
          </View>
        </View>

        {/* Quick Links Row */}
        <View style={styles.quickLinksContainer}>
          <TouchableOpacity
            style={styles.quickLinkItem}
            onPress={() => Alert.alert('My Growth', 'Growth analytics details')}
            activeOpacity={0.7}
          >
            <View style={[styles.dotIndicator, { backgroundColor: '#10b981' }]} />
            <Text style={styles.quickLinkText}>My Growth</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickLinkItem}
            onPress={() => Alert.alert('My Change', 'Impact & Changes track')}
            activeOpacity={0.7}
          >
            <View style={[styles.dotIndicator, { backgroundColor: '#ff6b6b' }]} />
            <Text style={styles.quickLinkText}>My Change</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickLinkItem}
            onPress={() => Alert.alert('My Time', 'Log and time tracking')}
            activeOpacity={0.7}
          >
            <View style={[styles.dotIndicator, { backgroundColor: '#00d4ff' }]} />
            <Text style={styles.quickLinkText}>My Time</Text>
          </TouchableOpacity>
        </View>

        {/* Stats & View Modes Section */}
        <View style={styles.statsCard}>
          <View style={styles.nftTokenRow}>
            <Text style={styles.nftTokenLabel}>NFT Identity</Text>
            <Text style={styles.nftTokenText}>@Project NFT Token No (007)</Text>
          </View>

          {/* Stats Bar */}
          <View style={styles.statsRow}>
            <TouchableOpacity style={styles.statBox} onPress={() => safeNavigate('UtopiaScreen')}>
              <Text style={styles.statNumber}>5</Text>
              <Text style={styles.statLabel}>Projects</Text>
            </TouchableOpacity>

            <View style={styles.statDivider} />

            <TouchableOpacity style={styles.statBox} onPress={() => safeNavigate('Challenge')}>
              <Text style={styles.statNumber}>2</Text>
              <Text style={styles.statLabel}>Volunteer</Text>
            </TouchableOpacity>

            <View style={styles.statDivider} />

            <View style={styles.statBox}>
              <Text style={styles.statNumber}>Top</Text>
              <Text style={styles.statLabel}>Leading</Text>
            </View>
          </View>

          {/* View Links Row */}
          <View style={styles.viewModesRow}>
            <TouchableOpacity
              style={[
                styles.viewLinkButton,
                activeViewMode === 'audience' && styles.viewLinkActive,
              ]}
              onPress={() => setActiveViewMode('audience')}
              activeOpacity={0.7}
            >
              <Ionicons
                name="eye-outline"
                size={14}
                color={activeViewMode === 'audience' ? '#00bcd4' : '#6b7280'}
              />
              <Text
                style={[
                  styles.viewLinkText,
                  activeViewMode === 'audience' && styles.viewLinkTextActive,
                ]}
              >
                View as Audience
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.viewLinkButton,
                activeViewMode === 'self' && styles.viewLinkActive,
              ]}
              onPress={() => setActiveViewMode('self')}
              activeOpacity={0.7}
            >
              <Ionicons
                name="person-outline"
                size={14}
                color={activeViewMode === 'self' ? '#00bcd4' : '#6b7280'}
              />
              <Text
                style={[
                  styles.viewLinkText,
                  activeViewMode === 'self' && styles.viewLinkTextActive,
                ]}
              >
                View to Self
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoSectionCard}>
          <Text style={styles.sectionHeaderTitle}>SPIRITUALISE AI STATUS</Text>

          <View style={styles.infoRow}>
            <Ionicons name="mail-unread-outline" size={20} color="#7c3aed" style={styles.infoRowIcon} />
            <Text style={styles.infoRowText}>
              <Text style={styles.boldLabel}>Self - </Text>Spiritualise AI personal messaged
            </Text>
          </View>

          <View style={styles.infoRow}>
            <LinearGradient colors={['#00d4ff', '#7c3aed']} style={styles.miniAiIcon}>
              <MaterialCommunityIcons name="sparkles" size={12} color="#ffffff" />
            </LinearGradient>
            <Text style={styles.infoRowText}>
              <Text style={styles.boldLabel}>Public - </Text>Spiritualise AI tickers of task done
            </Text>
          </View>
        </View>

        {/* Action Buttons Row */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.iconActionButton}
            onPress={() => Alert.alert('Information', 'Profile Karma & NFT Info')}
            activeOpacity={0.7}
          >
            <Ionicons name="information-circle-outline" size={24} color="#00bcd4" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconActionButton}
            onPress={() => Alert.alert('Help & FAQ', 'Need assistance? Support team is online.')}
            activeOpacity={0.7}
          >
            <Ionicons name="help-circle-outline" size={24} color="#00bcd4" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.postButton}
            onPress={() => safeNavigate('UtopiaScreen')}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle" size={18} color="#ffffff" style={{ marginRight: 6 }} />
            <Text style={styles.postButtonText}>Post</Text>
          </TouchableOpacity>
        </View>

        {/* Projects Section */}
        <View style={styles.projectsSection}>
          <View style={styles.projectsHeaderRow}>
            <Text style={styles.sectionHeaderTitle}>PROJECTS GRID</Text>
            <TouchableOpacity onPress={() => safeNavigate('UtopiaScreen')}>
              <Text style={styles.seeAllText}>See All &gt;</Text>
            </TouchableOpacity>
          </View>

          {/* Grid of project thumbnails */}
          <View style={styles.projectsGrid}>
            {projectThumbnails.map((proj) => (
              <TouchableOpacity
                key={proj.id}
                style={styles.projectGridCard}
                onPress={() => safeNavigate('Challenge')}
                activeOpacity={0.8}
              >
                <View style={[styles.projectThumbnailBox, { backgroundColor: proj.color }]}>
                  <FontAwesome5 name={proj.icon} size={28} color="#ffffff" />
                  <View style={styles.tagBadge}>
                    <Text style={styles.tagBadgeText}>{proj.tag}</Text>
                  </View>
                </View>
                <Text style={styles.projectTitle}>{proj.title}</Text>
              </TouchableOpacity>
            ))}
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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  profileHeaderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 16,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#00bcd4',
    backgroundColor: '#e0f7fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  nameText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  handleText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 14,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  karmaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  karmaIcon: {
    marginRight: 6,
  },
  karmaText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  levelBadge: {
    backgroundColor: '#e0f7fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#00bcd4',
  },
  levelText: {
    color: '#00bcd4',
    fontSize: 12,
    fontWeight: '700',
  },
  quickLinksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  quickLinkItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dotIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  quickLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  statsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  nftTokenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f5',
  },
  nftTokenLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  nftTokenText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00bcd4',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 14,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#00bcd4',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#e5e7eb',
  },
  viewModesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f5',
  },
  viewLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  viewLinkActive: {
    backgroundColor: '#e0f7fa',
  },
  viewLinkText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginLeft: 6,
  },
  viewLinkTextActive: {
    color: '#00bcd4',
    fontWeight: '700',
  },
  infoSectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  sectionHeaderTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9ca3af',
    letterSpacing: 1,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoRowIcon: {
    marginRight: 10,
  },
  miniAiIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justify: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  infoRowText: {
    fontSize: 13,
    color: '#374151',
    flex: 1,
  },
  boldLabel: {
    fontWeight: '700',
    color: '#1a1a2e',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 10,
  },
  iconActionButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    justify: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  postButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#00bcd4',
    flexDirection: 'row',
    justify: 'center',
    alignItems: 'center',
    shadowColor: '#00bcd4',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  postButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  projectsSection: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  projectsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 12,
    color: '#00bcd4',
    fontWeight: '700',
  },
  projectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  projectGridCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 14,
    padding: 8,
    alignItems: 'center',
  },
  projectThumbnailBox: {
    width: '100%',
    height: 80,
    borderRadius: 10,
    justify: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  tagBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '700',
  },
  projectTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a2e',
    marginTop: 6,
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

export default MyProfileScreen;
