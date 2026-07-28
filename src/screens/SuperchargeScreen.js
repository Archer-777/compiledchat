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
import { FontAwesome, MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const SuperchargeScreen = ({ navigation }) => {
  const [selectedFeature, setSelectedFeature] = useState(null);

  const handleStartChat = () => {
    if (navigation && navigation.navigate) {
      navigation.navigate('AIChatLight');
    } else {
      Alert.alert('Navigation', 'Navigating to AIChatLight');
    }
  };

  const handleExploreFeatures = () => {
    if (navigation && navigation.navigate) {
      navigation.navigate('Dashboard');
    } else {
      Alert.alert('Explore Features', 'Navigating to Dashboard');
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
      <StatusBar barStyle="light-content" backgroundColor="#0a0a1a" />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Center: Golden Halo Ring with AI & Smile */}
        <View style={styles.haloSection}>
          <View style={styles.haloGlowOuter}>
            <View style={styles.haloRing}>
              <Text style={styles.aiText}>AI</Text>
              {/* Smile Curve Arc */}
              <View style={styles.smileContainer}>
                <View style={styles.smileCurve} />
              </View>
            </View>
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
                <FontAwesome name="dollar" size={34} color="#d4a017" />
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
                <MaterialIcons name="file-download" size={38} color="#00d4ff" />
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
                    <MaterialCommunityIcons name={item.icon} size={24} color="#00d4ff" />
                  )}
                  {item.iconFamily === 'MaterialIcons' && (
                    <MaterialIcons name={item.icon} size={24} color="#f0c040" />
                  )}
                  {item.iconFamily === 'Ionicons' && (
                    <Ionicons name={item.icon} size={24} color="#10b981" />
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

        {/* Bottom Actions */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleStartChat}
            activeOpacity={0.85}
          >
            <Ionicons name="chatbubbles-outline" size={20} color="#0a0a1a" style={styles.btnIcon} />
            <Text style={styles.primaryButtonText}>Start Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleExploreFeatures}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="compass-outline" size={20} color="#00d4ff" style={styles.btnIcon} />
            <Text style={styles.secondaryButtonText}>Explore Features</Text>
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
    backgroundColor: '#0a0a1a',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
    alignItems: 'center',
  },
  haloSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  haloGlowOuter: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(212, 160, 23, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 160, 23, 0.3)',
  },
  haloRing: {
    width: 106,
    height: 106,
    borderRadius: 53,
    borderWidth: 3.5,
    borderColor: '#d4a017',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#12121f',
    shadowColor: '#d4a017',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 8,
  },
  aiText: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginTop: -4,
  },
  smileContainer: {
    width: 36,
    height: 14,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 2,
  },
  smileCurve: {
    width: 30,
    height: 12,
    borderBottomWidth: 3,
    borderColor: '#f0c040',
    borderRadius: 15,
  },
  headerTextContainer: {
    alignItems: 'center',
    marginBottom: 28,
    paddingHorizontal: 10,
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    color: '#a0a0b0',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 32,
  },
  circleItem: {
    alignItems: 'center',
    flex: 1,
  },
  goldCircleContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  goldCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2.5,
    borderColor: '#d4a017',
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#d4a017',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  cyanCircleContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  cyanCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2.5,
    borderColor: '#00d4ff',
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  freeBadge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#0a0a1a',
    elevation: 4,
  },
  freeBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  circleLabel: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  circleSubtext: {
    color: '#6b7280',
    fontSize: 11,
    textAlign: 'center',
  },
  featureSection: {
    width: '100%',
    marginBottom: 32,
  },
  sectionHeader: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#12121f',
  },
  featureCardSelected: {
    borderColor: '#00d4ff',
    backgroundColor: '#12121f',
  },
  featureIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  featureTextContent: {
    flex: 1,
  },
  featureTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 3,
  },
  featureDesc: {
    color: '#a0a0b0',
    fontSize: 12,
    lineHeight: 16,
  },
  actionSection: {
    width: '100%',
    gap: 12,
    marginBottom: 28,
  },
  primaryButton: {
    backgroundColor: '#00d4ff',
    borderRadius: 28,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  btnIcon: {
    marginRight: 8,
  },
  primaryButtonText: {
    color: '#0a0a1a',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: 28,
    height: 52,
    borderWidth: 1.5,
    borderColor: '#00d4ff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  footerContainer: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  footerText: {
    color: '#6b7280',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1.1,
    textAlign: 'center',
  },
});

export default SuperchargeScreen;
