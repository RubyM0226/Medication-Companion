import { ThemeColors } from '@/constants/colors';

// Dark theme built from the brand palette: a deep brown background with cream
// text, and lightened teal, rust and gold so they stay readable on dark.
//
// WCAG 2.2 contrast ratios on #1C0F0D:
//   cream text       17.05
//   textSecondary    11.51
//   teal (primary)    9.43  (also background on teal)
//   gold (accent)    10.25  (also background on gold)
//   rust (danger)     7.79  (also background on rust)
//   colorBlindBlue    8.92, colorBlindOrange 9.22
//   soft green (success) 11.31 (also background on green)
// surface #2A1A17: cream 15.22, teal 8.42, rust 6.95, textSecondary 10.28
// sage #26352B: cream 11.78, teal 6.51; ringTrack vs teal 4.74
// Inputs stay cream with dark text (17.05) so fields stand out on dark.
export const DarkColors: ThemeColors = {
  rustOrange: '#F08C7C',
  cream: '#1C0F0D',
  darkBrown: '#FEF4D9',
  teal: '#7CC4C9',
  mutedGold: '#E8B95A',

  background: '#1C0F0D',
  textPrimary: '#FEF4D9',
  primary: '#7CC4C9',
  accent: '#E8B95A',
  danger: '#F08C7C',

  onPrimary: '#1C0F0D',
  onAccent: '#1C0F0D',
  onDanger: '#1C0F0D',

  textSecondary: '#D9C9B0',

  colorBlindBlue: '#7FB8F0',
  colorBlindOrange: '#F5A54A',

  inputBackground: '#FEF4D9',
  inputText: '#1C0F0D',
  inputPlaceholder: '#5C4A45',

  success: '#A8D5A2',
  onSuccess: '#1C0F0D',

  surface: '#2A1A17',
  sage: '#26352B',
  ringTrack: '#3A4A40',
};
