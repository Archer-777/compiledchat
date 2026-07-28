import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import {
  MaterialCommunityIcons,
  Ionicons,
} from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const DashboardCompetitiveScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Purpose');

  const handleSeeAll = (sectionName) => {
    if (sectionName === 'My Growth' && navigation?.navigate) {
      navigation.navigate('EmpowerCommunityScreen');
    } else if (sectionName === 'My Change' && navigation?.navigate) {
      navigation.navigate('WishScreen');
    } else {
      Alert.alert(sectionName, `Viewing complete ${sectionName} insights.`);
    }
  };

  const handleCreateNow = () => {
    if (navigation?.navigate) {
      navigation.navigate('WishScreen');
    } else {
      Alert.alert('Create Now', 'Opening Purpose Creation Studio.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a1a" />
      
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => (navigation?.goBack ? navigation.goBack() : Alert.alert('Back', 'Navigating back'))}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <TouchableOpacity
          style={styles.headerRightIcon}
          onPress={() => Alert.alert('Dashboard Settings', 'Competitive preferences updated.')}
          activeOpacity={0.7}
        >
          <Ionicons name="options-outline" size={22} color="#a0a0b0" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Subtitle Banner */}
        <View style={styles.subtitleBanner}>
          <MaterialCommunityIcons name="compass-outline" size={22} color="#00d4ff" style={{ marginRight: 8 }} />
          <Text style={styles.subtitleBannerText}>Personal Purpose Dashboard</Text>
        </View>

        {/* Tab Bar: Neha / Purpose (Purpose active with Premium badge) */}
        <View style={styles.tabBarContainer}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'Neha' && styles.activeTabItem]}
            onPress={() => setActiveTab('Neha')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'Neha' && styles.activeTabText]}>Neha</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'Purpose' && styles.activeTabItem]}
            onPress={() => setActiveTab('Purpose')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'Purpose' && styles.activeTabText]}>Purpose</Text>
            <View style={styles.premiumBadge}>
              <MaterialCommunityIcons name="crown" size={12} color="#050510" style={{ marginRight: 3 }} />
              <Text style={styles.premiumBadgeText}>PREMIUM</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 1. Global Competitive Score Header */}
        <View style={styles.sectionHeaderContainer}>
          <MaterialCommunityIcons name="trophy-award" size={22} color="#d4a017" style={{ marginRight: 8 }} />
          <Text style={styles.sectionTitleText}>1. Global Competitive Score</Text>
        </View>

        {/* Pyramid / Triangle Visualization */}
        <View style={styles.pyramidCard}>
          {/* Top Label */}
          <View style={styles.consciousnessLabelBadge}>
            <MaterialCommunityIcons name="sparkles" size={14} color="#00d4ff" style={{ marginRight: 6 }} />
            <Text style={styles.consciousnessLabelText}>Consciousness Awareness</Text>
          </View>

          {/* Stacked Pyramid of horizontal bars, wider at bottom, narrower at top (9 bars) */}
          <View style={styles.pyramidContainer}>
            <LinearGradient colors={['#00d4ff', '#00bcd4']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.pyramidBar, { width: '20%' }]}>
              <Text style={styles.pyramidBarText}>L9 • 99%</Text>
            </LinearGradient>

            <LinearGradient colors={['#00d4ff', '#00bcd4']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.pyramidBar, { width: '28%' }]}>
              <Text style={styles.pyramidBarText}>L8 • 94%</Text>
            </LinearGradient>

            <LinearGradient colors={['#00d4ff', '#00bcd4']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.pyramidBar, { width: '36%' }]}>
              <Text style={styles.pyramidBarText}>L7 • 88%</Text>
            </LinearGradient>

            <LinearGradient colors={['#00d4ff', '#00bcd4']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.pyramidBar, { width: '44%' }]}>
              <Text style={styles.pyramidBarText}>L6 • 82%</Text>
            </LinearGradient>

            <LinearGradient colors={['#00d4ff', '#00bcd4']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.pyramidBar, { width: '52%' }]}>
              <Text style={styles.pyramidBarText}>L5 • 75%</Text>
            </LinearGradient>

            <LinearGradient colors={['#00d4ff', '#00bcd4']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.pyramidBar, { width: '60%' }]}>
              <Text style={styles.pyramidBarText}>L4 • 68%</Text>
            </LinearGradient>

            <LinearGradient colors={['#00d4ff', '#00bcd4']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.pyramidBar, { width: '68%' }]}>
              <Text style={styles.pyramidBarText}>L3 • 60%</Text>
            </LinearGradient>

            <LinearGradient colors={['#00d4ff', '#00bcd4']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.pyramidBar, { width: '76%' }]}>
              <Text style={styles.pyramidBarText}>L2 • 50%</Text>
            </LinearGradient>

            <LinearGradient colors={['#00d4ff', '#00bcd4']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.pyramidBar, { width: '85%' }]}>
              <Text style={styles.pyramidBarText}>L1 • 40%</Text>
            </LinearGradient>
          </View>
        </View>

        {/* My Growth Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>My Growth</Text>
          <TouchableOpacity onPress={() => handleSeeAll('My Growth')} activeOpacity={0.7}>
            <Text style={styles.seeAllLink}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.growthCard}>
          {/* Collective Intelligence 40% */}
          <View style={styles.growthItem}>
            <View style={styles.growthItemHeader}>
              <Text style={styles.growthLabel}>Collective Intelligence</Text>
              <Text style={styles.growthValue}>40%</Text>
            </View>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: '40%' }]} />
            </View>
          </View>

          {/* Global Consciousness 60% */}
          <View style={styles.growthItem}>
            <View style={styles.growthItemHeader}>
              <Text style={styles.growthLabel}>Global Consciousness</Text>
              <Text style={styles.growthValue}>60%</Text>
            </View>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: '60%' }]} />
            </View>
          </View>

          {/* Karma Score 90% */}
          <View style={styles.growthItem}>
            <View style={styles.growthItemHeader}>
              <Text style={styles.growthLabel}>Karma Score</Text>
              <Text style={styles.growthValue}>90%</Text>
            </View>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: '90%' }]} />
            </View>
          </View>
        </View>

        {/* 2. Global Competitive Score Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>2. Global Competitive Score</Text>
          <TouchableOpacity onPress={() => handleSeeAll('2. Global Competitive Score')} activeOpacity={0.7}>
            <Text style={styles.seeAllLink}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.scoreOverviewCard}>
          <View style={styles.scoreBadgeRow}>
            <View style={styles.scoreHighlightCircle}>
              <Text style={styles.scoreHighlightText}>#42</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.scoreTitle}>Global Standing</Text>
              <Text style={styles.scoreSubtitle}>Top 2% Global Mindset Impact</Text>
            </View>
            <MaterialCommunityIcons name="earth-box" size={32} color="#00d4ff" />
          </View>
        </View>

        {/* My Change Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>My Change</Text>
          <TouchableOpacity onPress={() => handleSeeAll('My Change')} activeOpacity={0.7}>
            <Text style={styles.seeAllLink}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.worldMapCard}>
          <View style={styles.earthIconWrapper}>
            <MaterialCommunityIcons name="earth" size={84} color="#00d4ff" />
            <View style={styles.pulsePin1} />
            <View style={styles.pulsePin2} />
          </View>
          <View style={styles.mapStatsRow}>
            <View style={styles.mapStatItem}>
              <Text style={styles.mapStatNumber}>142</Text>
              <Text style={styles.mapStatLabel}>Impact Nodes</Text>
            </View>
            <View style={styles.mapStatDivider} />
            <View style={styles.mapStatItem}>
              <Text style={styles.mapStatNumber}>38</Text>
              <Text style={styles.mapStatLabel}>Countries</Text>
            </View>
            <View style={styles.mapStatDivider} />
            <View style={styles.mapStatItem}>
              <Text style={styles.mapStatNumber}>9.4k</Text>
              <Text style={styles.mapStatLabel}>Lives Reached</Text>
            </View>
          </View>
        </View>

        {/* My Creation Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>My Creation</Text>
          <TouchableOpacity onPress={handleCreateNow} activeOpacity={0.7}>
            <Text style={styles.createNowLink}>Create now</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.creationCard}>
          <View style={styles.creationIconContainer}>
            <MaterialCommunityIcons name="lightning-bolt" size={24} color="#d4a017" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.creationTitle}>Wind Turbine Project</Text>
            <Text style={styles.creationSubtitle}>Active Creation • LMIC Support</Text>
          </View>
          <TouchableOpacity
            style={styles.creationActionButton}
            onPress={() => (navigation?.navigate ? navigation.navigate('WishScreen') : Alert.alert('Wish Screen', 'Navigating to Wish Screen'))}
            activeOpacity={0.7}
          >
            <Text style={styles.creationActionText}>View</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerRightIcon: {
    padding: 6,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  subtitleBanner: {
    backgroundColor: '#12121f',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 16,
    marginBottom: 16,
  },
  subtitleBannerText: {
    color: '#00d4ff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#12121f',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1a1a2e',
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  activeTabItem: {
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#00d4ff',
  },
  tabText: {
    color: '#a0a0b0',
    fontSize: 15,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d4a017',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  premiumBadgeText: {
    color: '#050510',
    fontSize: 10,
    fontWeight: '800',
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitleText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
  pyramidCard: {
    backgroundColor: '#12121f',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1a1a2e',
    alignItems: 'center',
    marginBottom: 20,
  },
  consciousnessLabelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 212, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#00d4ff',
    marginBottom: 16,
  },
  consciousnessLabelText: {
    color: '#00d4ff',
    fontSize: 13,
    fontWeight: '700',
  },
  pyramidContainer: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 4,
  },
  pyramidBar: {
    height: 22,
    borderRadius: 4,
    marginVertical: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pyramidBarText: {
    color: '#050510',
    fontSize: 10,
    fontWeight: '800',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 12,
  },
  sectionHeading: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
  seeAllLink: {
    color: '#00d4ff',
    fontSize: 14,
    fontWeight: '600',
  },
  growthCard: {
    backgroundColor: '#12121f',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1a1a2e',
    marginBottom: 20,
  },
  growthItem: {
    marginBottom: 14,
  },
  growthItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  growthLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  growthValue: {
    color: '#00bcd4',
    fontSize: 14,
    fontWeight: '700',
  },
  progressBarTrack: {
    height: 10,
    backgroundColor: '#1a1a2e',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#00bcd4',
    borderRadius: 6,
  },
  scoreOverviewCard: {
    backgroundColor: '#12121f',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1a1a2e',
    marginBottom: 20,
  },
  scoreBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreHighlightCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 212, 255, 0.15)',
    borderWidth: 1.5,
    borderColor: '#00d4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreHighlightText: {
    color: '#00d4ff',
    fontSize: 16,
    fontWeight: '800',
  },
  scoreTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  scoreSubtitle: {
    color: '#a0a0b0',
    fontSize: 12,
    marginTop: 2,
  },
  worldMapCard: {
    backgroundColor: '#12121f',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1a1a2e',
    alignItems: 'center',
    marginBottom: 20,
  },
  earthIconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  pulsePin1: {
    position: 'absolute',
    top: 15,
    right: 20,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00bcd4',
  },
  pulsePin2: {
    position: 'absolute',
    bottom: 20,
    left: 18,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d4a017',
  },
  mapStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1a1a2e',
  },
  mapStatItem: {
    alignItems: 'center',
  },
  mapStatNumber: {
    color: '#00d4ff',
    fontSize: 16,
    fontWeight: '700',
  },
  mapStatLabel: {
    color: '#a0a0b0',
    fontSize: 11,
    marginTop: 2,
  },
  mapStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#1a1a2e',
  },
  createNowLink: {
    color: '#00d4ff',
    fontSize: 14,
    fontWeight: '700',
  },
  creationCard: {
    backgroundColor: '#12121f',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1a1a2e',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  creationIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: 'rgba(212, 160, 23, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  creationTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  creationSubtitle: {
    color: '#a0a0b0',
    fontSize: 12,
    marginTop: 2,
  },
  creationActionButton: {
    backgroundColor: 'rgba(0, 212, 255, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00d4ff',
  },
  creationActionText: {
    color: '#00d4ff',
    fontSize: 13,
    fontWeight: '700',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#050510',
    borderTopWidth: 1,
    borderTopColor: '#1a1a2e',
    paddingVertical: 10,
    paddingHorizontal: 16,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    color: '#a0a0b0',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
});

export default DashboardCompetitiveScreen;
