// Date, time-of-day greeting, the chosen mascot and a profile button.
// FUTURE BACKEND: there is no profile system yet, so the greeting has no
// name. Pass displayName once accounts exist.

import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppIcon } from '@/components/appIcon';
import { MascotDisplay } from '@/components/mascotDisplay';
import { BodyText, Heading } from '@/components/ui/appText';
import { getTimeOfDay, greetingFor as greetingForTime, useTimeOfDay } from '@/components/ui/skyBackground';
import { useSettings } from '@/context/settingsContext';

// Uses the same morning / afternoon / evening split as the sky behind the screen.
export function greetingFor(date: Date) {
  return greetingForTime(getTimeOfDay(date));
}

export function WelcomeHeader({ now, displayName }: { now: Date; displayName?: string }) {
  const { colors, touchTarget, mascot } = useSettings();
  // Follows the sky, including the temporary sky preview in Settings.
  const timeGreeting = greetingForTime(useTimeOfDay(now));
  const greeting = displayName ? `${timeGreeting}, ${displayName}` : timeGreeting;

  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <BodyText size="meta" muted>
          {now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
        </BodyText>
        <Heading level="title">{greeting}</Heading>
      </View>
      {mascot !== 'none' ? <MascotDisplay size={72} /> : null}
      <Pressable
        onPress={() => router.navigate('/settings')}
        accessibilityRole="button"
        accessibilityLabel="Profile and settings"
        accessibilityHint="Opens Settings. Profiles are not available yet."
        style={({ pressed }) => [
          styles.profile,
          {
            minWidth: touchTarget,
            minHeight: touchTarget,
            borderColor: colors.line,
            backgroundColor: colors.surface,
          },
          pressed && styles.pressed,
        ]}>
        <AppIcon name="profile" size={26} color={colors.textPrimary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  text: { flex: 1, gap: 2 },
  profile: { borderRadius: 999, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.7 },
});
