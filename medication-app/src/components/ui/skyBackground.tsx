// The time-of-day sky behind each screen: a soft gradient, a pale sun and two
// low hills, with a faint paper grain on top. Purely decorative.
//
// Light theme: the full sky, changing with the phone's clock.
// Dark theme: a night sky (plum to deep brown, a few faint stars, a crescent
// moon, dark hills) with a light grain. Cream text stays above 12:1 on every
// part of it, and the stars are tiny and faint so they never sit behind text
// as a distraction.
// High contrast: nothing at all, a plain background.
//
// Place it as the first child of a screen's root view; it fills the screen
// behind everything else and never takes touches.

import { useSyncExternalStore } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Image, LinearGradient, Path, Pattern, Rect, Stop } from 'react-native-svg';

import { useSettings } from '@/context/settingsContext';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening';

export function getTimeOfDay(date = new Date()): TimeOfDay {
  const hour = date.getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

// TEMPORARY design check: lets the team see every sky without waiting for the
// clock (Settings > Sky preview, development builds only). Not saved; the app
// goes back to the real time when it restarts. Remove after the design review.
let skyPreview: TimeOfDay | null = null;
const previewListeners = new Set<() => void>();

export function setSkyPreview(timeOfDay: TimeOfDay | null) {
  skyPreview = timeOfDay;
  previewListeners.forEach((listener) => listener());
}

function subscribePreview(listener: () => void) {
  previewListeners.add(listener);
  return () => {
    previewListeners.delete(listener);
  };
}

export function useSkyPreview() {
  return useSyncExternalStore(subscribePreview, () => skyPreview, () => null);
}

// The time of day to draw: the preview when one is picked, otherwise the clock.
export function useTimeOfDay(date?: Date): TimeOfDay {
  return useSkyPreview() ?? getTimeOfDay(date);
}

export function greetingFor(timeOfDay: TimeOfDay) {
  return { morning: 'Good morning', afternoon: 'Good afternoon', evening: 'Good evening' }[timeOfDay];
}

// Pale tints only, so ink text stays above 10:1 even on the darkest spot.
// The sun sits low, half behind the hills, so it never ends up behind a title.
const SKIES: Record<TimeOfDay, { top: string; middle: string; bottom: string; sun: string; sunX: number; sunY: number }> = {
  morning: { top: '#FBE7BE', middle: '#FDF0D2', bottom: '#FEF4D9', sun: '#F7D99A', sunX: 70, sunY: 690 },
  afternoon: { top: '#FADFD2', middle: '#FCEBDA', bottom: '#FEF4D9', sun: '#F7D99A', sunX: 330, sunY: 700 },
  evening: { top: '#E4E1EA', middle: '#F4E1D9', bottom: '#FCEEDB', sun: '#F4C3A0', sunX: 300, sunY: 690 },
};

// Contrast with cream text: top 14.5, middle 15.9, hills 12.6.
const NIGHT = {
  top: '#2E1C30',
  middle: '#24151F',
  bottom: '#1C0F0D',
  moon: '#CDBB94',
  farHill: '#25301F',
  nearHill: '#382A1C',
  star: '#F4E6C4',
};

// Fixed positions, so the stars do not jump around between screens.
const STARS: [number, number, number][] = [
  [34, 96, 1.4], [92, 52, 1], [148, 128, 1.2], [206, 70, 1.6], [262, 150, 1], [318, 46, 1.3],
  [362, 118, 1], [58, 214, 1], [122, 262, 1.3], [238, 232, 1], [300, 300, 1.2], [352, 246, 1],
  [24, 360, 1.2], [180, 352, 1], [276, 410, 1.1], [90, 452, 1], [342, 470, 1.3], [200, 500, 1],
];

const grain = require('@/assets/images/grain.png');
const grainLight = require('@/assets/images/grain-light.png');

// The color at the very top of the sky, for headers that sit above it.
export function skyTopColor(timeOfDay: TimeOfDay, isDark: boolean, highContrast: boolean, background: string) {
  if (highContrast) return background;
  if (isDark) return NIGHT.top;
  return SKIES[timeOfDay].top;
}

// The grain is tiled with an SVG pattern rather than <Image resizeMode="repeat">,
// which draws a single tile on some phones. Each 128px tile covers 64pt, so the
// grain stays fine and sharp on high-density screens.
// On dark backgrounds a light grain is used, since the brown one disappears.
function Grain({ light }: { light: boolean }) {
  return (
    <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
      <Defs>
        <Pattern id="grain" patternUnits="userSpaceOnUse" width={64} height={64}>
          <Image href={light ? grainLight : grain} width={64} height={64} />
        </Pattern>
      </Defs>
      <Rect x={0} y={0} width="100%" height="100%" fill="url(#grain)" />
    </Svg>
  );
}

export function SkyBackground({ timeOfDay }: { timeOfDay?: TimeOfDay }) {
  const { isDark, toggles } = useSettings();
  const preview = useSkyPreview();
  if (toggles.highContrast) return null;

  const sky = SKIES[preview ?? timeOfDay ?? getTimeOfDay()];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {isDark ? (
        <NightSky />
      ) : (
        <Svg width="100%" height="100%" viewBox="0 0 390 844" preserveAspectRatio="xMidYMax slice">
          <Defs>
            <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={sky.top} />
              <Stop offset="0.42" stopColor={sky.middle} />
              <Stop offset="0.72" stopColor={sky.bottom} />
            </LinearGradient>
          </Defs>
          <Rect x={0} y={0} width={390} height={844} fill="url(#sky)" />
          <Circle cx={sky.sunX} cy={sky.sunY} r={46} fill={sky.sun} />
          <Path d="M0 844V700c80-56 190-62 280-30s90 36 110 32v142z" fill="#DFE8CC" />
          <Path d="M150 844c40-70 140-96 240-66v66z" fill="#F7E2B0" />
        </Svg>
      )}
      <Grain light={isDark} />
    </View>
  );
}

function NightSky() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 390 844" preserveAspectRatio="xMidYMax slice">
      <Defs>
        <LinearGradient id="night" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={NIGHT.top} />
          <Stop offset="0.45" stopColor={NIGHT.middle} />
          <Stop offset="0.8" stopColor={NIGHT.bottom} />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={390} height={844} fill="url(#night)" />
      {STARS.map(([x, y, radius]) => (
        <Circle key={`${x}-${y}`} cx={x} cy={y} r={radius} fill={NIGHT.star} opacity={0.45} />
      ))}
      {/* A crescent moon, fully above the hills so it reads as a moon, and low
          enough that it never sits behind a title. */}
      <Path d="M322 548a40 40 0 1 0 0 80a20 40 0 1 1 0-80z" fill={NIGHT.moon} />
      <Path d="M0 844V700c80-56 190-62 280-30s90 36 110 32v142z" fill={NIGHT.farHill} />
      <Path d="M150 844c40-70 140-96 240-66v66z" fill={NIGHT.nearHill} />
    </Svg>
  );
}

// The background for navigation headers (Log in, Sign up, Add medicine,
// Medicine details): the sky's top color with the same grain, so the texture
// carries on up to the top of the screen instead of stopping at the header.
export function HeaderSky() {
  const { colors, isDark, toggles } = useSettings();
  const timeOfDay = useTimeOfDay();
  return (
    <View
      style={[StyleSheet.absoluteFill, { backgroundColor: skyTopColor(timeOfDay, isDark, toggles.highContrast, colors.background) }]}
      pointerEvents="none">
      {toggles.highContrast ? null : <Grain light={isDark} />}
    </View>
  );
}
