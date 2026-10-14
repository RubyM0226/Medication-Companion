import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { useSettings } from '@/context/settingsContext';

export default function WelcomeScreen() {
  const { colors, fontScale } = useSettings();
  const link = { color: colors.primary, fontSize: 16 * fontScale };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.textPrimary, fontSize: 24 * fontScale }]}>
        Medication Companion
      </Text>
      <Link href="/login" style={link}>Log In</Link>
      <Link href="/signup" style={link}>Sign Up</Link>
      <Link href="/home" style={link}>Continue to app</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  title: { fontWeight: '600' },
});
