import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { SettingsProvider, useSettings } from '@/context/settingsContext';

export default function RootLayout() {
  return (
    <SettingsProvider>
      <RootStack />
    </SettingsProvider>
  );
}

function RootStack() {
  const { colors, fontScale, toggles } = useSettings();

  return (
    <>
      <StatusBar style={toggles.highContrast ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: { fontSize: 17 * fontScale },
          contentStyle: { backgroundColor: colors.background },
          animation: toggles.reduceMotion ? 'none' : 'default',
        }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ title: 'Log In' }} />
        <Stack.Screen name="signup" options={{ title: 'Sign Up' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="addMedication"
          options={{ title: 'Add Medication', presentation: 'modal' }}
        />
      </Stack>
    </>
  );
}
