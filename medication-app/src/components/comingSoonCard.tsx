// A feature that is planned but not built. Shown greyed out and announced as
// unavailable so nobody mistakes it for something that works.

import { StyleSheet, View } from 'react-native';

import { SettingCard } from '@/components/settings/settingCard';
import { SettingText } from '@/components/settings/settingText';

export function ComingSoonCard({ icon, label, note }: { icon: string; label: string; note: string }) {
  return (
    <View
      accessible
      accessibilityLabel={`${label}. Coming soon`}
      accessibilityHint={note}
      accessibilityState={{ disabled: true }}>
      <SettingCard style={styles.row}>
        <SettingText icon={icon} label={`${label} (coming soon)`} note={note} muted />
      </SettingCard>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
});
