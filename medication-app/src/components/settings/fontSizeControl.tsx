// Text size stepper. Screen readers treat the steps as one adjustable control
// (swipe up/down on iOS, volume keys on Android).

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SettingCard } from '@/components/settings/settingCard';
import { DEFAULT_FONT_SCALE_INDEX, FONT_SCALES } from '@/content/settingsContent';
import { useSettings } from '@/context/settingsContext';

export function FontSizeControl() {
  const { colors, fontScale: scale, fontScaleIndex, setFontScaleIndex, touchTarget } =
    useSettings();
  const text = { color: colors.textPrimary };
  const target = { minWidth: touchTarget, minHeight: touchTarget };
  const last = FONT_SCALES.length - 1;

  return (
    <SettingCard>
      <View style={styles.header}>
        <Text style={[styles.label, text, { fontSize: 18 * scale }]}>Text size</Text>
        <Text style={[text, { fontSize: 14 * scale }]}>
          Size {fontScaleIndex + 1} of {FONT_SCALES.length}
        </Text>
      </View>

      <View style={styles.row}>
        <Pressable
          style={[styles.button, target, fontScaleIndex === 0 && styles.disabled]}
          onPress={() => setFontScaleIndex(fontScaleIndex - 1)}
          disabled={fontScaleIndex === 0}
          accessibilityRole="button"
          accessibilityLabel="Smaller text"
          accessibilityState={{ disabled: fontScaleIndex === 0 }}>
          <Text style={[styles.buttonText, text, { fontSize: 16 }]}>A</Text>
        </Pressable>

        <View
          style={styles.steps}
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel="Text size"
          accessibilityValue={{
            min: 1,
            max: FONT_SCALES.length,
            now: fontScaleIndex + 1,
            text: `Size ${fontScaleIndex + 1} of ${FONT_SCALES.length}`,
          }}
          accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
          onAccessibilityAction={(e) =>
            setFontScaleIndex(fontScaleIndex + (e.nativeEvent.actionName === 'increment' ? 1 : -1))
          }>
          {FONT_SCALES.map((_, i) => (
            <Pressable
              key={i}
              style={[styles.stepHitArea, { minHeight: touchTarget }]}
              onPress={() => setFontScaleIndex(i)}
              importantForAccessibility="no">
              <View
                style={[
                  styles.step,
                  { borderColor: colors.textPrimary },
                  i <= fontScaleIndex && {
                    backgroundColor: colors.primary,
                    borderColor: colors.primary,
                  },
                ]}
              />
            </Pressable>
          ))}
        </View>

        <Pressable
          style={[styles.button, target, fontScaleIndex === last && styles.disabled]}
          onPress={() => setFontScaleIndex(fontScaleIndex + 1)}
          disabled={fontScaleIndex === last}
          accessibilityRole="button"
          accessibilityLabel="Larger text"
          accessibilityState={{ disabled: fontScaleIndex === last }}>
          <Text style={[styles.buttonText, text, { fontSize: 26 }]}>A</Text>
        </Pressable>

        <Pressable
          style={[styles.button, target]}
          onPress={() => setFontScaleIndex(DEFAULT_FONT_SCALE_INDEX)}
          accessibilityRole="button"
          accessibilityLabel="Reset text size">
          <Text style={[styles.buttonText, text, { fontSize: 22 }]}>↺</Text>
        </Pressable>
      </View>

      <Text style={[text, styles.sample, { fontSize: 16 * scale }]}>
        Sample: Take 1 tablet with food.
      </Text>
    </SettingCard>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' },
  label: { fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  button: { alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontWeight: '700' },
  disabled: { opacity: 0.35 },
  steps: { flex: 1, flexDirection: 'row', alignItems: 'center', marginHorizontal: 4 },
  stepHitArea: { flex: 1, justifyContent: 'center', paddingHorizontal: 2 },
  step: { height: 8, borderRadius: 4, borderWidth: 1 },
  sample: { marginTop: 8 },
});
