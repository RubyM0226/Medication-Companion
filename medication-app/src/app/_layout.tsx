import {
  AtkinsonHyperlegibleNext_400Regular,
  AtkinsonHyperlegibleNext_700Bold,
} from '@expo-google-fonts/atkinson-hyperlegible-next';
import { Literata_600SemiBold, Literata_700Bold, useFonts } from '@expo-google-fonts/literata';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { Fonts } from '@/constants/typography';
import { SettingsProvider, useSettings } from '@/context/settingsContext';

// Keep the splash screen up until the fonts are ready, so text never flashes
// in the system font first.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Literata_600SemiBold,
    Literata_700Bold,
    AtkinsonHyperlegibleNext_400Regular,
    AtkinsonHyperlegibleNext_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  // If a font fails to load, carry on with the system font rather than
  // leaving the person on the splash screen.
  if (!fontsLoaded && !fontError) return null;

  return (
    <SettingsProvider>
      <RootStack />
    </SettingsProvider>
  );
}

function RootStack() {
  const { colors, fontScale, isDark, reduceMotion } = useSettings();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: { fontFamily: Fonts.heading, fontSize: 18 * fontScale },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
          animation: reduceMotion ? 'none' : 'default',
        }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ title: 'Log in' }} />
        <Stack.Screen name="signup" options={{ title: 'Sign up' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="addMedication"
          options={{ title: 'Add medicine', presentation: 'modal' }}
        />
        <Stack.Screen
          name="drug/[setId]"
          options={{ title: 'Medicine details', headerBackTitle: 'Lookup' }}
        />
      </Stack>
    </>
  );
}
