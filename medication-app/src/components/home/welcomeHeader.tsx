// Date, time-of-day greeting, the chosen mascot and a profile button.
// FUTURE BACKEND: there is no profile system yet, so the greeting has no
// name. Pass displayName once accounts exist.

import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/appIcon';
import { MascotDisplay } from '@/components/mascotDisplay';
import { useSettings } from '@/context/settingsContext';

export function greetingFor(date: Date) {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function WelcomeHeader({ now, displayName }: { now: Date; displayName?: string }) {
  const { colors, fontScale: scale, touchTarget, mascot } = useSettings();
  const greeting = displayName ? `${greetingFor(now)}, ${displayName}!` : `${greetingFor(now)}!`;

  return (
    <View>
      <View style={styles.topRow}>
        <Text style={[styles.date, { color: colors.textSecondary, fontSize: 15 * scale }]}>
          {now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
        </Text>
        <Pressable
          onPress={() => router.navigate('/settings')}
          accessibilityRole="button"
          accessibilityLabel="Profile and settings"
          accessibilityHint="Opens Settings. Profiles are not available yet."
          style={({ pressed }) => [
            styles.profile,
            { minWidth: touchTarget, minHeight: touchTarget, borderColor: colors.textPrimary },
            pressed && styles.pressed,
          ]}>
          <AppIcon name="profile" size={28} color={colors.textPrimary} />
        </Pressable>
      </View>

      <View style={styles.greetingRow}>
        <View style={styles.greetingText}>
          <Text
            style={[styles.greeting, { color: colors.textPrimary, fontSize: 32 * scale }]}
            accessibilityRole="header">
            {greeting}
          </Text>
          <Text style={{ color: colors.textPrimary, fontSize: 16 * scale, lineHeight: 23 * scale }}>
            Your medication companion is here to help you stay on track.
          </Text>
        </View>
        {mascot !== 'none' ? <MascotDisplay size={88} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontWeight: '600', flex: 1 },
  profile: { borderRadius: 999, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.6 },
  greetingRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 8, flexWrap: 'wrap' },
  greetingText: { flex: 1, minWidth: 200, gap: 6 },
  greeting: { fontWeight: '700', letterSpacing: -0.5 },
});
