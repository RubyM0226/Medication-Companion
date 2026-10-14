import { ThemeColors } from '@/constants/colors';

// High contrast theme with the same keys as Colors. Each brand key maps to the
// color that takes its role here, so cream (the background) becomes black.
//
// WCAG 2.2 contrast ratios on black:
//   white   21.00
//   yellow  16.56  (also black on yellow)
//   coral    7.57  (also black on coral)
export const HighContrastColors: ThemeColors = {
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
};
