//welcome screen shows for signed-out users.
// redirects to /home for signed-in users.

import { Link, Redirect } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/context/authContext';
import { useSettings } from '@/context/settingsContext';

export default function WelcomeScreen() {
  const { user } = useAuth();
  const { colors, fontScale } = useSettings();

  const link = {
    color: colors.primary,
    fontSize: 16 * fontScale,
  };

  if (user) {
    return <Redirect href="/home" />;
  }

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.title,
          {
            color: colors.textPrimary,
            fontSize: 24 * fontScale,
          },
        ]}>
        Medication Companion
      </Text>

      <Link href="/login" style={link}>
        Log In
      </Link>

      <Link href="/signup" style={link}>
        Sign Up
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  title: {
    fontWeight: '600',
  },
});