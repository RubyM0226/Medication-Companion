// The time-of-day sky behind each screen: a soft gradient, a pale sun and two
// low hills, with a faint paper grain on top. Purely decorative.
//
// Light theme: the full sky, changing with the phone's clock.
// Dark theme: only the grain, so the background stays dark and calm.
// High contrast: nothing at all, a plain background.
//
// Place it as the first child of a screen's root view; it fills the screen
// behind everything else and never takes touches.

import { Image, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { useSettings } from '@/context/settingsContext';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening';

export function getTimeOfDay(date = new Date()): TimeOfDay {
  const hour = date.getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
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

export function SkyBackground({ timeOfDay }: { timeOfDay?: TimeOfDay }) {
  const { isDark, toggles } = useSettings();
  if (toggles.highContrast) return null;

  const sky = SKIES[timeOfDay ?? getTimeOfDay()];

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
      <Image source={grain} resizeMode="repeat" style={[StyleSheet.absoluteFill, isDark && styles.darkGrain]} />
    </View>
  );
}

const styles = StyleSheet.create({
  // Brown grain barely shows on the dark background; lighten it a touch.
  darkGrain: { opacity: 0.6, tintColor: '#FEF4D9' },
});
