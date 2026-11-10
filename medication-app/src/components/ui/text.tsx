// Drop-in replacements for React Native's Text and TextInput that use the app's
// fonts. React Native has no app-wide default font, so every screen imports
// Text and TextInput from here instead of from 'react-native'.
//
// The family is picked from the style, so existing screens need no changes:
//   bold (600+) and 22pt or larger -> Literata, the heading serif
//   bold (600+)                    -> Atkinson Hyperlegible Next Bold
//   anything else                  -> Atkinson Hyperlegible Next Regular
// A style that already sets fontFamily is left alone. fontWeight is reset,
// because custom fonts need one family per weight (Android otherwise fakes bold).
// Unstyled nested Text inherits its parent's font, as in plain React Native.

import { ComponentProps } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text as RNText,
  TextInput as RNTextInput,
  TextStyle,
} from 'react-native';

import { Fonts } from '@/constants/typography';

function withFont(style: StyleProp<TextStyle>, fallbackSize: number): StyleProp<TextStyle> {
  const flat = StyleSheet.flatten(style) ?? {};
  if (flat.fontFamily) return style;
  const weight = String(flat.fontWeight ?? '400');
  const bold = weight === 'bold' || Number(weight) >= 600;
  const size = typeof flat.fontSize === 'number' ? flat.fontSize : fallbackSize;
  const fontFamily = bold && size >= 22 ? Fonts.heading : bold ? Fonts.bodyBold : Fonts.body;
  return [style, { fontFamily, fontWeight: 'normal' }];
}

export function Text(props: ComponentProps<typeof RNText>) {
  // No style at all: keep inheriting from a parent Text, as nested text should.
  if (props.style === undefined) return <RNText {...props} />;
  return <RNText {...props} style={withFont(props.style, 16)} />;
}

export function TextInput(props: ComponentProps<typeof RNTextInput>) {
  return <RNTextInput {...props} style={withFont(props.style, 16)} />;
}
