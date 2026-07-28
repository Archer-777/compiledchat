import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

const UtopianExchangeScreen = ({ navigation }) => {
  const handleClose = () => {
    if (navigation && navigation.goBack) {
      navigation.goBack();
    } else if (navigation && navigation.navigate) {
      navigation.navigate('Home');
    } else {
      Alert.alert('Utopian Exchange', 'Closing Utopian Exchange screen');
    }
  };

  const handleStartCollecting = () => {
    if (navigation && navigation.navigate) {
      navigation.navigate('NFTSearch');
    } else {
      Alert.alert('Start Collecting', 'Navigating to NFT Search');
    }
  };

  const handleCreateNFT = () => {
    Alert.alert('Create NFT', 'NFT Creation coming soon!');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.backgroundDark || '#0a0a1a'} />

      {/* Close button (X) at top left */}
      <View style={styles.topHeaderBar}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="close" size={26} color={Colors.textWhite || '#ffffff'} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Decorative icons at top: WiFi signal, heart, connectivity icons in white/gray, small scattered, with a teal dot accent */}
        <View style={styles.topDecorativeArea}>
          <View style={styles.iconScatteredBox}>
            {/* WiFi Signal Icon */}
            <Ionicons
              name="wifi-outline"
              size={22}
              color="rgba(255, 255, 255, 0.6)"
              style={[styles.scatteredIcon, { top: 12, left: 24 }]}
            />
            {/* Heart Icon */}
            <Ionicons
              name="heart-outline"
              size={18}
              color="rgba(160, 160, 176, 0.7)"
              style={[styles.scatteredIcon, { top: 38, right: 32 }]}
            />
            {/* Connectivity / Radio Icon */}
            <MaterialCommunityIcons
              name="radio-tower"
              size={24}
              color="rgba(255, 255, 255, 0.5)"
              style={[styles.scatteredIcon, { bottom: 18, left: 36 }]}
            />
            {/* Connectivity / Share Icon */}
            <Ionicons
              name="share-social-outline"
              size={20}
              color="rgba(160, 160, 176, 0.6)"
              style={[styles.scatteredIcon, { bottom: 30, right: 48 }]}
            />
            {/* Sparkle Icon */}
            <Ionicons
              name="sparkles"
              size={16}
              color="rgba(255, 255, 255, 0.8)"
              style={[styles.scatteredIcon, { top: 10, right: 90 }]}
            />

            {/* Teal Dot Accents */}
            <View style={[styles.tealDot, { top: 22, left: 110 }]} />
            <View style={[styles.tealDotSmall, { bottom: 25, right: 115 }]} />

            {/* Central Halo / Floating Emblem */}
            <View style={styles.centralEmblemHalo}>
              <View style={styles.centralEmblemInner}>
                <FontAwesome5 name="gem" size={32} color={Colors.teal || '#00bcd4'} />
              </View>
            </View>
          </View>
        </View>

        {/* Title & Subtitle Section */}
        <View style={styles.titleSection}>
          <Text style={styles.largeTitle}>
            Discover, collect and sell unique NFT artworks
          </Text>

          <Text style={styles.subtitle}>
            Marketplace with over 7,000 unique NFT artworks and more than 1,000 independent artists.
          </Text>
        </View>

        {/* Two main buttons stacked */}
        <View style={styles.buttonsContainer}>
          {/* 'Start collecting' button */}
          <TouchableOpacity
            style={styles.startCollectingBtn}
            onPress={handleStartCollecting}
            activeOpacity={0.85}
          >
            <Text style={styles.startCollectingBtnText}>Start collecting</Text>
          </TouchableOpacity>

          {/* 'Create NFT' button */}
          <TouchableOpacity
            style={styles.createNftBtn}
            onPress={handleCreateNFT}
            activeOpacity={0.85}
          >
            <Text style={styles.createNftBtnText}>Create NFT</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Row at bottom of hero section */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>7K+</Text>
            <Text style={styles.statLabel}>Artworks</Text>
          </View>

          <View style={styles.statSeparator} />

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>1K+</Text>
            <Text style={styles.statLabel}>Artists</Text>
          </View>

          <View style={styles.statSeparator} />

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>250K+</Text>
            <Text style={styles.statLabel}>Active users</Text>
          </View>
        </View>

        {/* Extra branding section at bottom */}
        <View style={styles.brandingCard}>
          {/* Logo icons: signal waves, heart, plus icons */}
          <View style={styles.logoIconsRow}>
            <Ionicons name="wifi-outline" size={20} color={Colors.teal || '#00bcd4'} style={styles.brandLogoIcon} />
            <Ionicons name="heart-outline" size={20} color={Colors.pink || '#ec4899'} style={styles.brandLogoIcon} />
            <Ionicons name="add-outline" size={22} color={Colors.cyan || '#00d4ff'} style={styles.brandLogoIcon} />
          </View>

          {/* 'UTOPIAN EXCHANGE' in white bold */}
          <Text style={styles.brandMainTitle}>UTOPIAN EXCHANGE</Text>

          {/* 'Art Commercialisation' in italic gray */}
          <Text style={styles.brandTaglineItalic}>Art Commercialisation</Text>

          {/* 'Digital Ideas Meet Physical NFTs' in white */}
          <Text style={styles.brandFeatureText}>Digital Ideas Meet Physical NFTs</Text>

          {/* 'Prototype developement post 2 SBU release' in small text */}
          <Text style={styles.prototypeNoticeText}>
            Prototype developement post 2 SBU release
          </Text>

          {/* 'CONFIDENTIAL. 2024 Next Archer' footer */}
          <View style={styles.brandingFooter}>
            <Text style={styles.confidentialFooterText}>
              CONFIDENTIAL. 2024 Next Archer
            </Text>
          </View>
        </View>
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
  topHeaderBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    zIndex: 10,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingBottom: 36,
  },
  topDecorativeArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  iconScatteredBox: {
    width: 260,
    height: 140,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scatteredIcon: {
    position: 'absolute',
  },
  tealDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.teal || '#00bcd4',
    shadowColor: Colors.teal || '#00bcd4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
  },
  tealDotSmall: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.cyan || '#00d4ff',
    opacity: 0.8,
  },
  centralEmblemHalo: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 188, 212, 0.4)',
    backgroundColor: 'rgba(0, 188, 212, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.teal || '#00bcd4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  centralEmblemInner: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#121225',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 188, 212, 0.3)',
  },
  titleSection: {
    marginBottom: 24,
  },
  largeTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.textWhite || '#ffffff',
    lineHeight: 34,
    marginBottom: 12,
    textAlign: 'left',
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textGray || '#a0a0b0',
    lineHeight: 22,
    textAlign: 'left',
  },
  buttonsContainer: {
    marginVertical: 12,
    gap: 14,
  },
  startCollectingBtn: {
    width: '100%',
    height: 50,
    backgroundColor: Colors.teal || '#00bcd4',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.teal || '#00bcd4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  startCollectingBtnText: {
    color: Colors.textWhite || '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.4,
  },
  createNftBtn: {
    width: '100%',
    height: 50,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.teal || '#00bcd4',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createNftBtnText: {
    color: Colors.textWhite || '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.cardDark || '#1a1a2e',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.textWhite || '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textGray || '#a0a0b0',
    fontWeight: '500',
  },
  statSeparator: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  brandingCard: {
    backgroundColor: Colors.cardDarker || '#12121f',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 188, 212, 0.15)',
    marginTop: 8,
  },
  logoIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 12,
  },
  brandLogoIcon: {
    marginHorizontal: 4,
  },
  brandMainTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textWhite || '#ffffff',
    letterSpacing: 2,
    marginBottom: 4,
  },
  brandTaglineItalic: {
    fontSize: 14,
    fontStyle: 'italic',
    color: Colors.textGray || '#a0a0b0',
    marginBottom: 8,
  },
  brandFeatureText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textWhite || '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
  },
  prototypeNoticeText: {
    fontSize: 12,
    color: Colors.textMuted || '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  brandingFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 12,
    width: '100%',
    alignItems: 'center',
  },
  confidentialFooterText: {
    fontSize: 11,
    color: Colors.textGray || '#a0a0b0',
    letterSpacing: 1,
    fontWeight: '500',
  },
});

export default UtopianExchangeScreen;
