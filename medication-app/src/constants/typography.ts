// Fonts and type scale from the design refresh.
//
// Headings and medicine names: Literata (a serif made for reading on screens).
// Everything else: Atkinson Hyperlegible Next (made by the Braille Institute
// for low-vision readers).
//
// Custom fonts need one family per weight. Do not combine `fontWeight` with
// these families: on Android that can fall back to a fake bold. Pick the
// matching family instead (Fonts.bodyBold, not Fonts.body + fontWeight '700').

import { TextStyle } from 'react-native';

export const Fonts = {
  heading: 'Literata_700Bold',
  headingSemi: 'Literata_600SemiBold',
  body: 'AtkinsonHyperlegibleNext_400Regular',
  bodyBold: 'AtkinsonHyperlegibleNext_700Bold',
};

// The fixed size scale, in points before the user's text-size setting.
// Headings use 40 / 34 / 28 / 22. Body text never goes below 16.
export const TypeScale = {
  display: 40, // Log in headline
  title: 34, // page titles
  heading: 28, // card titles, medicine name on the next-dose card
  section: 22, // section headings, medicine names in lists
  body: 18,
  meta: 16, // secondary lines: dose, time
  small: 14, // only for short labels, never paragraphs
  tab: 13, // tab bar labels
};

// A heading style at a scale size, multiplied by the user's text size.
// Big serif headings look loose, so 28 and up get slightly tighter letter spacing.
export function headingStyle(size: number, fontScale: number): TextStyle {
  const fontSize = size * fontScale;
  return {
    fontFamily: Fonts.heading,
    fontSize,
    lineHeight: Math.round(fontSize * (size >= 28 ? 1.12 : 1.2)),
    letterSpacing: size >= 28 ? -0.02 * fontSize : 0,
  };
}

// Body text at a scale size. Pass bold for labels and buttons.
export function bodyStyle(size: number, fontScale: number, bold = false): TextStyle {
  const fontSize = size * fontScale;
  return {
    fontFamily: bold ? Fonts.bodyBold : Fonts.body,
    fontSize,
    lineHeight: Math.round(fontSize * 1.45),
  };
}
