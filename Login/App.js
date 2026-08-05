import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import RegisterScreen from './screens/RegisterScreen';
import { COLORS } from './theme';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <RegisterScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
