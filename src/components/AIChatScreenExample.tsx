import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { AmbientBackground } from "./AmbientBackground";
import { useChatAmbientBackground } from "./useChatAmbientBackground";

/**
 * Wire this into AIChatDark / AIChatLightScreen. The two things that were
 * silently failing before:
 *   1. className/CSS-file styling -> replaced with StyleSheet + LinearGradient
 *   2. backdrop-blur-md (web CSS)  -> replaced with expo-blur's <BlurView>
 */
export default function AIChatScreenExample({ route }: any) {
  // On native there's no window.location — read testAurora from navigation
  // params instead, e.g. navigation.navigate('AIChatDark', { testAurora: true })
  const testAurora = route?.params?.testAurora === true;
  const { timeMode, auroraActive } = useChatAmbientBackground({ testAurora });

  return (
    <View style={{ flex: 1 }}>
      <AmbientBackground timeMode={timeMode} auroraActive={auroraActive} />

      {/* Chat UI sits ABOVE the background in normal view stacking order
          (later siblings paint on top — no z-index needed in RN). */}
      <View style={{ flex: 1 }}>
        <BlurView intensity={30} tint="dark" style={styles.header}>
          <Text style={styles.headerText}>Hey Neha</Text>
        </BlurView>

        <View style={{ flex: 1, padding: 16 }}>
          <BlurView intensity={25} tint="dark" style={styles.bubbleLeft}>
            <Text style={styles.bubbleText}>Hello! How are you today?</Text>
          </BlurView>
        </View>

        <BlurView intensity={30} tint="dark" style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Message..."
            placeholderTextColor="rgba(255,255,255,0.4)"
          />
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 48,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  headerText: { color: "rgba(255,255,255,0.9)", fontSize: 14, fontWeight: "500" },
  bubbleLeft: {
    alignSelf: "flex-start",
    maxWidth: "80%",
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 14,
    overflow: "hidden",
  },
  bubbleText: { color: "rgba(255,255,255,0.9)", fontSize: 14 },
  inputBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: "white",
    fontSize: 14,
  },
});
