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
  Switch,
} from 'react-native';
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
  MaterialIcons,
} from '@expo/vector-icons';
import { Colors } from '../theme/colors';

const DashboardScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Neha');
  const [bottomNavTab, setBottomNavTab] = useState('Dashboard');
  const [activityToggle, setActivityToggle] = useState(true);

  const handleNavigate = (screenName) => {
    if (navigation && navigation.navigate) {
      navigation.navigate(screenName);
    } else {
      Alert.alert('Navigation', `Navigating to ${screenName}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a1a" />

      {/* Top Header: Back Arrow + 'Dashboard' Title */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation && navigation.goBack ? navigation.goBack() : Alert.alert('Back', 'Going back')}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <TouchableOpacity
          style={styles.headerRightBtn}
          onPress={() => Alert.alert('Notifications', 'No new notifications')}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={22} color="#a0a0b0" />
        </TouchableOpacity>
      </View>

      {/* Tab Bar: Neha (Left) & Purpose (Right with Gold Premium Badge) */}
      <View style={styles.tabBarContainer}>
        {/* Neha Tab */}
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'Neha' && styles.activeTabButton]}
          onPress={() => setActiveTab('Neha')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'Neha' && styles.activeTabText]}>
            Neha
          </Text>
          {activeTab === 'Neha' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>

        {/* Purpose Tab with Premium Badge */}
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'Purpose' && styles.activeTabButton]}
          onPress={() => setActiveTab('Purpose')}
          activeOpacity={0.8}
        >
          <View style={styles.purposeTabRow}>
            <Text style={[styles.tabText, activeTab === 'Purpose' && styles.activeTabText]}>
              Purpose
            </Text>
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumBadgeText}>Premium</Text>
            </View>
          </View>
          {activeTab === 'Purpose' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>
      </View>

      {/* Main Content Area */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'Neha' ? (
          /* ================================================================= */
          /* NEHA TAB CONTENT                                                  */
          /* ================================================================= */
          <View>
            {/* Meditation Figure Area */}
            <View style={styles.meditationCard}>
              <View style={styles.meditationIconWrapper}>
                {/* Cosmic Energy Dots around the meditating figure */}
                <View style={[styles.cosmicDot, styles.cosmicDot1]} />
                <View style={[styles.cosmicDot, styles.cosmicDot2]} />
                <View style={[styles.cosmicDot, styles.cosmicDot3]} />
                <View style={[styles.cosmicDot, styles.cosmicDot4]} />
                <View style={[styles.cosmicDot, styles.cosmicDot5]} />

                {/* Silhouette of person meditating */}
                <MaterialCommunityIcons
                  name="meditation"
                  size={100}
                  color="#00d4ff"
                />
              </View>

              {/* Universal Energy text in purple */}
              <Text style={styles.universalEnergyText}>Universal Energy</Text>
              <Text style={styles.meditationSubText}>
                Harmonized mind & cosmic alignment
              </Text>
            </View>

            {/* 'My World' Section */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeaderTitle}>My World</Text>
                <TouchableOpacity
                  onPress={() => Alert.alert('My World', 'Viewing all world metrics')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.seeAllLink}>See all</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.cardDark}>
                {/* Business - Green Bar 80% */}
                <View style={styles.progressRowContainer}>
                  <View style={styles.progressLabelRow}>
                    <Text style={styles.progressLabel}>Business</Text>
                    <Text style={[styles.progressPercent, { color: '#10b981' }]}>80%</Text>
                  </View>
                  <View style={styles.trackBackground}>
                    <View style={[styles.trackFill, { width: '80%', backgroundColor: '#10b981' }]} />
                  </View>
                </View>

                {/* Family - Red/Coral Bar 90% */}
                <View style={styles.progressRowContainer}>
                  <View style={styles.progressLabelRow}>
                    <Text style={styles.progressLabel}>Family</Text>
                    <Text style={[styles.progressPercent, { color: '#ff6b6b' }]}>90%</Text>
                  </View>
                  <View style={styles.trackBackground}>
                    <View style={[styles.trackFill, { width: '90%', backgroundColor: '#ff6b6b' }]} />
                  </View>
                </View>

                {/* Friend - Teal Bar 60% with circle handle */}
                <View style={styles.progressRowContainer}>
                  <View style={styles.progressLabelRow}>
                    <Text style={styles.progressLabel}>Friend</Text>
                    <Text style={[styles.progressPercent, { color: '#00bcd4' }]}>60%</Text>
                  </View>
                  <View style={styles.trackBackground}>
                    <View style={[styles.trackFill, { width: '60%', backgroundColor: '#00bcd4' }]}>
                      {/* Circle handle knob at end of friend bar */}
                      <View style={styles.circleHandle} />
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* 'Chat History' Section */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeaderTitle}>Chat History</Text>
                <TouchableOpacity
                  onPress={() => handleNavigate('AIChatLight')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.seeAllLink}>See all</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.chatPreviewCard}
                onPress={() => handleNavigate('AIChatDark')}
                activeOpacity={0.85}
              >
                <View style={styles.chatIconBox}>
                  <MaterialCommunityIcons name="robot" size={24} color="#00d4ff" />
                </View>
                <View style={styles.chatContentBox}>
                  <View style={styles.chatTitleRow}>
                    <Text style={styles.chatSenderTitle}>AI Guide Neha</Text>
                    <Text style={styles.chatTimeText}>10:42 AM</Text>
                  </View>
                  <Text style={styles.chatPreviewText} numberOfLines={1}>
                    I am not feeling we today, I am ...
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* ================================================================= */
          /* PURPOSE TAB CONTENT                                               */
          /* ================================================================= */
          <View>
            {/* 'My Growth' Section */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeaderTitle}>My Growth</Text>
                <TouchableOpacity
                  onPress={() => Alert.alert('My Growth', 'Viewing growth details')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.seeAllLink}>See all</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.cardDark}>
                {/* Collective Intelligence - 40% with Gold Handle */}
                <View style={styles.progressRowContainer}>
                  <View style={styles.progressLabelRow}>
                    <Text style={styles.progressLabel}>Collective Intelligence</Text>
                    <Text style={[styles.progressPercent, { color: '#00bcd4' }]}>40%</Text>
                  </View>
                  <View style={styles.trackBackground}>
                    <View style={[styles.trackFill, { width: '40%', backgroundColor: '#00bcd4' }]}>
                      {/* Gold slider handle */}
                      <View style={styles.goldSliderHandle} />
                    </View>
                  </View>
                </View>

                {/* Global Consciousness - 60% */}
                <View style={styles.progressRowContainer}>
                  <View style={styles.progressLabelRow}>
                    <Text style={styles.progressLabel}>Global Consciousness</Text>
                    <Text style={[styles.progressPercent, { color: '#00bcd4' }]}>60%</Text>
                  </View>
                  <View style={styles.trackBackground}>
                    <View style={[styles.trackFill, { width: '60%', backgroundColor: '#00bcd4' }]} />
                  </View>
                </View>

                {/* Balanced Thinking - 90% */}
                <View style={styles.progressRowContainer}>
                  <View style={styles.progressLabelRow}>
                    <Text style={styles.progressLabel}>Balanced Thinking</Text>
                    <Text style={[styles.progressPercent, { color: '#00bcd4' }]}>90%</Text>
                  </View>
                  <View style={styles.trackBackground}>
                    <View style={[styles.trackFill, { width: '90%', backgroundColor: '#00bcd4' }]} />
                  </View>
                </View>
              </View>
            </View>

            {/* 'My Change' Section */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeaderTitle}>My Change</Text>
                <TouchableOpacity
                  onPress={() => Alert.alert('My Change', 'Viewing all change logs')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.seeAllLink}>See all</Text>
                </TouchableOpacity>
              </View>

              {/* Card 1: Activity */}
              <View style={styles.cardDark}>
                <View style={styles.cardTopHeaderRow}>
                  <Text style={styles.cardSubtitleHeader}>Activity</Text>
                  <Switch
                    value={activityToggle}
                    onValueChange={setActivityToggle}
                    trackColor={{ false: '#2a2a3e', true: '#00bcd4' }}
                    thumbColor={activityToggle ? '#ffffff' : '#a0a0b0'}
                  />
                </View>
                <Text style={styles.activityBodyText}>
                  Today, I promoted fairness and inclusivity, reducing inequalities in my community.
                </Text>
              </View>

              {/* Card 2: Category SDG 10 */}
              <View style={[styles.cardDark, styles.categoryCard]}>
                <View style={styles.cardTopHeaderRow}>
                  <Text style={styles.cardSubtitleHeader}>Category</Text>
                  <View style={styles.sdgBadge}>
                    <Text style={styles.sdgBadgeText}>SDG 10</Text>
                  </View>
                </View>
                <Text style={styles.sdgDescriptionText}>
                  Reduced Inequalities & Social Empowerment Goal
                </Text>
              </View>
            </View>

            {/* 'My Creation' Section */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeaderTitle}>My Creation</Text>
                <TouchableOpacity
                  onPress={() => handleNavigate('ClarityOnDemand')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.createNowLink}>Create now</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.cardDark}>
                <View style={styles.creationCardRow}>
                  <View style={styles.creationIconCircle}>
                    <Ionicons name="sparkles" size={24} color="#d4a017" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.creationTitle}>Matrix Idea Blueprint</Text>
                    <Text style={styles.creationSub}>
                      Transform raw intuition into scalable impact.
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Navigation Buttons to Other Screens */}
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={styles.navActionButton}
                onPress={() => handleNavigate('DashboardCompetitive')}
                activeOpacity={0.85}
              >
                <FontAwesome5 name="trophy" size={16} color="#00d4ff" style={styles.navBtnIcon} />
                <Text style={styles.navActionButtonText}>View Competitive Scores</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.navActionButton, styles.profileNavBtn]}
                onPress={() => handleNavigate('MyProfile')}
                activeOpacity={0.85}
              >
                <Ionicons name="person-circle-outline" size={20} color="#d4a017" style={styles.navBtnIcon} />
                <Text style={[styles.navActionButtonText, { color: '#d4a017' }]}>
                  View Profile
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  headerRightBtn: {
    padding: 6,
  },
  /* Tab Bar */
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#12121f',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeTabButton: {
    backgroundColor: 'rgba(0, 188, 212, 0.05)',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#a0a0b0',
  },
  activeTabText: {
    color: '#00bcd4',
    fontWeight: '700',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    height: 3,
    backgroundColor: '#00bcd4',
    borderRadius: 1.5,
  },
  purposeTabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  premiumBadge: {
    backgroundColor: '#d4a017',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  premiumBadgeText: {
    color: '#050510',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  /* Scroll Content */
  scrollContent: {
    padding: 18,
    paddingBottom: 24,
  },
  /* Neha Tab - Meditation Card */
  meditationCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  meditationIconWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(0, 212, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 12,
  },
  cosmicDot: {
    position: 'absolute',
    borderRadius: 5,
    backgroundColor: '#00d4ff',
  },
  cosmicDot1: { width: 8, height: 8, top: 12, left: 24, opacity: 0.8 },
  cosmicDot2: { width: 6, height: 6, top: 28, right: 20, opacity: 0.6, backgroundColor: '#d4a017' },
  cosmicDot3: { width: 10, height: 10, bottom: 20, left: 16, opacity: 0.7, backgroundColor: '#7c3aed' },
  cosmicDot4: { width: 7, height: 7, bottom: 30, right: 28, opacity: 0.9 },
  cosmicDot5: { width: 5, height: 5, top: 6, right: 50, opacity: 0.5, backgroundColor: '#ec4899' },
  universalEnergyText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#7c3aed',
    marginBottom: 4,
  },
  meditationSubText: {
    fontSize: 13,
    color: '#a0a0b0',
  },
  /* General Sections */
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  seeAllLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00bcd4',
  },
  createNowLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#d4a017',
  },
  cardDark: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  /* Progress Rows */
  progressRowContainer: {
    marginBottom: 14,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '700',
  },
  trackBackground: {
    height: 10,
    backgroundColor: '#12121f',
    borderRadius: 5,
    overflow: 'visible',
  },
  trackFill: {
    height: 10,
    borderRadius: 5,
    position: 'relative',
  },
  circleHandle: {
    position: 'absolute',
    right: -6,
    top: -3,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 3,
    borderColor: '#00bcd4',
  },
  goldSliderHandle: {
    position: 'absolute',
    right: -6,
    top: -3,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#d4a017',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  /* Chat History Preview */
  chatPreviewCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  chatIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  chatContentBox: {
    flex: 1,
  },
  chatTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  chatSenderTitle: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  chatTimeText: {
    color: '#6b7280',
    fontSize: 11,
  },
  chatPreviewText: {
    color: '#a0a0b0',
    fontSize: 13,
  },
  /* Purpose Tab Cards */
  cardTopHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardSubtitleHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  activityBodyText: {
    fontSize: 14,
    color: '#a0a0b0',
    lineHeight: 20,
  },
  categoryCard: {
    marginTop: 12,
  },
  sdgBadge: {
    backgroundColor: 'rgba(0, 188, 212, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#00bcd4',
  },
  sdgBadgeText: {
    color: '#00bcd4',
    fontSize: 12,
    fontWeight: '800',
  },
  sdgDescriptionText: {
    fontSize: 13,
    color: '#a0a0b0',
  },
  creationCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  creationIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(212, 160, 23, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  creationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  creationSub: {
    fontSize: 12,
    color: '#a0a0b0',
  },
  /* Navigation Action Buttons */
  actionButtonsContainer: {
    gap: 12,
    marginTop: 8,
  },
  navActionButton: {
    backgroundColor: '#12121f',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#00d4ff',
  },
  profileNavBtn: {
    borderColor: '#d4a017',
  },
  navBtnIcon: {
    marginRight: 8,
  },
  navActionButtonText: {
    color: '#00d4ff',
    fontWeight: '700',
    fontSize: 15,
  },
  /* Bottom Tab Bar */
  bottomTabBar: {
    height: 60,
    backgroundColor: '#050510',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#1a1a2e',
  },
  bottomTabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomTabText: {
    fontSize: 11,
    color: '#a0a0b0',
    marginTop: 2,
  },
  bottomTabTextActive: {
    color: '#00bcd4',
    fontWeight: '700',
  },
});

export default DashboardScreen;
