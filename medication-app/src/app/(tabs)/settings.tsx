import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { DEFAULT_FONT_SCALE_INDEX, FONT_SCALES, SettingsSections } from '@/content/settingsContent';
import { useSettings } from '@/context/settingsContext';

export default function SettingsScreen() {
  const { toggles, setToggle, fontScaleIndex, setFontScaleIndex, fontScale: scale, colors } =
    useSettings();
  const text = { color: colors.textPrimary };
  const card = [styles.card, { borderColor: colors.textPrimary }];

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, text, { fontSize: 32 * scale }]} accessibilityRole="header">
        Accessibility
      </Text>

      <Text style={[styles.sectionTitle, text, { fontSize: 22 * scale }]} accessibilityRole="header">
        Language
      </Text>
      <Pressable
        style={({ pressed }) => [card, pressed && styles.cardPressed]}
        accessibilityRole="button"
        accessibilityLabel="Language, English"
        accessibilityHint="Opens language options">
        <Text style={[styles.icon, text, { fontSize: 24 * scale }]}>🌐</Text>
        <Text style={[styles.label, text, styles.bold, { fontSize: 18 * scale }]}>English</Text>
        <Text style={[text, { fontSize: 22 * scale }]}>›</Text>
      </Pressable>

      {SettingsSections.map((section, sectionIndex) => (
        <View key={section.title}>
          <Text style={[styles.sectionTitle, text, { fontSize: 22 * scale }]} accessibilityRole="header">
            {section.title}
          </Text>

          {section.toggles.map((setting) => (
            <View key={setting.key} style={card}>
              <Text style={[styles.icon, text, { fontSize: 24 * scale }]} importantForAccessibility="no">
                {setting.icon}
              </Text>
              <Text style={[styles.label, text, { fontSize: 18 * scale }]}>{setting.label}</Text>
              <Switch
                value={toggles[setting.key]}
                onValueChange={(value) => setToggle(setting.key, value)}
                trackColor={{ false: colors.background, true: colors.primary }}
                thumbColor={toggles[setting.key] ? colors.onPrimary : colors.textPrimary}
                ios_backgroundColor={colors.background}
                style={styles.switch}
                accessibilityLabel={setting.label}
                accessibilityHint={setting.hint}
              />
            </View>
          ))}

          {/* Font size sits under Appearance, after its toggles. */}
          {sectionIndex === 0 && (
            <View style={[card, styles.fontCard]}>
              <Text style={[styles.label, text, { fontSize: 18 * scale }]}>Font size</Text>
              <View style={styles.fontRow}>
                <Pressable
                  style={[styles.fontButton, fontScaleIndex === 0 && styles.disabled]}
                  onPress={() => setFontScaleIndex(fontScaleIndex - 1)}
                  disabled={fontScaleIndex === 0}
                  accessibilityRole="button"
                  accessibilityLabel="Smaller text">
                  <Text style={[styles.fontButtonText, text, { fontSize: 16 }]}>A</Text>
                </Pressable>

                <View
                  style={styles.steps}
                  accessible
                  accessibilityRole="adjustable"
                  accessibilityLabel="Font size"
                  accessibilityValue={{ min: 1, max: FONT_SCALES.length, now: fontScaleIndex + 1 }}
                  accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
                  onAccessibilityAction={(e) =>
                    setFontScaleIndex(
                      fontScaleIndex + (e.nativeEvent.actionName === 'increment' ? 1 : -1),
                    )
                  }>
                  {FONT_SCALES.map((_, i) => (
                    <Pressable
                      key={i}
                      style={styles.stepHitArea}
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
                  style={[
                    styles.fontButton,
                    fontScaleIndex === FONT_SCALES.length - 1 && styles.disabled,
                  ]}
                  onPress={() => setFontScaleIndex(fontScaleIndex + 1)}
                  disabled={fontScaleIndex === FONT_SCALES.length - 1}
                  accessibilityRole="button"
                  accessibilityLabel="Larger text">
                  <Text style={[styles.fontButtonText, text, { fontSize: 26 }]}>A</Text>
                </Pressable>

                <Pressable
                  style={styles.fontButton}
                  onPress={() => setFontScaleIndex(DEFAULT_FONT_SCALE_INDEX)}
                  accessibilityRole="button"
                  accessibilityLabel="Reset text size">
                  <Text style={[styles.fontButtonText, text, { fontSize: 22 }]}>↺</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontWeight: '700', marginBottom: 8 },
  sectionTitle: { fontWeight: '600', marginTop: 20, marginBottom: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 72,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    borderRadius: 12,
  },
  cardPressed: { opacity: 0.6 },
  icon: { width: 40 },
  label: { flex: 1, marginRight: 12 },
  bold: { fontWeight: '700' },
  switch: { transform: [{ scale: 1.2 }] },
  fontCard: { flexDirection: 'column', alignItems: 'stretch' },
  fontRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  fontButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  fontButtonText: { fontWeight: '700' },
  disabled: { opacity: 0.35 },
  steps: { flex: 1, flexDirection: 'row', alignItems: 'center', marginHorizontal: 4 },
  stepHitArea: { flex: 1, minHeight: 44, justifyContent: 'center', paddingHorizontal: 2 },
  step: { height: 8, borderRadius: 4, borderWidth: 1 },
});
