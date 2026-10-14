// Medication status pill. Always shows icon and label so status never depends
// on color alone; follows the theme and color-blind-friendly setting.

import { StyleSheet, Text, View } from 'react-native';

import { getStatusDisplay, MedicationStatus } from '@/constants/colors';
import { useSettings } from '@/context/settingsContext';

// label replaces the default text, e.g. "Pending · late".
export function StatusBadge({ status, label }: { status: MedicationStatus; label?: string }) {
  const { colors, toggles, fontScale } = useSettings();
  const display = getStatusDisplay(colors, toggles.colorBlindFriendly)[status];
  const text = label ?? display.label;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: display.backgroundColor,
          borderColor: display.borderColor,
          borderStyle: display.borderStyle,
          borderWidth: display.borderWidth,
        },
      ]}
      accessible
      accessibilityLabel={`Status: ${text}`}>
      <Text style={[styles.text, { color: display.textColor, fontSize: 15 * fontScale }]}>
        {display.icon} {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  text: { fontWeight: '700' },
});
