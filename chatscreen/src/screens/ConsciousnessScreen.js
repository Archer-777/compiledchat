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
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Fonts } from '../theme/fonts';

const ConsciousnessScreen = ({ navigation }) => {
  const handleBackToChat = () => {
    if (navigation && navigation.goBack) {
      navigation.goBack();
    } else if (navigation && navigation.navigate) {
      navigation.navigate('AIChatDark');
    } else {
      Alert.alert('Navigation', 'Navigating Back to Chat');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.backgroundDark} />
      
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackToChat}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textWhite} />
        </TouchableOpacity>
        
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>09:12</Text>
        </View>

        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Center: Large Brain Visualization */}
        <View style={styles.brainSection}>
          <View style={styles.brainContainer}>
            {/* Concentric Aura Rings */}
            <View style={styles.outerRing} />
            <View style={styles.middleRing} />
            <View style={styles.innerRing} />

            {/* Scattered Cyan Neural Connection Dots */}
            <View style={[styles.dot, { top: 15, left: 35, width: 6, height: 6, opacity: 0.9 }]} />
            <View style={[styles.dot, { top: 25, right: 30, width: 8, height: 8, opacity: 0.8 }]} />
            <View style={[styles.dot, { top: 75, left: 15, width: 5, height: 5, opacity: 1.0 }]} />
            <View style={[styles.dot, { top: 60, right: 15, width: 7, height: 7, opacity: 0.85 }]} />
            <View style={[styles.dot, { top: 120, left: 25, width: 9, height: 9, opacity: 0.75 }]} />
            <View style={[styles.dot, { top: 135, right: 35, width: 6, height: 6, opacity: 0.95 }]} />
            <View style={[styles.dot, { bottom: 35, left: 45, width: 7, height: 7, opacity: 0.8 }]} />
            <View style={[styles.dot, { bottom: 25, right: 50, width: 5, height: 5, opacity: 1.0 }]} />
            <View style={[styles.dot, { top: 190, left: 65, width: 8, height: 8, opacity: 0.7 }]} />
            <View style={[styles.dot, { top: 195, right: 70, width: 6, height: 6, opacity: 0.9 }]} />
            <View style={[styles.dot, { top: 10, left: 110, width: 10, height: 10, opacity: 0.6 }]} />
            <View style={[styles.dot, { bottom: 15, left: 115, width: 7, height: 7, opacity: 0.85 }]} />
            <View style={[styles.dot, { top: 90, left: 5, width: 4, height: 4, opacity: 0.9 }]} />
            <View style={[styles.dot, { top: 100, right: 5, width: 6, height: 6, opacity: 0.75 }]} />

            {/* Neural Connection Lines */}
            <View style={[styles.neuralLine, { top: 40, left: 40, width: 50, transform: [{ rotate: '25deg' }] }]} />
            <View style={[styles.neuralLine, { top: 140, right: 35, width: 45, transform: [{ rotate: '-35deg' }] }]} />
            <View style={[styles.neuralLine, { bottom: 50, left: 50, width: 60, transform: [{ rotate: '-15deg' }] }]} />

            {/* Brain Icon */}
            <MaterialCommunityIcons
              name="brain"
              size={150}
              color={Colors.cyan}
              style={styles.brainIcon}
            />
          </View>
        </View>

        {/* Title & Description */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>Consciousness Awareness</Text>
          
          <Text style={styles.description}>
            The user will get a notification to engage in deep philosophical conversations,
            which will form new patterns and enlighten neurons. This can be seen on the user dashboard after 7 minutes.
          </Text>

          {/* Secondary Text Card */}
          <TouchableOpacity
            style={styles.secondaryCard}
            activeOpacity={0.8}
            onPress={() => Alert.alert('Work Consciousness', 'Syncing consciousness mapping data...')}
          >
            <MaterialCommunityIcons
              name="brain-sync-outline"
              size={24}
              color={Colors.cyan}
              style={styles.cardIcon}
            />
            <Text style={styles.secondaryText}>
              Download work consciousness while it maps users consciousness for clarity of user
            </Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.backButtonBordered}
            onPress={handleBackToChat}
            activeOpacity={0.85}
          >
            <Ionicons name="chatbubbles-outline" size={20} color={Colors.cyan} style={styles.buttonIcon} />
            <Text style={styles.backButtonText}>Back to Chat</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.backgroundDark,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 20 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  backButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: Colors.cardDark,
  },
  timeContainer: {
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.25)',
  },
  timeText: {
    color: Colors.cyan,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1,
  },
  headerRightPlaceholder: {
    width: 36,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  brainSection: {
    marginVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brainContainer: {
    width: 250,
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  outerRing: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.15)',
    borderStyle: 'dashed',
  },
  middleRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 212, 255, 0.25)',
  },
  innerRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(0, 212, 255, 0.04)',
  },
  brainIcon: {
    opacity: 0.7,
    shadowColor: Colors.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  dot: {
    position: 'absolute',
    borderRadius: 10,
    backgroundColor: Colors.cyan,
    shadowColor: Colors.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },
  neuralLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: 'rgba(0, 212, 255, 0.3)',
  },
  textContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: Fonts.poppins,
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textWhite,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  description: {
    fontFamily: Fonts.inter,
    fontSize: 14,
    color: Colors.textGray,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
    marginBottom: 20,
  },
  secondaryCard: {
    width: '100%',
    backgroundColor: Colors.cardDark,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    marginRight: 12,
  },
  secondaryText: {
    fontFamily: Fonts.inter,
    flex: 1,
    fontSize: 13,
    color: Colors.textWhite,
    lineHeight: 19,
    fontWeight: '400',
  },
  buttonContainer: {
    width: '100%',
    marginTop: 10,
  },
  dashboardButton: {
    backgroundColor: Colors.cyan,
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: Colors.cyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  dashboardButtonText: {
    fontFamily: Fonts.poppins,
    color: Colors.backgroundDark,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  backButtonBordered: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.cyan,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontFamily: Fonts.poppins,
    color: Colors.cyan,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  buttonIcon: {
    marginRight: 8,
  },
});

export default ConsciousnessScreen;
