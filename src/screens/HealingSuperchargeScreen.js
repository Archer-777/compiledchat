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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

const HealingSuperchargeScreen = ({ navigation }) => {
  const [messageText, setMessageText] = useState('');

  const handleContinueToClarity = () => {
    if (navigation && navigation.navigate) {
      navigation.navigate('ClarityOnDemand');
    } else {
      Alert.alert('Navigation', 'Navigating to Clarity On Demand');
    }
  };

  const handleBack = () => {
    if (navigation && navigation.goBack) {
      navigation.goBack();
    } else if (navigation && navigation.navigate) {
      navigation.navigate('HealMe');
    } else {
      Alert.alert('Navigation', 'Going Back');
    }
  };

  const handleSendMessage = () => {
    if (messageText.trim().length > 0) {
      Alert.alert('Supercharge Active', `Transmitting frequency message: "${messageText}"`);
      setMessageText('');
    } else {
      Alert.alert('Input Required', 'Please enter a message for instant healing.');
    }
  };

  return (
    <LinearGradient
      colors={[Colors.purpleDark, Colors.purple]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.purpleDark} />

        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.textWhite} />
          </TouchableOpacity>

          {/* Header Cyan/Teal Banner Badge */}
          <View style={styles.badgeBanner}>
            <Ionicons name="flash-outline" size={14} color={Colors.cyan} style={{ marginRight: 4 }} />
            <Text style={styles.badgeText}>10th minute - Supercharge</Text>
          </View>

          <View style={styles.headerRightPlaceholder} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Subtitle */}
          <Text style={styles.subtitle}>Instant online spiritual healing</Text>

          {/* Section: Premium label in gold & Heal Me Quickly title */}
          <View style={styles.sectionHeader}>
            <View style={styles.goldBadge}>
              <Text style={styles.goldBadgeText}>PREMIUM</Text>
            </View>
            <Text style={styles.sectionTitle}>Heal Me Quickly</Text>
          </View>

          {/* Center OM Symbol Diamond (Smaller size) */}
          <View style={styles.omCenterContainer}>
            <View style={styles.omOuterGlow}>
              <View style={styles.omDiamondSmall}>
                <View style={styles.omTextContainer}>
                  <Text style={styles.omTextSmall}>ॐ</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Third Eye Chakra Description Text */}
          <View style={styles.chakraTextContainer}>
            <Text style={styles.chakraText}>
              The Third Eye Chakra, Indigo in color, relates to intuition, perception, and spiritual awareness.
            </Text>
          </View>

          {/* Music Note Icon + Heart Chakra frequency text */}
          <View style={styles.frequencyContainer}>
            <Ionicons name="musical-note" size={22} color={Colors.goldLight} style={styles.musicIcon} />
            <Text style={styles.frequencyText}>Heart Chakra (frequency 639 Hz)</Text>
          </View>

          {/* Experience Audio Visuals Box */}
          <View style={styles.audioVisualsBox}>
            <Text style={styles.boxTitle}>Experience Audio Visuals</Text>

            {/* Headphone Container (Large icon) */}
            <TouchableOpacity
              style={styles.mediaItemContainer}
              activeOpacity={0.8}
              onPress={() => Alert.alert('Audio Frequency', 'Playing 639 Hz Heart Chakra Audio')}
            >
              <View style={styles.iconBorderedBox}>
                <Ionicons name="headphones" size={32} color={Colors.textWhite} />
              </View>
              <View style={styles.mediaItemTextContainer}>
                <Text style={styles.mediaItemTitle}>639 Hz Audio Frequencies</Text>
                <Text style={styles.mediaItemSub}>Tap to immerse in healing sound waves</Text>
              </View>
              <Ionicons name="play-circle-outline" size={24} color={Colors.goldLight} />
            </TouchableOpacity>

            {/* Eye Container (Below) */}
            <TouchableOpacity
              style={styles.mediaItemContainer}
              activeOpacity={0.8}
              onPress={() => Alert.alert('Visual Meditation', 'Opening Third Eye Chakra Visuals')}
            >
              <View style={styles.iconBorderedBox}>
                <Ionicons name="eye" size={28} color={Colors.textWhite} />
              </View>
              <View style={styles.mediaItemTextContainer}>
                <Text style={styles.mediaItemTitle}>Third Eye Visual Meditation</Text>
                <Text style={styles.mediaItemSub}>Tap to align chakra perception</Text>
              </View>
              <Ionicons name="sparkles-outline" size={24} color={Colors.cyan} />
            </TouchableOpacity>
          </View>

          {/* Continue to Clarity Button */}
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinueToClarity}
            activeOpacity={0.85}
          >
            <Text style={styles.continueButtonText}>Continue to Clarity</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.backgroundDark} style={styles.continueIcon} />
          </TouchableOpacity>
        </ScrollView>

        {/* Bottom Message Input Bar */}
        <View style={styles.inputBarContainer}>
          <View style={styles.inputWrapper}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color={Colors.goldLight} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Ask for supercharge healing..."
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              value={messageText}
              onChangeText={setMessageText}
              onSubmitEditing={handleSendMessage}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendMessage}
              activeOpacity={0.7}
            >
              <Ionicons name="paper-plane" size={18} color={Colors.cyan} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>I AM NOT PERFECT. LET'S TRANSCEND CONSCIOUSNESS</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 20 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  badgeBanner: {
    backgroundColor: 'rgba(0, 212, 255, 0.2)',
    borderWidth: 1,
    borderColor: Colors.cyan,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeText: {
    color: Colors.cyan,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  headerRightPlaceholder: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  subtitle: {
    color: Colors.textWhite,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
    opacity: 0.9,
  },
  sectionHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  goldBadge: {
    backgroundColor: 'rgba(212, 160, 23, 0.2)',
    borderWidth: 1,
    borderColor: Colors.gold,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 6,
  },
  goldBadgeText: {
    color: Colors.goldLight,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.textWhite,
    textAlign: 'center',
  },
  omCenterContainer: {
    marginVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  omOuterGlow: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(240, 192, 64, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  omDiamondSmall: {
    width: 70,
    height: 70,
    backgroundColor: Colors.purple,
    transform: [{ rotate: '45deg' }],
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.goldLight,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 6,
  },
  omTextContainer: {
    transform: [{ rotate: '-45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  omTextSmall: {
    color: Colors.textWhite,
    fontSize: 38,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  chakraTextContainer: {
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  chakraText: {
    color: Colors.textWhite,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '400',
  },
  frequencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 10, 26, 0.35)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(240, 192, 64, 0.4)',
    marginBottom: 20,
  },
  musicIcon: {
    marginRight: 8,
  },
  frequencyText: {
    color: Colors.goldLight,
    fontSize: 14,
    fontWeight: '600',
  },
  audioVisualsBox: {
    width: '100%',
    backgroundColor: 'rgba(10, 10, 26, 0.45)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 16,
    marginBottom: 20,
  },
  boxTitle: {
    color: Colors.textWhite,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 14,
    letterSpacing: 0.5,
  },
  mediaItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    padding: 12,
    marginBottom: 10,
  },
  iconBorderedBox: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 12,
  },
  mediaItemTextContainer: {
    flex: 1,
  },
  mediaItemTitle: {
    color: Colors.textWhite,
    fontSize: 14,
    fontWeight: '600',
  },
  mediaItemSub: {
    color: Colors.textGray,
    fontSize: 11,
    marginTop: 2,
  },
  continueButton: {
    width: '100%',
    backgroundColor: Colors.cyan,
    borderRadius: 16,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: Colors.cyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  continueButtonText: {
    color: Colors.backgroundDark,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  continueIcon: {
    marginLeft: 6,
  },
  inputBarContainer: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 4,
  },
  inputWrapper: {
    backgroundColor: 'rgba(10, 10, 26, 0.6)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 6,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    color: Colors.textWhite,
    fontSize: 14,
    paddingVertical: 6,
  },
  sendButton: {
    padding: 6,
  },
  footerContainer: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    letterSpacing: 1.5,
  },
});

export default HealingSuperchargeScreen;
