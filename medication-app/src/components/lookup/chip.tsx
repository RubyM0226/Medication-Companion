// Small labelled tag. The text carries the meaning; color only reinforces it.

import { StyleSheet, Text, View } from 'react-native';

import { useSettings } from '@/context/settingsContext';

export function Chip({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'success' | 'accent' }) {
  const { colors, fontScale } = useSettings();
  const background =
    tone === 'success' ? colors.success : tone === 'accent' ? colors.accent : colors.background;
  const text =
    tone === 'success' ? colors.onSuccess : tone === 'accent' ? colors.onAccent : colors.textPrimary;

  return (
    <View style={[styles.chip, { backgroundColor: background, borderColor: colors.textPrimary }]}>
      <Text style={[styles.text, { color: text, fontSize: 13 * fontScale }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  text: { fontWeight: '700' },
});
