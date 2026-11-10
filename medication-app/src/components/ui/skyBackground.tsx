// The time-of-day sky behind each screen: a soft gradient, a pale sun and two
// low hills, with a faint paper grain on top. Purely decorative.
//
// Light theme: the full sky, changing with the phone's clock.
// Dark theme: only the grain, so the background stays dark and calm.
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
const SKIES: Record<TimeOfDay, { top: string; middle: string; bottom: string; sun: string; sunX: number; sunY: number }> = {
  morning: { top: '#FBE7BE', middle: '#FDF0D2', bottom: '#FEF4D9', sun: '#F7D99A', sunX: 70, sunY: 150 },
  afternoon: { top: '#FADFD2', middle: '#FCEBDA', bottom: '#FEF4D9', sun: '#F7D99A', sunX: 320, sunY: 110 },
  evening: { top: '#E4E1EA', middle: '#F4E1D9', bottom: '#FCEEDB', sun: '#F4C3A0', sunX: 300, sunY: 690 },
};

const grain = require('@/assets/images/grain.png');

// The color at the very top of the sky, for headers that sit above it.
export function skyTopColor(timeOfDay: TimeOfDay, isDark: boolean, highContrast: boolean, background: string) {
  if (isDark || highContrast) return background;
  return SKIES[timeOfDay].top;
}

// The grain is tiled with an SVG pattern rather than <Image resizeMode="repeat">,
// which draws a single tile on some phones. Each 128px tile covers 64pt, so the
// grain stays fine and sharp on high-density screens.
function Grain({ dim }: { dim: boolean }) {
  return (
    <Svg width="100%" height="100%" style={StyleSheet.absoluteFill} opacity={dim ? 0.5 : 1}>
      <Defs>
        <Pattern id="grain" patternUnits="userSpaceOnUse" width={64} height={64}>
          <Image href={grain} width={64} height={64} />
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
      {isDark ? null : (
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
      {/* On the dark background the brown grain is nearly invisible, so it is
          kept faint there rather than recolored. */}
      <Grain dim={isDark} />
    </View>
  );
}
