// Brand palette and semantic color roles. Screens must import from here
// rather than hardcoding hex values.
//
// WCAG 2.2 contrast ratios for the pairings used as text:
//   darkBrown on cream   15.93  (AA normal text)
//   teal on cream         6.99  (AA normal text)
//   rustOrange on cream   5.62  (AA normal text)
//   cream on teal         6.99  (AA normal text)
//   darkBrown on mutedGold 7.76 (AA normal text)
//   textSecondary on cream 7.60 (AA normal text)
//   colorBlindBlue on cream   7.15, colorBlindOrange on cream 5.71
//   inputText on inputBackground 16.88, inputPlaceholder 8.05
//   onSuccess on success 13.11
//
// success (soft green) on cream is only 1.21:1, so like gold it is a fill
// behind onSuccess text, always with a border and a text label.
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

  // Descriptions and helper text. Also the off-state switch track, which
  // needs 3:1 against the background to be visible.
  textSecondary: '#5C4A45',

  // Status colors used when color-blind-friendly indicators are on. Blue and
  // orange stay distinguishable for red-green color vision deficiencies.
  colorBlindBlue: '#0B5394',
  colorBlindOrange: '#9A4A00',

  // Text fields. Give them a textPrimary border so the edge is visible.
  inputBackground: '#FFFBEF',
  inputText: '#291411',
  inputPlaceholder: '#5C4A45',

  // Soft green fill for positive status chips.
  success: '#CFE6C4',
  onSuccess: '#291411',
};

// The dark and high contrast themes provide another object with these same keys.
export type ThemeColors = typeof Colors;

export type MedicationStatus = 'taken' | 'missed' | 'upcoming' | 'skipped';

// Status must always be shown with its icon and label; color only reinforces
// it. Color-blind-friendly mode swaps to blue/orange and adds a border style
// per status, so the four statuses differ in shape as well as color.
export type StatusStyle = {
  icon: string;
  label: string;
  textColor: string;
  backgroundColor: string;
  borderColor: string;
  borderStyle: 'solid' | 'dashed' | 'dotted';
  borderWidth: number;
};

export function getStatusDisplay(
  colors: ThemeColors,
  colorBlindFriendly: boolean,
): Record<MedicationStatus, StatusStyle> {
  const taken = colorBlindFriendly ? colors.colorBlindBlue : colors.primary;
  const missed = colorBlindFriendly ? colors.colorBlindOrange : colors.danger;
  const thick = colorBlindFriendly ? 3 : 1.5;

  return {
    taken: {
      icon: '✓',
      label: 'Taken',
      textColor: taken,
      backgroundColor: colors.background,
      borderColor: taken,
      borderStyle: 'solid',
      borderWidth: 1.5,
    },
    missed: {
      icon: '⚠',
      label: 'Missed',
      textColor: missed,
      backgroundColor: colors.background,
      borderColor: missed,
      borderStyle: 'solid',
      borderWidth: thick,
    },
    upcoming: {
      icon: '⏰',
      label: 'Upcoming',
      textColor: colors.onAccent,
      backgroundColor: colors.accent,
      borderColor: colors.onAccent,
      borderStyle: colorBlindFriendly ? 'dotted' : 'solid',
      borderWidth: colorBlindFriendly ? 2 : 0,
    },
    skipped: {
      icon: '—',
      label: 'Skipped',
      textColor: colors.textPrimary,
      backgroundColor: colors.background,
      borderColor: colors.textPrimary,
      borderStyle: colorBlindFriendly ? 'dashed' : 'solid',
      borderWidth: colorBlindFriendly ? 2 : 1.5,
    },
  };
}
