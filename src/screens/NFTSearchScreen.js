import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

const INITIAL_NFTS = [
  {
    id: '1',
    title: 'Fluffy cells',
    currentBid: '1.2 ETH',
    timeRemaining: '12:24:00',
    gradient: ['#ec4899', '#7c3aed'], // pink-purple gradient
    category: 'Abstract',
    hasFire: false,
    hasSilhouette: false,
  },
  {
    id: '2',
    title: "Blue bloomin'",
    currentBid: '1.6 ETH',
    timeRemaining: '02:14:46',
    gradient: ['#00bcd4', '#3b82f6'], // blue-teal gradient
    category: 'Collectibles',
    hasFire: false,
    hasSilhouette: false,
  },
  {
    id: '3',
    title: 'Spin spin spin',
    currentBid: '2.4 ETH',
    timeRemaining: '05:12:30',
    gradient: ['#f59e0b', '#ff6b6b'], // orange-coral gradient
    category: 'Illustration',
    hasFire: true,
    hasSilhouette: false,
  },
  {
    id: '4',
    title: 'Engagement',
    currentBid: '0.85 ETH',
    timeRemaining: '18:30:10',
    gradient: ['#10b981', '#059669'], // green gradient
    category: 'Abstract',
    hasFire: false,
    hasSilhouette: false,
  },
  {
    id: '5',
    title: 'Cosmic Soul',
    currentBid: '3.1 ETH',
    timeRemaining: '08:45:00',
    gradient: ['#8b5cf6', '#ec4899'], // purple-pink human silhouette gradient
    category: 'Collectibles',
    hasFire: false,
    hasSilhouette: true,
  },
  {
    id: '6',
    title: 'Aura Matrix',
    currentBid: '1.8 ETH',
    timeRemaining: '14:02:50',
    gradient: ['#00d4ff', '#4f46e5'], // cyan-indigo human silhouette gradient
    category: 'Illustration',
    hasFire: false,
    hasSilhouette: true,
  },
];

const FILTER_TABS = ['All', 'Collectibles', 'Abstract', 'Illustration'];

const NFTSearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('Search results for "3D NFTs"');
  const [activeTab, setActiveTab] = useState('All');
  const [bookmarkedIds, setBookmarkedIds] = useState(['2', '5']);

  const handleBack = () => {
    if (navigation && navigation.goBack) {
      navigation.goBack();
    } else if (navigation && navigation.navigate) {
      navigation.navigate('UtopianExchange');
    } else {
      Alert.alert('Navigation', 'Going Back');
    }
  };

  const handleCardPress = (nft) => {
    Alert.alert(
      nft.title,
      `Current Bid: ${nft.currentBid}\nTime Remaining: ${nft.timeRemaining}\nCategory: ${nft.category}`
    );
  };

  const toggleBookmark = (id, event) => {
    if (event && event.stopPropagation) {
      event.stopPropagation();
    }
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleFilterPress = () => {
    Alert.alert('Filter & Sort', 'Select filter criteria:\n• Price: Low to High\n• Most Popular\n• Ending Soonest');
  };

  // Filter NFTs based on active category tab
  const filteredNFTs = activeTab === 'All'
    ? INITIAL_NFTS
    : INITIAL_NFTS.filter((nft) => nft.category === activeTab);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.backgroundDark || '#0a0a1a'} />

      {/* Header Bar: Back Arrow + Search Input */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textWhite || '#ffffff'} />
        </TouchableOpacity>

        {/* Search Bar Input Container */}
        <View style={styles.searchBarContainer}>
          <Ionicons name="search" size={18} color={Colors.textGray || '#a0a0b0'} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder='Search NFTs...'
            placeholderTextColor={Colors.textMuted || '#6b7280'}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={16} color={Colors.textMuted || '#6b7280'} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Results Count Line */}
      <View style={styles.resultsCountContainer}>
        <Text style={styles.resultsCountText}>82 results</Text>
      </View>

      {/* Filter / Sort Row: Filter Icon + Scrollable Tab Pills */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={styles.filterIconBtn}
          onPress={handleFilterPress}
          activeOpacity={0.7}
        >
          <Ionicons name="options-outline" size={20} color={Colors.textWhite || '#ffffff'} />
        </TouchableOpacity>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContent}
        >
          {FILTER_TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabPill,
                  isActive ? styles.activeTabPill : styles.inactiveTabPill,
                ]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.tabPillText,
                    isActive ? styles.activeTabPillText : styles.inactiveTabPillText,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* NFT Grid (2 columns, ScrollView) */}
      <ScrollView
        contentContainerStyle={styles.gridScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.gridContainer}>
          {filteredNFTs.map((nft) => {
            const isBookmarked = bookmarkedIds.includes(nft.id);

            return (
              <TouchableOpacity
                key={nft.id}
                style={styles.cardContainer}
                onPress={() => handleCardPress(nft)}
                activeOpacity={0.9}
              >
                {/* Thumbnail Area (150px tall colored gradient view) */}
                <View style={styles.thumbnailWrapper}>
                  <LinearGradient
                    colors={nft.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientThumbnail}
                  >
                    {/* Decorative abstract elements inside thumbnail */}
                    {nft.hasSilhouette ? (
                      <View style={styles.silhouetteContainer}>
                        <FontAwesome5 name="user-astronaut" size={54} color="rgba(255, 255, 255, 0.75)" />
                        <View style={styles.auraRingSmall} />
                      </View>
                    ) : (
                      <View style={styles.abstractGraphicContainer}>
                        <View style={styles.abstractGraphicCircleLarge} />
                        <View style={styles.abstractGraphicCircleSmall} />
                        <MaterialCommunityIcons
                          name={nft.hasFire ? 'fire' : 'shape-polygon-plus'}
                          size={46}
                          color="rgba(255, 255, 255, 0.65)"
                        />
                      </View>
                    )}

                    {/* Top Right Bookmark Button */}
                    <TouchableOpacity
                      style={styles.bookmarkButton}
                      onPress={(e) => toggleBookmark(nft.id, e)}
                      activeOpacity={0.7}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons
                        name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                        size={18}
                        color={isBookmarked ? (Colors.teal || '#00bcd4') : (Colors.textWhite || '#ffffff')}
                      />
                    </TouchableOpacity>
                  </LinearGradient>
                </View>

                {/* Card Info Section */}
                <View style={styles.cardInfo}>
                  {/* Title + optional Fire emoji */}
                  <View style={styles.titleRow}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {nft.title}
                    </Text>
                    {nft.hasFire && (
                      <Text style={styles.fireEmoji}> 🔥</Text>
                    )}
                  </View>

                  {/* Current Bid */}
                  <View style={styles.bidRow}>
                    <Text style={styles.bidLabel}>Current bid: </Text>
                    <Text style={styles.bidValue}>{nft.currentBid}</Text>
                  </View>

                  {/* Time Remaining */}
                  <View style={styles.timeRow}>
                    <Ionicons name="time-outline" size={13} color={Colors.textGray || '#a0a0b0'} style={{ marginRight: 4 }} />
                    <Text style={styles.timeLabel}>Time remaining: </Text>
                    <Text style={styles.timeValue}>{nft.timeRemaining}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Bottom Spacing for Navigation */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.backgroundDark || '#0a0a1a',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.cardDark || '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardDark || '#1a1a2e',
    borderRadius: 20,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    borderColor: 'rgba(0, 188, 212, 0.25)',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: Colors.textWhite || '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
  resultsCountContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  resultsCountText: {
    fontSize: 13,
    color: Colors.textGray || '#a0a0b0',
    fontWeight: '500',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  filterIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.cardDark || '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabsScrollContent: {
    alignItems: 'center',
    gap: 8,
    paddingRight: 12,
  },
  tabPill: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTabPill: {
    backgroundColor: Colors.teal || '#00bcd4',
    shadowColor: Colors.teal || '#00bcd4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 3,
  },
  inactiveTabPill: {
    backgroundColor: Colors.cardDark || '#1a1a2e',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  activeTabPillText: {
    color: Colors.textWhite || '#ffffff',
  },
  inactiveTabPillText: {
    color: Colors.textGray || '#a0a0b0',
  },
  gridScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardContainer: {
    width: '48%',
    backgroundColor: Colors.cardDark || '#1a1a2e',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  thumbnailWrapper: {
    height: 150,
    width: '100%',
    position: 'relative',
  },
  gradientThumbnail: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  silhouetteContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  auraRingSmall: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  abstractGraphicContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  abstractGraphicCircleLarge: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  abstractGraphicCircleSmall: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  bookmarkButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(10, 10, 26, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    padding: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.textWhite || '#ffffff',
    flexShrink: 1,
  },
  fireEmoji: {
    fontSize: 14,
  },
  bidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  bidLabel: {
    fontSize: 12,
    color: Colors.textGray || '#a0a0b0',
  },
  bidValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.teal || '#00bcd4',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 11,
    color: Colors.textMuted || '#6b7280',
  },
  timeValue: {
    fontSize: 11,
    color: Colors.textGray || '#a0a0b0',
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 30,
  },
});

export default NFTSearchScreen;
