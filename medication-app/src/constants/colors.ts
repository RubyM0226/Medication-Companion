// Brand palette and semantic color roles. Screens must import from here
// rather than hardcoding hex values.
//
// Palette (design refresh, Nov 2026): ink, cream, forest, rust and gold, plus
// one quiet brown for outlines. See the "Art system" board on the design canvas.
//
// WCAG 2.2 contrast ratios. AA needs 4.5:1 for normal text and 3:1 for
// large text (18pt+, or 14pt bold) and UI components such as icons and borders.
//
// On background (cream #FEF4D9):
//   textPrimary (ink)                15.93
//   textSecondary                     8.62
//   primary (forest)                  7.05  (onPrimary cream on forest 7.05)
//   danger (rust)                     5.62  (onDanger cream on rust 5.62)
//   line (outlines, 3:1 needed)       5.68
//   colorBlindBlue 7.15, colorBlindOrange 5.71
// On surface (warm card #FCEFD6):
//   ink 15.35, textSecondary 8.31, forest 6.80, rust 5.42, line 5.47
// Fills behind ink text:
//   accent (gold) 7.76, accentSoft (pale gold) 13.69, sage 14.23
//
// Rust is only for missed doses and urgent alerts. Main buttons use primary.
// Gold is a highlight fill (ticket stub, active tab), never a text color.

export const Colors = {
  // Palette
  ink: '#291411',
  cream: '#FEF4D9',
  forest: '#3B5B2A',
  rust: '#A44234',
  gold: '#D9A441',

  // Roles
  background: '#FEF4D9',
  textPrimary: '#291411',
  textSecondary: '#5C3F37',
  primary: '#3B5B2A',
  onPrimary: '#FEF4D9',
  accent: '#D9A441',
  onAccent: '#291411',
  // Pale gold, for the next-dose ticket stub and soft highlights.
  accentSoft: '#F7E2B0',
  danger: '#A44234',
  onDanger: '#FEF4D9',

  // Outlines on inputs, outlined buttons and switches that are off. 3:1 or more
  // on both background and surface.
  line: '#7A5A44',

  // Status colors used when color-blind-friendly indicators are on. Blue and
  // orange stay distinguishable for red-green color vision deficiencies.
  colorBlindBlue: '#0B5394',
  colorBlindOrange: '#9A4A00',

  // Text fields. Give them a line border so the edge is visible.
  inputBackground: '#FCEFD6',
  inputText: '#291411',
  inputPlaceholder: '#5C3F37',

  // Soft green fill for positive status chips.
  success: '#E6EBCB',
  onSuccess: '#291411',

  // Warm cream cards, and soft sage for progress and privacy.
  surface: '#FCEFD6',
  sage: '#E6EBCB',
  // Card borders and the unfilled part of the progress ring. Decorative, so it
  // does not need 3:1; forest on it is 4.4:1 for the filled ring.
  ringTrack: '#D8C091',
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
      backgroundColor: colors.surface,
      borderColor: taken,
      borderStyle: 'solid',
      borderWidth: 1.5,
    },
    missed: {
      icon: '✕',
      label: 'Missed',
      textColor: missed,
      backgroundColor: colors.surface,
      borderColor: missed,
      borderStyle: 'solid',
      borderWidth: thick,
    },
    upcoming: {
      icon: '◷',
      label: 'Later',
      textColor: colors.textPrimary,
      backgroundColor: colors.surface,
      borderColor: colors.line,
      borderStyle: colorBlindFriendly ? 'dotted' : 'solid',
      borderWidth: colorBlindFriendly ? 2 : 1.5,
    },
    skipped: {
      icon: '—',
      label: 'Skipped',
      textColor: colors.textSecondary,
      backgroundColor: colors.surface,
      borderColor: colors.line,
      borderStyle: 'dashed',
      borderWidth: colorBlindFriendly ? 2 : 1.5,
    },
  };
}
