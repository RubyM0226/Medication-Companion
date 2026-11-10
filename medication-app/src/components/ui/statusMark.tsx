// Drawn status marks used in History, the dose list and status badges:
// check for taken, cross for missed, dash for skipped, dotted ring for later.
// Shapes differ, so status never depends on color. Decorative: always pair a
// mark with a text label (or give the parent an accessibilityLabel).
//
// These are placeholders for the team's hand-drawn versions; keep the same
// props when swapping the drawings in.

import Svg, { Circle, Path } from 'react-native-svg';

import { MedicationStatus } from '@/constants/colors';
import { useSettings } from '@/context/settingsContext';

export function StatusMark({ status, size = 22 }: { status: MedicationStatus; size?: number }) {
  const { colors, toggles } = useSettings();
  const takenColor = toggles.colorBlindFriendly ? colors.colorBlindBlue : colors.primary;
  const missedColor = toggles.colorBlindFriendly ? colors.colorBlindOrange : colors.danger;

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no">
      {status === 'taken' ? (
        <Path d="M4.5 12.5l5 5L19.5 7" stroke={takenColor} strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      ) : null}
      {status === 'missed' ? (
        <Path d="M6.5 6.5l11 11M17.5 6.5l-11 11" stroke={missedColor} strokeWidth={2.8} strokeLinecap="round" fill="none" />
      ) : null}
      {status === 'skipped' ? (
        <Path d="M5.5 12h13" stroke={colors.textSecondary} strokeWidth={2.8} strokeLinecap="round" fill="none" />
      ) : null}
      {status === 'upcoming' ? (
        <Circle cx={12} cy={12} r={7.5} stroke={colors.line} strokeWidth={2} strokeDasharray="2 3" fill="none" />
      ) : null}
    </Svg>
  );
}
