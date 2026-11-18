import {
  AtkinsonHyperlegibleNext_400Regular,
  AtkinsonHyperlegibleNext_700Bold,
} from '@expo-google-fonts/atkinson-hyperlegible-next';
import { Literata_600SemiBold, Literata_700Bold, useFonts } from '@expo-google-fonts/literata';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { HeaderSky, SkyBackground, skyTopColor, useTimeOfDay } from '@/components/ui/skyBackground';
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
  const { colors, fontScale, isDark, reduceMotion, toggles } = useSettings();
  const timeOfDay = useTimeOfDay();

  // One sky behind every screen. Screens keep a transparent background so it
  // shows through; headers take the sky's top color so there is no seam.
  // Navigation draws its own gray background behind every screen unless its
  // theme says otherwise. Transparent here lets the sky show through.
  const baseTheme = isDark ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      background: 'transparent',
      card: colors.surface,
      text: colors.textPrimary,
      border: colors.ringTrack,
      primary: colors.primary,
    },
  };

  return (
    <ThemeProvider value={navigationTheme}>
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <SkyBackground timeOfDay={timeOfDay} />
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: skyTopColor(timeOfDay, isDark, toggles.highContrast, colors.background),
          },
          // Draws the grain in the header too, so it does not stop below it.
          headerBackground: () => <HeaderSky />,
          headerTintColor: colors.textPrimary,
          headerTitleStyle: { fontFamily: Fonts.heading, fontSize: 18 * fontScale },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: 'transparent' },
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
    </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
