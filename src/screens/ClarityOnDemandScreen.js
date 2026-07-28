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
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

const ClarityOnDemandScreen = ({ navigation }) => {
  // Interaction Selection State
  const [selectedInteraction, setSelectedInteraction] = useState('voice');
  // Time selection (minutes)
  const [sliderValue, setSliderValue] = useState(11); // default 11:11
  // Media Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0.35); // 35% complete

  const handleStartSession = () => {
    if (navigation && navigation.navigate) {
      navigation.navigate('LetsMatrix');
    } else {
      Alert.alert('Session Started', 'Navigating to LetsMatrix screen');
    }
  };

  const formattedTime = `${sliderValue < 10 ? '0' + sliderValue : sliderValue}:${sliderValue < 10 ? '0' + sliderValue : sliderValue}`;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      {/* Top Bar Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation && navigation.goBack ? navigation.goBack() : Alert.alert('Back', 'Navigating back')}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Clarity on Demand</Text>
        <TouchableOpacity
          style={styles.infoButton}
          onPress={() => Alert.alert('Information', 'Clarity on Demand session guide for travelling.')}
          activeOpacity={0.7}
        >
          <Ionicons name="information-circle-outline" size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Title Screen Banner */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>Clarity on Demand while travelling</Text>
          <Text style={styles.subTitle}>
            Tune into inner peace, focused thoughts, and harmonious frequency anywhere.
          </Text>
        </View>

        {/* STEP 1: Select Interactions */}
        <View style={styles.stepCard}>
          <View style={styles.stepHeader}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>1</Text>
            </View>
            <Text style={styles.stepTitle}>Step 1 - Select Interactions</Text>
          </View>

          <View style={styles.interactionRow}>
            {/* Voice Option */}
            <TouchableOpacity
              style={[
                styles.interactionOption,
                selectedInteraction === 'voice' && styles.interactionOptionSelected,
              ]}
              onPress={() => setSelectedInteraction('voice')}
              activeOpacity={0.8}
            >
              <View style={styles.iconCircle}>
                <Ionicons
                  name="mic-outline"
                  size={26}
                  color={selectedInteraction === 'voice' ? '#00bcd4' : '#6b7280'}
                />
              </View>
              <Text
                style={[
                  styles.optionLabel,
                  selectedInteraction === 'voice' && styles.optionLabelSelected,
                ]}
              >
                Voice
              </Text>
              {/* Circular checkbox */}
              <View
                style={[
                  styles.checkboxCircle,
                  selectedInteraction === 'voice' && styles.checkboxCircleSelected,
                ]}
              >
                {selectedInteraction === 'voice' && (
                  <Ionicons name="checkmark" size={14} color="#ffffff" />
                )}
              </View>
            </TouchableOpacity>

            {/* Vibration Option */}
            <TouchableOpacity
              style={[
                styles.interactionOption,
                selectedInteraction === 'vibration' && styles.interactionOptionSelected,
              ]}
              onPress={() => setSelectedInteraction('vibration')}
              activeOpacity={0.8}
            >
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons
                  name="vibrate"
                  size={26}
                  color={selectedInteraction === 'vibration' ? '#00bcd4' : '#6b7280'}
                />
              </View>
              <Text
                style={[
                  styles.optionLabel,
                  selectedInteraction === 'vibration' && styles.optionLabelSelected,
                ]}
              >
                Vibration
              </Text>
              {/* Circular checkbox */}
              <View
                style={[
                  styles.checkboxCircle,
                  selectedInteraction === 'vibration' && styles.checkboxCircleSelected,
                ]}
              >
                {selectedInteraction === 'vibration' && (
                  <Ionicons name="checkmark" size={14} color="#ffffff" />
                )}
              </View>
            </TouchableOpacity>

            {/* Touch Option */}
            <TouchableOpacity
              style={[
                styles.interactionOption,
                selectedInteraction === 'touch' && styles.interactionOptionSelected,
              ]}
              onPress={() => setSelectedInteraction('touch')}
              activeOpacity={0.8}
            >
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons
                  name="gesture-tap"
                  size={26}
                  color={selectedInteraction === 'touch' ? '#00bcd4' : '#6b7280'}
                />
              </View>
              <Text
                style={[
                  styles.optionLabel,
                  selectedInteraction === 'touch' && styles.optionLabelSelected,
                ]}
              >
                Touch
              </Text>
              {/* Circular checkbox */}
              <View
                style={[
                  styles.checkboxCircle,
                  selectedInteraction === 'touch' && styles.checkboxCircleSelected,
                ]}
              >
                {selectedInteraction === 'touch' && (
                  <Ionicons name="checkmark" size={14} color="#ffffff" />
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* STEP 2: Select Time */}
        <View style={styles.stepCard}>
          <View style={styles.stepHeader}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>2</Text>
            </View>
            <Text style={styles.stepTitle}>Step 2 - Select Time</Text>
          </View>

          <View style={styles.timeDisplayContainer}>
            <Text style={styles.availableTimeText}>Available Time {formattedTime}</Text>
          </View>

          {/* Horizontal Slider Bar */}
          <View style={styles.sliderContainer}>
            <TouchableOpacity
              style={styles.sliderAdjustBtn}
              onPress={() => setSliderValue(Math.max(1, sliderValue - 1))}
              activeOpacity={0.7}
            >
              <Ionicons name="remove-circle-outline" size={24} color="#00bcd4" />
            </TouchableOpacity>

            <View style={styles.sliderTrackWrapper}>
              <View style={styles.sliderTrackBackground} />
              <View style={[styles.sliderTrackFilled, { width: `${(sliderValue / 30) * 100}%` }]} />
              <TouchableOpacity
                style={[styles.sliderThumb, { left: `${Math.min(92, Math.max(0, (sliderValue / 30) * 92))}%` }]}
                activeOpacity={0.9}
              />
            </View>

            <TouchableOpacity
              style={styles.sliderAdjustBtn}
              onPress={() => setSliderValue(Math.min(30, sliderValue + 1))}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle-outline" size={24} color="#00bcd4" />
            </TouchableOpacity>
          </View>

          <View style={styles.sliderLabelsRow}>
            <Text style={styles.sliderMinMax}>1 min</Text>
            <Text style={styles.sliderMinMax}>15 min</Text>
            <Text style={styles.sliderMinMax}>30 min</Text>
          </View>
        </View>

        {/* STEP 3: Listen to Podcast / Music */}
        <View style={styles.stepCard}>
          <View style={styles.stepHeader}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>3</Text>
            </View>
            <Text style={styles.stepTitle}>Step 3 - Listen to Podcast/Music</Text>
          </View>

          <View style={styles.mediaPlayerContainer}>
            {/* Headphones Icon Centered (Size 80) */}
            <View style={styles.headphoneGlowContainer}>
              <Ionicons name="headphones-outline" size={80} color="#00bcd4" />
            </View>

            {/* Microphone Icon below it */}
            <View style={styles.micSubContainer}>
              <Ionicons name="mic-outline" size={32} color="#1f2937" />
              <Text style={styles.micLabel}>Live Voice Guide</Text>
            </View>

            {/* Teal Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${playbackProgress * 100}%` }]} />
                <View style={[styles.progressThumb, { left: `${playbackProgress * 95}%` }]} />
              </View>
              <View style={styles.progressTimeRow}>
                <Text style={styles.progressTimeText}>03:54</Text>
                <Text style={styles.progressTimeText}>{formattedTime}</Text>
              </View>
            </View>

            {/* Playback Controls Row */}
            <View style={styles.controlsRow}>
              <TouchableOpacity
                style={styles.controlBtn}
                onPress={() => Alert.alert('Skip Back', 'Skipped back 15 seconds')}
                activeOpacity={0.7}
              >
                <Ionicons name="play-skip-back" size={24} color="#1f2937" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlBtn}
                onPress={() => setPlaybackProgress(Math.max(0, playbackProgress - 0.1))}
                activeOpacity={0.7}
              >
                <Ionicons name="play-back" size={28} color="#1f2937" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.playPauseCircle}
                onPress={() => setIsPlaying(!isPlaying)}
                activeOpacity={0.85}
              >
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={32}
                  color="#ffffff"
                  style={isPlaying ? null : { marginLeft: 3 }}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlBtn}
                onPress={() => setPlaybackProgress(Math.min(1, playbackProgress + 0.1))}
                activeOpacity={0.7}
              >
                <Ionicons name="play-forward" size={28} color="#1f2937" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlBtn}
                onPress={() => Alert.alert('Skip Forward', 'Skipped forward 15 seconds')}
                activeOpacity={0.7}
              >
                <Ionicons name="play-skip-forward" size={24} color="#1f2937" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Start Session Action Button */}
        <TouchableOpacity
          style={styles.startSessionButton}
          onPress={handleStartSession}
          activeOpacity={0.85}
        >
          <Text style={styles.startSessionButtonText}>Start Session</Text>
          <Ionicons name="arrow-forward" size={20} color="#ffffff" style={styles.btnIcon} />
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            CONFIDENTIAL. 2024 Next Archer &gt;&gt;/&lt;
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  infoButton: {
    padding: 8,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 36,
  },
  titleSection: {
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  subTitle: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  stepCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#00bcd4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  stepBadgeText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  /* Step 1 Options */
  interactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  interactionOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    position: 'relative',
  },
  interactionOptionSelected: {
    borderColor: '#00bcd4',
    backgroundColor: '#f0fdfa',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  optionLabelSelected: {
    color: '#00bcd4',
    fontWeight: '700',
  },
  checkboxCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  checkboxCircleSelected: {
    backgroundColor: '#00bcd4',
    borderColor: '#00bcd4',
  },
  /* Step 2 Slider */
  timeDisplayContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  availableTimeText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#00bcd4',
    letterSpacing: 0.5,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    gap: 12,
  },
  sliderAdjustBtn: {
    padding: 4,
  },
  sliderTrackWrapper: {
    flex: 1,
    height: 32,
    justifyContent: 'center',
    position: 'relative',
  },
  sliderTrackBackground: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
    width: '100%',
  },
  sliderTrackFilled: {
    position: 'absolute',
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00bcd4',
  },
  sliderThumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00bcd4',
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#00bcd4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  sliderLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 36,
  },
  sliderMinMax: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  /* Step 3 Media Player */
  mediaPlayerContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  headphoneGlowContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e6f8fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,188,212,0.2)',
  },
  micSubContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  micLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  progressContainer: {
    width: '100%',
    marginBottom: 18,
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
    marginBottom: 6,
  },
  progressFill: {
    height: 6,
    backgroundColor: '#00bcd4',
    borderRadius: 3,
  },
  progressThumb: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#00bcd4',
    top: -4,
  },
  progressTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressTimeText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    width: '100%',
  },
  controlBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
  },
  playPauseCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#00bcd4',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#00bcd4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  /* Primary Action Button */
  startSessionButton: {
    backgroundColor: '#00bcd4',
    borderRadius: 14,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    elevation: 3,
    shadowColor: '#00bcd4',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  startSessionButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  btnIcon: {
    marginLeft: 8,
  },
  /* Footer */
  footerContainer: {
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 12,
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    letterSpacing: 1,
    fontWeight: '500',
  },
});

export default ClarityOnDemandScreen;
