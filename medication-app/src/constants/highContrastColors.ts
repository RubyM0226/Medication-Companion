import { ThemeColors } from '@/constants/colors';

// High contrast versions of the light and dark themes, with the same keys as
// Colors. Every text pairing is at least 7:1 (WCAG AAA), above the AA target.
//
// Light, on white:
//   black text 21.00, textSecondary 15.13, deep teal 10.46 (also white on it)
//   deep rust 9.18, colorBlindBlue 10.19, colorBlindOrange 9.13
//   black on gold fill 14.54, black on green fill 15.67
export const HighContrastLightColors: ThemeColors = {
  rustOrange: '#8C1C0F',
  cream: '#FFFFFF',
  darkBrown: '#000000',
  teal: '#00474D',
  mutedGold: '#FFD23F',

  background: '#FFFFFF',
  textPrimary: '#000000',
  primary: '#00474D',
  accent: '#FFD23F',
  danger: '#8C1C0F',

  onPrimary: '#FFFFFF',
  onAccent: '#000000',
  onDanger: '#FFFFFF',

  textSecondary: '#262626',

  colorBlindBlue: '#003F87',
  colorBlindOrange: '#7A3300',

  inputBackground: '#FFFFFF',
  inputText: '#000000',
  inputPlaceholder: '#333333',

  success: '#B6EDA8',
  onSuccess: '#000000',
};

// Dark, on black:
//   white 21.00, textSecondary 16.83, yellow 16.57 (also black on yellow)
//   coral 7.57 (also black on coral), blue 11.62, amber 11.46
//   black on green fill 14.41; inputs are white with black text (21.00)
export const HighContrastDarkColors: ThemeColors = {
  rustOrange: '#FF6B6B',
  cream: '#000000',
  darkBrown: '#FFFFFF',
  teal: '#FFE600',
  mutedGold: '#FFE600',

  background: '#000000',
  textPrimary: '#FFFFFF',
  primary: '#FFE600',
  accent: '#FFE600',
  danger: '#FF6B6B',

  onPrimary: '#000000',
  onAccent: '#000000',
  onDanger: '#000000',

  textSecondary: '#E6E6E6',

  colorBlindBlue: '#80C8FF',
  colorBlindOrange: '#FFB000',

  inputBackground: '#FFFFFF',
  inputText: '#000000',
  inputPlaceholder: '#333333',

  success: '#9BE89B',
  onSuccess: '#000000',
};
