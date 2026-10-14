// Button sized from the touch-target setting and text-size setting.
// Every button has a visible text label, not just an icon.

import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';

import { useSettings } from '@/context/settingsContext';

type Variant = 'primary' | 'secondary' | 'danger';

export function AccessibleButton({
  label,
  icon,
  onPress,
  variant = 'secondary',
  accessibilityLabel,
  accessibilityHint,
  disabled,
  style,
}: {
  label: string;
  icon?: string;
  onPress: () => void;
  variant?: Variant;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors, fontScale, touchTarget } = useSettings();
  const filled = variant === 'primary';
  const tint = variant === 'danger' ? colors.danger : colors.primary;
  const textColor = filled ? colors.onPrimary : variant === 'danger' ? colors.danger : colors.textPrimary;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.button,
        {
          minHeight: touchTarget,
          minWidth: touchTarget,
          borderColor: filled ? colors.primary : variant === 'danger' ? tint : colors.textPrimary,
          backgroundColor: filled ? colors.primary : 'transparent',
        },
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}>
      <Text style={[styles.text, { color: textColor, fontSize: 16 * fontScale }]}>
        {icon ? `${icon}  ` : ''}
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { fontWeight: '700', textAlign: 'center' },
  pressed: { opacity: 0.6 },
  disabled: { opacity: 0.4 },
});
