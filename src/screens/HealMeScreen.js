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

const HealMeScreen = ({ navigation }) => {
  const [messageText, setMessageText] = useState('');

  const handleStartHealing = () => {
    if (navigation && navigation.navigate) {
      navigation.navigate('HealingSupercharge');
    } else {
      Alert.alert('Healing Session', 'Navigating to Healing Supercharge');
    }
  };

  const handleBack = () => {
    if (navigation && navigation.goBack) {
      navigation.goBack();
    } else if (navigation && navigation.navigate) {
      navigation.navigate('Home');
    } else {
      Alert.alert('Navigation', 'Going Back');
    }
  };

  const handleSendMessage = () => {
    if (messageText.trim().length > 0) {
      Alert.alert('Healing Connection', `Message sent to chakra network: "${messageText}"`);
      setMessageText('');
    } else {
      Alert.alert('Healing Input', 'Please type a feeling or thought to send.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.backgroundDark} />
      
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

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Heal Me Quickly</Text>
          <Text style={styles.headerSubtitle}>Universal Energy</Text>
        </View>

        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Center: OM Symbol Representation & Scattered Stars */}
        <View style={styles.centerSection}>
          {/* Decorative Star Dots */}
          <Ionicons name="sparkles" size={16} color={Colors.goldLight} style={[styles.starDot, { top: 10, left: 20 }]} />
          <Ionicons name="sparkles" size={12} color={Colors.cyan} style={[styles.starDot, { top: 30, right: 35 }]} />
          <Ionicons name="star" size={10} color={Colors.purpleLight} style={[styles.starDot, { top: 110, left: 15 }]} />
          <Ionicons name="sparkles" size={14} color={Colors.pink} style={[styles.starDot, { top: 150, right: 20 }]} />
          <Ionicons name="star" size={12} color={Colors.gold} style={[styles.starDot, { bottom: 20, left: 40 }]} />
          <Ionicons name="sparkles" size={18} color={Colors.cyan} style={[styles.starDot, { bottom: 35, right: 45 }]} />
          <Ionicons name="star" size={8} color={Colors.textWhite} style={[styles.starDot, { top: 5, right: 100 }]} />
          <Ionicons name="sparkles" size={10} color={Colors.purpleLight} style={[styles.starDot, { bottom: 10, left: 110 }]} />

          {/* Aura Rings Container */}
          <View style={styles.auraOuterRing}>
            <View style={styles.auraMiddleRing}>
              {/* Rotated Purple Diamond with OM Symbol */}
              <View style={styles.omDiamond}>
                <View style={styles.omTextContainer}>
                  <Text style={styles.omText}>ॐ</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Description Text */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}>
            If a person is going through deep pain and talks about grief, this healing screen will replace the center of their aura, and the conversation will happen in focused chakras.
          </Text>
        </View>

        {/* Start Healing Session Button */}
        <TouchableOpacity
          style={styles.buttonWrapper}
          onPress={handleStartHealing}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[Colors.purpleLight, Colors.purple, Colors.purpleDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientButton}
          >
            <Ionicons name="flash" size={20} color={Colors.textWhite} style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Start Healing Session</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Message Input Bar */}
      <View style={styles.inputBarContainer}>
        <View style={styles.inputWrapper}>
          <Ionicons name="heart-outline" size={20} color={Colors.purpleLight} style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="Express your grief or feelings..."
            placeholderTextColor={Colors.textMuted}
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
            <Ionicons name="send" size={18} color={Colors.cyan} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer Text */}
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>I AM NOT PERFECT. LET'S TRANSCEND CONSCIOUSNESS</Text>
      </View>
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
    padding: 8,
    borderRadius: 20,
    backgroundColor: Colors.cardDark,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textWhite,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.purpleLight,
    textAlign: 'center',
    marginTop: 2,
  },
  headerRightPlaceholder: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  centerSection: {
    marginVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: 260,
    height: 260,
  },
  starDot: {
    position: 'absolute',
    opacity: 0.85,
  },
  auraOuterRing: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.25)',
    backgroundColor: 'rgba(124, 58, 237, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  auraMiddleRing: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1.5,
    borderColor: 'rgba(168, 85, 247, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
  },
  omDiamond: {
    width: 110,
    height: 110,
    backgroundColor: Colors.purple,
    transform: [{ rotate: '45deg' }],
    borderRadius: 22,
    borderWidth: 2,
    borderColor: Colors.purpleLight,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.purpleLight,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 16,
    elevation: 8,
  },
  omTextContainer: {
    transform: [{ rotate: '-45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  omText: {
    color: Colors.textWhite,
    fontSize: 60,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 65,
  },
  descriptionContainer: {
    width: '100%',
    paddingHorizontal: 8,
    marginBottom: 28,
  },
  descriptionText: {
    fontSize: 14,
    color: Colors.textGray,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonWrapper: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 10,
    shadowColor: Colors.purpleLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  gradientButton: {
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: Colors.textWhite,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  inputBarContainer: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 6,
  },
  inputWrapper: {
    backgroundColor: Colors.cardDark,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.4)',
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
    paddingVertical: 12,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
    textAlign: 'center',
    letterSpacing: 1.5,
  },
});

export default HealMeScreen;
