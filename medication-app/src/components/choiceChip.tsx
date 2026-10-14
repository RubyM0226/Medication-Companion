// Selectable chip for radio groups (pick one) and checkbox groups (pick any).
// Selected chips are filled and show a check mark and bold text.

import { Pressable, StyleSheet, Text } from 'react-native';

import { useSettings } from '@/context/settingsContext';

export function ChoiceChip({
  label,
  selected,
  onPress,
  role = 'radio',
  accessibilityLabel,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  role?: 'radio' | 'checkbox';
  accessibilityLabel?: string;
}) {
  const { colors, fontScale, touchTarget } = useSettings();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={role}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ checked: selected }}
      style={({ pressed }) => [
        styles.chip,
        {
          minHeight: touchTarget,
          minWidth: touchTarget + 16,
          borderColor: selected ? colors.primary : colors.textPrimary,
          backgroundColor: selected ? colors.primary : 'transparent',
        },
        pressed && styles.pressed,
      ]}>
      <Text
        style={{
          color: selected ? colors.onPrimary : colors.textPrimary,
          fontSize: 16 * fontScale,
          fontWeight: selected ? '700' : '500',
        }}>
        {selected ? '✓ ' : ''}
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.6 },
});
