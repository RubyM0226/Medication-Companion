// Brand palette and semantic color roles. Screens must import from here
// rather than hardcoding hex values.
//
// WCAG 2.2 contrast ratios for the pairings used as text:
//   darkBrown on cream   15.93  (AA normal text)
//   teal on cream         6.99  (AA normal text)
//   rustOrange on cream   5.62  (AA normal text)
//   cream on teal         6.99  (AA normal text)
//   darkBrown on mutedGold 7.76 (AA normal text)
//
// mutedGold on cream is only 2.05:1, so gold must never be text, icons or
// borders on a cream background. Use it as a fill behind darkBrown text.

export const Colors = {
  rustOrange: '#A44234',
  cream: '#FEF4D9',
  darkBrown: '#291411',
  teal: '#245B60',
  mutedGold: '#D9A441',

  background: '#FEF4D9',
  textPrimary: '#291411',
  primary: '#245B60',
  accent: '#D9A441',
  danger: '#A44234',

  // Foreground colors for text/icons placed on a filled role color.
  onPrimary: '#FEF4D9',
  onAccent: '#291411',
  onDanger: '#FEF4D9',
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
