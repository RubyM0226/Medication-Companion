// Icon, label and optional note used at the start of Settings rows.

import { StyleSheet, Text, View } from 'react-native';

import { useSettings } from '@/context/settingsContext';

export function SettingText({
  icon,
  label,
  note,
  muted,
}: {
  icon: string;
  label: string;
  note?: string;
  muted?: boolean;
}) {
  const { colors, fontScale } = useSettings();
  const labelColor = muted ? colors.textSecondary : colors.textPrimary;

  return (
    <View style={styles.row}>
      <Text
        style={[styles.icon, { color: labelColor, fontSize: 24 * fontScale }]}
        importantForAccessibility="no"
        accessibilityElementsHidden>
        {icon}
      </Text>
      <View style={styles.textColumn}>
        <Text style={[styles.label, { color: labelColor, fontSize: 18 * fontScale }]}>{label}</Text>
        {note ? (
          <Text style={[styles.note, { color: colors.textSecondary, fontSize: 14 * fontScale }]}>
            {note}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flex: 1, flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  icon: { width: 40 },
  textColumn: { flex: 1 },
  label: { fontWeight: '600' },
  note: { marginTop: 4 },
});
