// Icon, label and optional note used at the start of Settings rows.

import { StyleSheet, View } from 'react-native';

import { AppIcon, IconName } from '@/components/appIcon';
import { Text } from '@/components/ui/text';
import { Fonts } from '@/constants/typography';
import { useSettings } from '@/context/settingsContext';

export function SettingText({
  icon,
  label,
  note,
  muted,
}: {
  icon: IconName;
  label: string;
  note?: string;
  muted?: boolean;
}) {
  const { colors, fontScale } = useSettings();
  const labelColor = muted ? colors.textSecondary : colors.textPrimary;

  return (
    <View style={styles.row}>
      <View style={styles.icon}>
        <AppIcon name={icon} size={24 * Math.min(fontScale, 1.3)} color={labelColor} />
      </View>
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
  icon: { width: 40, alignItems: 'flex-start' },
  textColumn: { flex: 1 },
  label: { fontFamily: Fonts.bodyBold },
  note: { fontFamily: Fonts.body, marginTop: 4 },
});
