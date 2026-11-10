// TEMPORARY design check, shown in development builds only (Expo Go): pick a
// time of day to see its sky on every screen. Not saved. Remove this card and
// the preview in skyBackground.tsx after the design review.

import { StyleSheet, View } from 'react-native';

import { ChoiceChip } from '@/components/choiceChip';
import { SettingCard } from '@/components/settings/settingCard';
import { BodyText } from '@/components/ui/appText';
import { setSkyPreview, TimeOfDay, useSkyPreview } from '@/components/ui/skyBackground';

const OPTIONS: { value: TimeOfDay | null; label: string }[] = [
  { value: null, label: 'Clock' },
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
];

export function SkyPreviewCard() {
  const preview = useSkyPreview();

  return (
    <SettingCard style={styles.card}>
      <BodyText bold>Sky preview (testing only)</BodyText>
      <BodyText size="meta" muted>
        Shows each time of day’s sky. Light theme only, and high contrast turns the sky off.
      </BodyText>
      <View style={styles.chips} accessibilityRole="radiogroup" accessibilityLabel="Sky preview">
        {OPTIONS.map((option) => (
          <ChoiceChip
            key={option.label}
            label={option.label}
            selected={preview === option.value}
            onPress={() => setSkyPreview(option.value)}
          />
        ))}
      </View>
    </SettingCard>
  );
}

const styles = StyleSheet.create({
  card: { gap: 8, marginTop: 16 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
