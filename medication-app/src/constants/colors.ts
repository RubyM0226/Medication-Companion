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

  // White cards for medications, and soft sage for progress and privacy.
  surface: '#FFFFFF',
  sage: '#DDE8D3',
  // Unfilled part of the progress ring, drawn on sage.
  ringTrack: '#B9CDB0',
  onPrimary: '#2A446B',
  onAccent: '#2A446B',
  onDanger: '#0F1F3A',
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
      label: 'Pending',
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
