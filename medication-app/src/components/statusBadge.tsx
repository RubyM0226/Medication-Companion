// Medication status pill. Always shows a drawn mark and a label so status never
// depends on color alone; follows the theme and color-blind-friendly setting.

import { StyleSheet, Text, View } from 'react-native';

import { StatusMark } from '@/components/ui/statusMark';
import { getStatusDisplay, MedicationStatus } from '@/constants/colors';
import { Fonts } from '@/constants/typography';
import { useSettings } from '@/context/settingsContext';

// label replaces the default text, e.g. "Later · 6:00 PM".
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
      <StatusMark status={status} size={18 * Math.min(fontScale, 1.4)} />
      <Text style={[styles.text, { color: display.textColor, fontSize: 15 * fontScale }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  text: { fontFamily: Fonts.bodyBold },
});
