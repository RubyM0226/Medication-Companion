// Brand palette and semantic color roles. Screens must import from here
// rather than hardcoding hex values.
//
// WCAG 2.2 contrast ratios. AA needs 4.5:1 for normal text and 3:1 for
// large text (18pt+, or 14pt bold) and UI components such as icons.
//
// Pass AA for normal text:
//   textPrimary (cream) on background (darkBlue)        9.39
//   primary (mutedLime) on background (darkBlue)        7.07
//   onPrimary (darkBlue) on primary (mutedLime)         7.07
//   accent (lightOrange) on background (darkBlue)       4.73
//   onAccent (darkBlue) on accent (lightOrange)         4.73
//
// Large text and icons only (3:1), not normal text:
//   danger (burntOrange) on background (darkBlue)       3.27
//
// FAILS, even for large text (below 3:1):
//   onDanger (cream) on danger (burntOrange)            2.87
//
// Never put burntOrange (2.87), lightOrange (1.99) or mutedLime (1.33) as
// text, icons or borders on a cream background. Use them as fills behind
// darkBlue text instead.

export const Colors = {
  burntOrange: '#FF6200',
  cream: '#FFFCCF',
  darkBlue: '#2A446B',
  mutedLime: '#CAE49F',
  lightOrange: '#FF9B61',

  background: '#2A446B',
  textPrimary: '#FFFCCF',
  primary: '#CAE49F',
  accent: '#FF9B61',
  danger: '#FF6200',

  // Foreground colors for text/icons placed on a filled role color.
  onPrimary: '#2A446B',
  onAccent: '#2A446B',
  onDanger: '#0F1F3A',
};

// Future high-contrast, dark and color-vision-friendly modes should provide
// another object with these same keys.
export type ThemeColors = typeof Colors;

export type MedicationStatus = 'taken' | 'missed' | 'upcoming' | 'skipped';

// Status must always be shown with its icon and label; color only reinforces it.
export const StatusDisplay: Record<
  MedicationStatus,
  { icon: string; label: string; textColor: string; backgroundColor: string }
> = {
  taken: { icon: '✓', label: 'Taken', textColor: Colors.teal, backgroundColor: Colors.cream },
  missed: { icon: '⚠', label: 'Missed', textColor: Colors.rustOrange, backgroundColor: Colors.cream },
  upcoming: { icon: '⏰', label: 'Upcoming', textColor: Colors.darkBrown, backgroundColor: Colors.mutedGold },
  skipped: { icon: '—', label: 'Skipped', textColor: Colors.darkBrown, backgroundColor: Colors.cream },
};
