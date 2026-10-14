// Three shortcut cards. Caregiver is shown as unavailable until it exists.

import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon, IconName } from '@/components/appIcon';
import { cardStyle } from '@/components/home/cardStyle';
import { useSettings } from '@/context/settingsContext';

function ActionCard({
  icon,
  label,
  note,
  onPress,
  disabled,
  accessibilityHint,
}: {
  icon: IconName;
  label: string;
  note?: string;
  onPress?: () => void;
  disabled?: boolean;
  accessibilityHint?: string;
}) {
  const { colors, fontScale: scale, toggles, touchTarget } = useSettings();
  const color = disabled ? colors.textSecondary : colors.primary;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={note ? `${label}, ${note}` : label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        cardStyle(colors, toggles.highContrast),
        styles.card,
        { minHeight: touchTarget + 56 },
        disabled && { borderStyle: 'dashed' },
        pressed && styles.pressed,
      ]}>
      <AppIcon name={icon} size={30} color={color} />
      <Text style={[styles.label, { color: disabled ? colors.textSecondary : colors.textPrimary, fontSize: 15 * scale }]}>
        {label}
      </Text>
      {note ? <Text style={{ color: colors.textSecondary, fontSize: 12 * scale, textAlign: 'center' }}>{note}</Text> : null}
    </Pressable>
  );
}

export function QuickActions({ speaking, onReadAloud }: { speaking: boolean; onReadAloud: () => void }) {
  return (
    <View style={styles.row}>
      <ActionCard icon="lookup" label="Look up a drug" onPress={() => router.navigate('/lookup')} />
      <ActionCard
        icon="speaker"
        label={speaking ? 'Stop reading' : 'Read aloud'}
        onPress={onReadAloud}
        accessibilityHint="Reads a short summary of today’s doses"
      />
      {/* FUTURE BACKEND: needs accounts and secure sharing. */}
      <ActionCard icon="caregiver" label="Caregiver" note="Coming soon" disabled />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  card: { flexGrow: 1, flexBasis: 100, alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12 },
  pressed: { opacity: 0.6 },
  label: { fontWeight: '700', textAlign: 'center' },
});
