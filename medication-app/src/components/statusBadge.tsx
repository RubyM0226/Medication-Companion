// Medication status pill. Always shows icon and label so status never depends
// on color alone; follows the theme and color-blind-friendly setting.

import { StyleSheet, Text, View } from 'react-native';

import { getStatusDisplay, MedicationStatus } from '@/constants/colors';
import { useSettings } from '@/context/settingsContext';

export function StatusBadge({ status }: { status: MedicationStatus }) {
  const { colors, toggles, fontScale } = useSettings();
  const display = getStatusDisplay(colors, toggles.colorBlindFriendly)[status];

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
      accessibilityLabel={`Status: ${display.label}`}>
      <Text style={[styles.text, { color: display.textColor, fontSize: 15 * fontScale }]}>
        {display.icon} {display.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  text: { fontWeight: '700' },
});
