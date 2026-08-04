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
      navigation.navigate('Register');
    } else {
      Alert.alert('Registration', 'Navigating to Registration Screen');
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
        {/* Upper Main Body Container */}
        <View style={styles.topBodyContainer}>
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
                  <FontAwesome name="dollar" size={34} color="#ffe57f" />
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
                  <MaterialIcons name="file-download" size={38} color="#00e5ff" />
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
        </View>

        {/* Lower Action & Footer Container */}
        <View style={styles.bottomContainer}>
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
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topBodyContainer: {
    width: '100%',
    alignItems: 'center',
  },
  bottomContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  logoSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 16,
  },
  logoGlowContainer: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 229, 255, 0.3)',
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 10,
  },
  logoImage: {
    width: 48,
    height: 48,
  },
  headerTextContainer: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 0.8,
  },
  subtitle: {
    color: '#9ca3af',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 24,
  },
  circleItem: {
    alignItems: 'center',
    flex: 1,
  },
  goldCircleContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  goldCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 229, 127, 0.45)',
    backgroundColor: 'rgba(255, 229, 127, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ffe57f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  cyanCircleContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  cyanCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 229, 255, 0.45)',
    backgroundColor: 'rgba(0, 229, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  freeBadge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: '#10b981',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 9,
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
    marginBottom: 10,
  },
  sectionHeader: {
    color: '#6b7280',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featureCardSelected: {
    borderColor: '#00e5ff',
    backgroundColor: 'rgba(0, 229, 255, 0.06)',
  },
  featureIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featureTextContent: {
    flex: 1,
  },
  featureTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  featureDesc: {
    color: '#9ca3af',
    fontSize: 12,
    lineHeight: 16,
  },
  actionSection: {
    width: '100%',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#ffffff',
    borderRadius: 25,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  btnIcon: {
    marginRight: 8,
  },
  primaryButtonText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  footerContainer: {
    paddingVertical: 6,
    alignItems: 'center',
  },
  footerText: {
    color: '#4b5563',
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 1.1,
    textAlign: 'center',
  },
});

export default SuperchargeScreen;
