// Pick how a pill looks: its shape and color. Used in Add medicine and in
// My medicines > Change pill look. The drawing helps people match a medicine to
// what is in their hand; the name still tells medicines apart, so this is
// optional and never the only clue.
//
// Each choice is a radio button with a word label, and the choice is also
// written out in words ("Pink round tablet"), so it never relies on color.

import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { BodyText } from '@/components/ui/appText';
import { describePill, PILL_COLORS, PILL_FORMS, PillForm, PillMark } from '@/components/ui/pillMark';
import { useSettings } from '@/context/settingsContext';

export type PillLook = { form: PillForm; color: string };

export const DEFAULT_PILL_LOOK: PillLook = { form: 'round', color: '#FFFFFF' };

export function PillPicker({ value, onChange }: { value: PillLook; onChange: (look: PillLook) => void }) {
  const { colors, touchTarget } = useSettings();
  const tile = Math.max(touchTarget, 56);

  return (
    <View style={styles.wrap}>
      <View style={[styles.preview, { backgroundColor: colors.surface, borderColor: colors.ringTrack }]}>
        <PillMark form={value.form} color={value.color} size={64} />
        <View style={styles.previewText} accessible accessibilityLiveRegion="polite">
          <BodyText size="meta" muted>
            Looks like
          </BodyText>
          <BodyText bold>{describePill(value.form, value.color)}</BodyText>
        </View>
      </View>

      <BodyText bold>Shape</BodyText>
      <View style={styles.options} accessibilityRole="radiogroup" accessibilityLabel="Pill shape">
        {PILL_FORMS.map((form) => {
          const selected = form.value === value.form;
          return (
            <Pressable
              key={form.value}
              onPress={() => onChange({ ...value, form: form.value })}
              accessibilityRole="radio"
              accessibilityLabel={form.label}
              accessibilityState={{ checked: selected }}
              style={({ pressed }) => [
                styles.shape,
                {
                  minWidth: tile + 12,
                  borderColor: selected ? colors.primary : colors.line,
                  borderWidth: selected ? 3 : 2,
                  backgroundColor: selected ? colors.accentSoft : colors.surface,
                },
                pressed && styles.pressed,
              ]}>
              <PillMark form={form.value} color={value.color} size={40} />
              <BodyText size="small" bold={selected}>
                {form.label}
              </BodyText>
            </Pressable>
          );
        })}
      </View>

      <BodyText bold>Color</BodyText>
      <View style={styles.options} accessibilityRole="radiogroup" accessibilityLabel="Pill color">
        {PILL_COLORS.map((color) => {
          const selected = color.value === value.color;
          const white = color.value === '#FFFFFF';
          return (
            <Pressable
              key={color.value}
              onPress={() => onChange({ ...value, color: color.value })}
              accessibilityRole="radio"
              accessibilityLabel={color.label}
              accessibilityState={{ checked: selected }}
              style={({ pressed }) => [styles.colorOption, { minWidth: tile }, pressed && styles.pressed]}>
              <View
                style={[
                  styles.swatch,
                  {
                    width: tile - 8,
                    height: tile - 8,
                    backgroundColor: color.value,
                    // Selected: a thick ink ring with a gap, plus a check mark.
                    borderColor: selected ? colors.textPrimary : white ? colors.line : color.value,
                    borderWidth: selected ? 4 : 2,
                  },
                ]}>
                {selected ? (
                  <Svg width={24} height={24} viewBox="0 0 24 24">
                    <Path
                      d="M5 12.5l4.5 4.5L19 7.5"
                      stroke={white ? '#291411' : '#FEF4D9'}
                      strokeWidth={3}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                ) : null}
              </View>
              <BodyText size="small" bold={selected}>
                {color.label}
              </BodyText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  preview: { flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, borderRadius: 18, padding: 12 },
  previewText: { flex: 1 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 6 },
  shape: { borderRadius: 16, paddingVertical: 8, paddingHorizontal: 6, alignItems: 'center', gap: 4 },
  colorOption: { alignItems: 'center', gap: 4, paddingVertical: 4 },
  swatch: { borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.7 },
});
