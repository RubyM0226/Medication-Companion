// A whole-row switch: tapping anywhere on the card toggles it, and screen
// readers hear one element with its label, hint and on/off state.

import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { SettingCard } from '@/components/settings/settingCard';
import { SettingText } from '@/components/settings/settingText';
import { ToggleSetting } from '@/content/settingsContent';
import { useSettings } from '@/context/settingsContext';

export function SettingToggleRow({
  setting,
  onChange,
}: {
  setting: ToggleSetting;
  onChange?: (value: boolean) => void;
}) {
  const { colors, fontScale, toggles, setToggle, touchTarget } = useSettings();
  const on = toggles[setting.key];

  const change = (value: boolean) => {
    setToggle(setting.key, value);
    onChange?.(value);
  };

  return (
    <Pressable
      onPress={() => change(!on)}
      accessibilityRole="switch"
      accessibilityLabel={setting.label}
      accessibilityHint={setting.pendingNote ? `${setting.hint}. ${setting.pendingNote}` : setting.hint}
      accessibilityState={{ checked: on }}>
      {({ pressed }) => (
        <SettingCard style={[styles.card, pressed && styles.pressed]}>
          <SettingText icon={setting.icon} label={setting.label} note={setting.pendingNote} />
          <View
            style={[styles.control, { minWidth: touchTarget, minHeight: touchTarget }]}
            importantForAccessibility="no-hide-descendants"
            accessibilityElementsHidden>
            <Switch
              value={on}
              onValueChange={change}
              trackColor={{ false: colors.textSecondary, true: colors.primary }}
              thumbColor={on ? colors.onPrimary : colors.background}
              ios_backgroundColor={colors.textSecondary}
              style={{ transform: [{ scale: touchTarget > 48 ? 1.4 : 1.2 }] }}
            />
            {/* Spelled out so the state is not shown by color and position alone. */}
            <Text style={[styles.state, { color: colors.textPrimary, fontSize: 14 * fontScale }]}>
              {on ? 'On' : 'Off'}
            </Text>
          </View>
        </SettingCard>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center' },
  pressed: { opacity: 0.6 },
  control: { alignItems: 'center', justifyContent: 'center' },
  state: { fontWeight: '700', marginTop: 6 },
});
