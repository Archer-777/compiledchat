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
  Image,
} from 'react-native';
import { FontAwesome, MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const SuperchargeScreen = ({ navigation }) => {
  const [selectedFeature, setSelectedFeature] = useState(null);

  const handleStartSupercharge = () => {
    if (navigation && navigation.navigate) {
      navigation.navigate('AuraScanner');
    } else {
      Alert.alert('Aura Scanner', 'Navigating to Aura Scanner');
    }
  };

  const features = [
    {
      id: '1',
      icon: 'lightning-bolt',
      iconFamily: 'MaterialCommunityIcons',
      title: 'Under 10-Min Micro Tasks',
      desc: 'Complete quick AI tasks to build steady passive earnings.',
    },
    {
      id: '2',
      icon: 'trending-up',
      iconFamily: 'MaterialIcons',
      title: 'Automated Yield',
      desc: 'Let AI optimize your free time into high-value streams.',
    },
    {
      id: '3',
      icon: 'shield-checkmark',
      iconFamily: 'Ionicons',
      title: 'Zero Capital Required',
      desc: '100% free entrance with instant payout setup.',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Center: Official Logo Header */}
        <View style={styles.logoSection}>
          <View style={styles.logoGlowContainer}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Title & Subtitle */}
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Additional Supercharge</Text>
          <Text style={styles.subtitle}>
            Get passive income with free time under 10 minutes
          </Text>
        </View>

        {/* Circular Icons Row */}
        <View style={styles.iconRow}>
          {/* Left Circle: Passive Income */}
          <TouchableOpacity
            style={styles.circleItem}
            activeOpacity={0.8}
            onPress={() => Alert.alert('Passive Income', 'Passive income tools activated.')}
          >
            <View style={styles.goldCircleContainer}>
              <View style={styles.goldCircle}>
                <FontAwesome name="dollar" size={32} color="#ffe57f" />
              </View>
            </View>
            <Text style={styles.circleLabel}>PASSIVE INCOME</Text>
            <Text style={styles.circleSubtext}>&lt; 10 Mins / Day</Text>
          </TouchableOpacity>

          {/* Right Circle: Download / Free */}
          <TouchableOpacity
            style={styles.circleItem}
            activeOpacity={0.8}
            onPress={() => Alert.alert('Free Rewards', 'Downloading free supercharge pack...')}
          >
            <View style={styles.cyanCircleContainer}>
              <View style={styles.cyanCircle}>
                <MaterialIcons name="file-download" size={36} color="#00e5ff" />
              </View>
              {/* Green FREE Badge */}
              <View style={styles.freeBadge}>
                <Text style={styles.freeBadgeText}>FREE</Text>
              </View>
            </View>
            <Text style={styles.circleLabel}>FREE DOWNLOAD</Text>
            <Text style={styles.circleSubtext}>Instant Access</Text>
          </TouchableOpacity>
        </View>

        {/* Feature Cards Section */}
        <View style={styles.featureSection}>
          <Text style={styles.sectionHeader}>SUPERCHARGE HIGHLIGHTS</Text>
          {features.map((item) => {
            const isSelected = selectedFeature === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.featureCard, isSelected && styles.featureCardSelected]}
                onPress={() => setSelectedFeature(isSelected ? null : item.id)}
                activeOpacity={0.85}
              >
                <View style={styles.featureIconBox}>
                  {item.iconFamily === 'MaterialCommunityIcons' && (
                    <MaterialCommunityIcons name={item.icon} size={22} color="#00e5ff" />
                  )}
                  {item.iconFamily === 'MaterialIcons' && (
                    <MaterialIcons name={item.icon} size={22} color="#ffe57f" />
                  )}
                  {item.iconFamily === 'Ionicons' && (
                    <Ionicons name={item.icon} size={22} color="#10b981" />
                  )}
                </View>
                <View style={styles.featureTextContent}>
                  <Text style={styles.featureTitle}>{item.title}</Text>
                  <Text style={styles.featureDesc}>{item.desc}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Social Share Section */}
        <View style={styles.socialShareCard}>
          <View style={styles.socialShareHeaderRow}>
            <Ionicons name="share-social" size={20} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.socialShareTitle}>SHARE YOUR AURA SCORE</Text>
          </View>
          <Text style={styles.socialShareDesc}>
            Broadcast your 98.4% Transcendent Aura Field directly to Instagram & Snapchat Stories!
          </Text>

          <View style={styles.socialShareButtonsRow}>
            <TouchableOpacity
              style={styles.instaShareBtn}
              activeOpacity={0.85}
              onPress={() => {
                if (navigation && navigation.navigate) {
                  navigation.navigate('AuraScanner');
                } else {
                  Alert.alert('Instagram Story', 'Navigating to Aura Scanner to generate Instagram Story');
                }
              }}
            >
              <Ionicons name="logo-instagram" size={18} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.instaShareBtnText}>Instagram Story</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.snapShareBtn}
              activeOpacity={0.85}
              onPress={() => {
                if (navigation && navigation.navigate) {
                  navigation.navigate('AuraScanner');
                } else {
                  Alert.alert('Snapchat Story', 'Navigating to Aura Scanner to generate Snapchat Story');
                }
              }}
            >
              <Ionicons name="logo-snapchat" size={18} color="#000000" style={{ marginRight: 6 }} />
              <Text style={styles.snapShareBtnText}>Snapchat Story</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Primary Action Button */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleStartSupercharge}
            activeOpacity={0.85}
          >
            <Ionicons name="sparkles" size={20} color="#000000" style={styles.btnIcon} />
            <Text style={styles.primaryButtonText}>Start Supercharging</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Text */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            I AM NOT PERFECT. LET'S TRANSCEND CONSCIOUSNESS
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    alignItems: 'center',
  },
  logoSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  logoGlowContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  logoImage: {
    width: 44,
    height: 44,
  },
  headerTextContainer: {
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  title: {
    color: '#ffffff',
    fontSize: 19,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 3,
    letterSpacing: 0.8,
  },
  subtitle: {
    color: '#888888',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 14,
  },
  circleItem: {
    alignItems: 'center',
    flex: 1,
  },
  goldCircleContainer: {
    position: 'relative',
    marginBottom: 6,
  },
  goldCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 229, 127, 0.4)',
    backgroundColor: 'rgba(255, 229, 127, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ffe57f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  cyanCircleContainer: {
    position: 'relative',
    marginBottom: 6,
  },
  cyanCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 229, 255, 0.4)',
    backgroundColor: 'rgba(0, 229, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  freeBadge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: '#10b981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#000000',
    elevation: 4,
  },
  freeBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  circleLabel: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  circleSubtext: {
    color: '#6b7280',
    fontSize: 10,
    textAlign: 'center',
  },
  featureSection: {
    width: '100%',
    marginBottom: 14,
  },
  sectionHeader: {
    color: '#6b7280',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featureCardSelected: {
    borderColor: '#00e5ff',
    backgroundColor: 'rgba(0, 229, 255, 0.06)',
  },
  featureIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featureTextContent: {
    flex: 1,
  },
  featureTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 1,
  },
  featureDesc: {
    color: '#888888',
    fontSize: 11,
    lineHeight: 14,
  },
  actionSection: {
    width: '100%',
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  btnIcon: {
    marginRight: 8,
  },
  primaryButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  footerContainer: {
    paddingVertical: 4,
    alignItems: 'center',
  },
  footerText: {
    color: '#555555',
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 1.1,
    textAlign: 'center',
  },
  socialShareCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  socialShareHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  socialShareTitle: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  socialShareDesc: {
    color: '#aaaaaa',
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 8,
  },
  socialShareButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  instaShareBtn: {
    flex: 1,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#E1306C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  instaShareBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  snapShareBtn: {
    flex: 1,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFFC00',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  snapShareBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default SuperchargeScreen;
