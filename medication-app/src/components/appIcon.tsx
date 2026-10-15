// App icons: SF Symbols on iOS and Material Symbols on Android, both through
// expo-symbols (included in Expo Go). Icons are decorative; the text next to
// them carries the meaning, so screen readers skip them.

import { SymbolView, SymbolViewProps } from 'expo-symbols';
import { ColorValue, Text } from 'react-native';

type SymbolName = Exclude<SymbolViewProps['name'], string>;

const ICONS = {
  home: { ios: 'house', android: 'home', web: 'home' },
  homeActive: { ios: 'house.fill', android: 'home', web: 'home' },
  medications: { ios: 'pills', android: 'medication', web: 'medication' },
  medicationsActive: { ios: 'pills.fill', android: 'medication', web: 'medication' },
  lookup: { ios: 'magnifyingglass', android: 'search', web: 'search' },
  history: { ios: 'clock.arrow.circlepath', android: 'history', web: 'history' },
  settings: { ios: 'gearshape', android: 'settings', web: 'settings' },
  settingsActive: { ios: 'gearshape.fill', android: 'settings', web: 'settings' },
  lock: { ios: 'lock.fill', android: 'lock', web: 'lock' },
  profile: { ios: 'person.crop.circle', android: 'account_circle', web: 'account_circle' },
  speaker: { ios: 'speaker.wave.2.fill', android: 'volume_up', web: 'volume_up' },
  caregiver: { ios: 'person.2.fill', android: 'group', web: 'group' },
  pill: { ios: 'pill.fill', android: 'pill', web: 'pill' },
  clock: { ios: 'clock', android: 'schedule', web: 'schedule' },
  snooze: { ios: 'bell.badge', android: 'snooze', web: 'snooze' },
  check: { ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' },
  add: { ios: 'plus.circle.fill', android: 'add', web: 'add' },
  info: { ios: 'info.circle', android: 'info', web: 'info' },
  chevron: { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' },
} satisfies Record<string, SymbolName>;

export type IconName = keyof typeof ICONS;

export function AppIcon({ name, size = 24, color }: { name: IconName; size?: number; color: ColorValue }) {
  return (
    <SymbolView
      name={ICONS[name]}
      size={size}
      tintColor={color}
      fallback={<Text style={{ color, fontSize: size * 0.8 }}>•</Text>}
      accessibilityElementsHidden
      importantForAccessibility="no"
    />
  );
}
