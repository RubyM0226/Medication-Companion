import { ThemeColors } from '@/constants/colors';

// Dark theme built from the refreshed palette: a deep brown background with
// cream text, and a lightened forest, rust and gold so they stay readable.
//
// WCAG 2.2 contrast ratios on background #1C0F0D:
//   cream text        17.05
//   textSecondary     11.51
//   primary (forest)  10.15  (also background on forest)
//   accent (gold)     10.25  (also background on gold)
//   danger (rust)      7.79  (also background on rust)
//   line (outlines)    6.07
//   colorBlindBlue 8.92, colorBlindOrange 9.22
// surface #2A1A17: cream 15.22, forest 9.06, rust 6.95, textSecondary 10.28, line 5.41
// sage #26352B: cream 11.78, forest 7.01
// accentSoft #3A2D1A: cream 12.20
// Inputs stay cream with dark text (17.05) so fields stand out on dark.
export const DarkColors: ThemeColors = {
  ink: '#FEF4D9',
  cream: '#1C0F0D',
  forest: '#A9C98A',
  rust: '#F08C7C',
  gold: '#E8B95A',

  background: '#1C0F0D',
  textPrimary: '#FEF4D9',
  textSecondary: '#D9C9B0',
  primary: '#A9C98A',
  onPrimary: '#1C0F0D',
  accent: '#E8B95A',
  onAccent: '#1C0F0D',
  accentSoft: '#3A2D1A',
  danger: '#F08C7C',
  onDanger: '#1C0F0D',

  line: '#A88E7A',

  colorBlindBlue: '#7FB8F0',
  colorBlindOrange: '#F5A54A',

  inputBackground: '#FEF4D9',
  inputText: '#1C0F0D',
  inputPlaceholder: '#5C3F37',

  success: '#26352B',
  onSuccess: '#FEF4D9',

  surface: '#2A1A17',
  sage: '#26352B',
  ringTrack: '#4D3B33',
};
