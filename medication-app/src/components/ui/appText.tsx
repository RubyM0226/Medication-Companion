// Text that follows the design refresh: Literata headings, Atkinson Hyperlegible
// Next body text, the theme's colors and the person's text-size setting.
// Use these instead of a plain <Text> so fonts and sizes stay consistent.

import { ReactNode } from 'react';
import { StyleProp, Text, TextProps, TextStyle } from 'react-native';

import { bodyStyle, headingStyle, TypeScale } from '@/constants/typography';
import { useSettings } from '@/context/settingsContext';

type HeadingLevel = 'display' | 'title' | 'heading' | 'section';

// Screen readers announce these as headings, so people can jump between them.
export function Heading({
  level = 'section',
  children,
  style,
  ...rest
}: TextProps & { level?: HeadingLevel; children: ReactNode; style?: StyleProp<TextStyle> }) {
  const { colors, fontScale } = useSettings();
  return (
    <Text
      accessibilityRole="header"
      {...rest}
      style={[headingStyle(TypeScale[level], fontScale), { color: colors.textPrimary }, style]}>
      {children}
    </Text>
  );
}

type BodySize = 'body' | 'meta' | 'small';

// Body copy. `muted` uses the secondary text color (still 8:1 or better).
export function BodyText({
  size = 'body',
  bold,
  muted,
  color,
  children,
  style,
  ...rest
}: TextProps & {
  size?: BodySize;
  bold?: boolean;
  muted?: boolean;
  color?: string;
  children: ReactNode;
  style?: StyleProp<TextStyle>;
}) {
  const { colors, fontScale } = useSettings();
  const textColor = color ?? (muted ? colors.textSecondary : colors.textPrimary);
  return (
    <Text {...rest} style={[bodyStyle(TypeScale[size], fontScale, bold), { color: textColor }, style]}>
      {children}
    </Text>
  );
}
