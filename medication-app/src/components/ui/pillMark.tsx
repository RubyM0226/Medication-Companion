// A small drawing of the actual pill, so people can match a medicine to what is
// in their hand. Shape plus the medicine's name tells medicines apart, so this
// never relies on color alone. Decorative: screen readers skip it.
//
// White pills get a thin outline so they stay visible on cream.

import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

export type PillForm = 'round' | 'oval' | 'oblong' | 'capsule' | 'softgel';

export const PILL_FORMS: { value: PillForm; label: string }[] = [
  { value: 'round', label: 'Round' },
  { value: 'oval', label: 'Oval' },
  { value: 'oblong', label: 'Long' },
  { value: 'capsule', label: 'Capsule' },
  { value: 'softgel', label: 'Softgel' },
];

// Every color is 3:1 or more against the cream card, except white, which is
// drawn with an outline.
export const PILL_COLORS: { value: string; label: string }[] = [
  { value: '#FFFFFF', label: 'White' },
  { value: '#B04A6A', label: 'Pink' },
  { value: '#A44234', label: 'Red' },
  { value: '#8F6410', label: 'Yellow' },
  { value: '#3B5B2A', label: 'Green' },
  { value: '#2E3D63', label: 'Blue' },
];

const OUTLINE = '#5C3F37';
const HIGHLIGHT = '#FEF4D9';

export function PillMark({
  form = 'round',
  color = '#FFFFFF',
  size = 40,
}: {
  form?: PillForm;
  color?: string;
  size?: number;
}) {
  const white = color.toUpperCase() === '#FFFFFF';
  const outline = white ? OUTLINE : 'none';
  const detail = white ? '#9A7E6E' : HIGHLIGHT;

  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" accessibilityElementsHidden importantForAccessibility="no">
      {form === 'round' ? (
        <G>
          <Circle cx={20} cy={20} r={14.5} fill={color} stroke={outline} strokeWidth={2} />
          <Path d="M10 20h20" stroke={detail} strokeWidth={2.2} strokeLinecap="round" />
        </G>
      ) : null}
      {form === 'oval' ? (
        <Ellipse cx={20} cy={20} rx={16} ry={10.5} fill={color} stroke={outline} strokeWidth={2} rotation={-30} origin="20, 20" />
      ) : null}
      {form === 'oblong' ? (
        <G rotation={-35} origin="20, 20">
          <Rect x={3} y={12.5} width={34} height={15} rx={7.5} fill={color} stroke={outline} strokeWidth={2} />
          <Path d="M20 15v10" stroke={detail} strokeWidth={2} strokeLinecap="round" />
        </G>
      ) : null}
      {form === 'capsule' ? (
        <G rotation={-35} origin="20, 20">
          <Path d="M20 11.5h-9a8.5 8.5 0 0 0 0 17h9z" fill={color} stroke={white ? OUTLINE : color} strokeWidth={2} />
          <Path d="M20 11.5h9a8.5 8.5 0 0 1 0 17h-9z" fill={HIGHLIGHT} stroke={white ? OUTLINE : color} strokeWidth={2} />
        </G>
      ) : null}
      {form === 'softgel' ? (
        <G>
          <Ellipse cx={20} cy={20} rx={12.5} ry={16} fill={color} stroke={outline} strokeWidth={2} rotation={25} origin="20, 20" />
          <Ellipse cx={15.5} cy={13.5} rx={2.6} ry={4.6} fill={HIGHLIGHT} opacity={0.75} rotation={25} origin="15.5, 13.5" />
        </G>
      ) : null}
    </Svg>
  );
}
