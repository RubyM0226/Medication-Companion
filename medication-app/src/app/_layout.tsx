// CHANGES:
// - Wrapped RootStack in AuthProvider so useAuth() can access login state.
// - Added a loading indicator while the initial session check runs.
// - Restricted login and signup screens to signed-out users.
// - Restricted app tabs, addMedication, and drug details to signed-in users.
// - Kept the existing theme, accessibility, and screen styling settings.
// - These guards control navigation; Flask still checks authentication
//   separately to protect backend data.


// Provides shared authentication state and checks the session on startup.
// Protects app screens so they are only available while signed in.

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';

import { AuthProvider, useAuth } from '@/context/authContext';
import {
  SettingsProvider,
  useSettings,
} from '@/context/settingsContext';

export default function RootLayout() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <RootStack />
      </AuthProvider>
    </SettingsProvider>
  );
}

function RootStack() {
  const { user, loading } = useAuth();
  const { colors, fontScale, isDark, reduceMotion } = useSettings();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        }}>
        <ActivityIndicator
          color={colors.primary}
          accessibilityLabel="Checking your session"
        />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: { fontSize: 17 * fontScale },
          contentStyle: { backgroundColor: colors.background },
          animation: reduceMotion ? 'none' : 'default',
        }}>
        <Stack.Screen
          name="index"
          options={{ headerShown: false }}
        />

        {/* Available only while signed out. */}
        <Stack.Protected guard={!user}>
          <Stack.Screen
            name="login"
            options={{ title: 'Log In' }}
          />
          <Stack.Screen
            name="signup"
            options={{ title: 'Sign Up' }}
          />
        </Stack.Protected>

        {/* Available only while signed in. */}
        <Stack.Protected guard={!!user}>
          <Stack.Screen
            name="(tabs)"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="addMedication"
            options={{
              title: 'Add Medication',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="drug/[setId]"
            options={{
              title: 'Medication details',
              headerBackTitle: 'Lookup',
            }}
          />
        </Stack.Protected>
      </Stack>
    </>
  );
}