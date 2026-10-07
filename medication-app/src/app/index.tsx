import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Medication Companion</Text>
      <Link href="/login" style={styles.link}>Log In</Link>
      <Link href="/signup" style={styles.link}>Sign Up</Link>
      <Link href="/home" style={styles.link}>Continue to app</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  title: { fontSize: 24, fontWeight: '600', color: Colors.textPrimary },
  link: { color: Colors.primary },
});
