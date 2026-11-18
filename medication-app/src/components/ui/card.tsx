// The warm cream card used on every screen: solid fill, thin border, no shadow.
// High contrast swaps to a thick border in the text color.

import { ReactNode } from 'react';
import { StyleProp, View, ViewProps, ViewStyle } from 'react-native';

import { cardStyle } from '@/components/home/cardStyle';
import { useSettings } from '@/context/settingsContext';

export function Card({
  children,
  background,
  style,
  ...rest
}: ViewProps & { children: ReactNode; background?: string; style?: StyleProp<ViewStyle> }) {
  const { colors, toggles } = useSettings();
  return (
    <View {...rest} style={[cardStyle(colors, toggles.highContrast, background), style]}>
      {children}
    </View>
  );
}
