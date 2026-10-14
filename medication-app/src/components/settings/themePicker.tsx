// Light / dark / system choice shown as a radio group. The selected option
// gets a check mark and bold text as well as a fill, so it is not color-only.

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SettingCard } from '@/components/settings/settingCard';
import { SettingText } from '@/components/settings/settingText';
import { THEME_OPTIONS } from '@/content/settingsContent';
import { useSettings } from '@/context/settingsContext';

export function ThemePicker() {
  const { colors, fontScale, themeMode, setThemeMode, touchTarget } = useSettings();

  return (
    <SettingCard>
      <SettingText
        icon="☀"
        label="Theme"
        note="System matches your phone’s light or dark mode."
      />
      <View style={styles.options} accessibilityRole="radiogroup" accessibilityLabel="Theme">
        {THEME_OPTIONS.map((option) => {
          const selected = option.value === themeMode;
          return (
            <Pressable
              key={option.value}
              onPress={() => setThemeMode(option.value)}
              accessibilityRole="radio"
              accessibilityLabel={`${option.label} theme`}
              accessibilityState={{ checked: selected }}
              style={({ pressed }) => [
                styles.option,
                { minHeight: touchTarget, borderColor: selected ? colors.primary : colors.textPrimary },
                selected && { backgroundColor: colors.primary },
                pressed && styles.pressed,
              ]}>
              <Text
                style={[
                  styles.optionText,
                  {
                    color: selected ? colors.onPrimary : colors.textPrimary,
                    fontSize: 16 * fontScale,
                    fontWeight: selected ? '700' : '500',
                  },
                ]}>
                {selected ? '✓ ' : ''}
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SettingCard>
  );
}

const styles = StyleSheet.create({
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  option: {
    flexGrow: 1,
    minWidth: 88,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: { textAlign: 'center' },
  pressed: { opacity: 0.6 },
});
