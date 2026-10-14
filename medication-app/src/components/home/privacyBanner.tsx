// Sage banner with an accurate description of where data lives. Keep the
// Details text in step with the real storage and sharing behavior: it must
// not promise anything the app does not do.

import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AccessibleButton } from '@/components/accessibleButton';
import { AppIcon } from '@/components/appIcon';
import { AppModal } from '@/components/appModal';
import { useSettings } from '@/context/settingsContext';

const DETAILS = [
  'Your medications, schedules and dose history are saved only on this phone. They are not uploaded, synced or shared.',
  'There are no accounts yet. The app is protected only by your phone’s own lock screen.',
  'The app does not add its own encryption. Anyone who can unlock your phone and open the app can see your information.',
  'When you search in Lookup, the medicine name you type is sent to the U.S. FDA’s public openFDA service. Nothing else about you is sent. Recent searches are saved on this phone and can be cleared in Lookup.',
  'Reminder notifications do not show medicine names, so they do not reveal them on your lock screen.',
  'Caregiver sharing is not available yet, so no one else can see your information through the app.',
  'There is no backup yet. Deleting the app deletes this information.',
];

export function PrivacyBanner() {
  const { colors, fontScale: scale } = useSettings();
  const [open, setOpen] = useState(false);
  const text = { color: colors.textPrimary, fontSize: 16 * scale, lineHeight: 24 * scale };

  return (
    <View style={[styles.banner, { backgroundColor: colors.sage, borderColor: colors.textPrimary }]}>
      <View style={styles.row}>
        <AppIcon name="lock" size={24} color={colors.textPrimary} />
        <View style={styles.text}>
          <Text style={[styles.title, { color: colors.textPrimary, fontSize: 17 * scale }]}>
            Your activity is private
          </Text>
          <Text style={{ color: colors.textPrimary, fontSize: 14 * scale }}>Saved only on this phone</Text>
        </View>
        <AccessibleButton
          label="Details"
          onPress={() => setOpen(true)}
          accessibilityLabel="Privacy details"
          accessibilityHint="Explains where your information is stored"
        />
      </View>

      <AppModal visible={open} title="How your information is handled" onClose={() => setOpen(false)}>
        {DETAILS.map((item) => (
          <Text key={item} style={text}>
            • {item}
          </Text>
        ))}
        <AccessibleButton label="Close" variant="primary" onPress={() => setOpen(false)} />
      </AppModal>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { borderRadius: 18, borderWidth: 1, padding: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  text: { flex: 1, minWidth: 150 },
  title: { fontWeight: '700' },
});
