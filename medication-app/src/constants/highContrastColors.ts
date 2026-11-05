import { ThemeColors } from '@/constants/colors';

// High contrast versions of the light and dark themes, with the same keys as
// Colors. Every text pairing is at least 7:1 (WCAG AAA), above the AA target.
// The time-of-day sky and paper grain are turned off in high contrast.
//
// Light, on white:
//   black text 21.00, textSecondary 15.13, deep forest 12.56 (also white on it)
//   deep rust 9.18, colorBlindBlue 10.19, colorBlindOrange 9.13
//   black on gold fill 14.54, black on pale gold 18.87, black on green fill 15.67
//   on sage #E3F5DC: black 18.36, forest 10.98, rust 8.02
export const HighContrastLightColors: ThemeColors = {
  ink: '#000000',
  cream: '#FFFFFF',
  forest: '#1F3A12',
  rust: '#8C1C0F',
  gold: '#FFD23F',

  background: '#FFFFFF',
  textPrimary: '#000000',
  textSecondary: '#262626',
  primary: '#1F3A12',
  onPrimary: '#FFFFFF',
  accent: '#FFD23F',
  onAccent: '#000000',
  accentSoft: '#FFF3C4',
  danger: '#8C1C0F',
  onDanger: '#FFFFFF',

  line: '#000000',

  colorBlindBlue: '#003F87',
  colorBlindOrange: '#7A3300',

  inputBackground: '#FFFFFF',
  inputText: '#000000',
  inputPlaceholder: '#333333',

  success: '#B6EDA8',
  onSuccess: '#000000',

  surface: '#FFFFFF',
  sage: '#E3F5DC',
  ringTrack: '#BDBDBD',
};

// Dark, on black:
//   white 21.00, textSecondary 16.83, yellow 16.57 (also black on yellow)
//   coral 7.57 (also black on coral), blue 11.62, amber 11.46
//   black on green fill 14.41; inputs are white with black text (21.00)
//   on sage #0F2A12: white 15.44, yellow 12.18
export const HighContrastDarkColors: ThemeColors = {
  ink: '#FFFFFF',
  cream: '#000000',
  forest: '#FFE600',
  rust: '#FF6B6B',
  gold: '#FFE600',

  background: '#000000',
  textPrimary: '#FFFFFF',
  textSecondary: '#E6E6E6',
  primary: '#FFE600',
  onPrimary: '#000000',
  accent: '#FFE600',
  onAccent: '#000000',
  accentSoft: '#333000',
  danger: '#FF6B6B',
  onDanger: '#000000',

  line: '#FFFFFF',

  colorBlindBlue: '#80C8FF',
  colorBlindOrange: '#FFB000',

  inputBackground: '#FFFFFF',
  inputText: '#000000',
  inputPlaceholder: '#333333',

  success: '#9BE89B',
  onSuccess: '#000000',

  surface: '#000000',
  sage: '#0F2A12',
  ringTrack: '#5C5C5C',
};
