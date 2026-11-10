// Button sized from the touch-target setting and text-size setting.
// Every button has a visible text label, not just an icon.
//
// primary: filled forest, for the main action on a screen.
// secondary: outlined, for everything else.
// danger: outlined rust, for destructive actions. Rust is never a filled main
// button, because rust means "missed" or "urgent" in this app.

import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';

import { Text } from '@/components/ui/text';
import { Fonts } from '@/constants/typography';
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
  const { colors, fontScale, touchTarget, toggles } = useSettings();
  const filled = variant === 'primary';
  const borderColor = filled ? colors.primary : variant === 'danger' ? colors.danger : colors.line;
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
          // The design's buttons are 52pt tall; never smaller than the touch target.
          minHeight: Math.max(touchTarget, 52),
          minWidth: touchTarget,
          borderWidth: toggles.highContrast ? 3 : 2,
          borderColor,
          backgroundColor: filled ? colors.primary : 'transparent',
        },
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}>
      <Text style={[styles.text, { color: textColor, fontSize: 17 * fontScale }]}>
        {icon ? `${icon}  ` : ''}
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { fontFamily: Fonts.bodyBold, textAlign: 'center' },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.45 },
});
