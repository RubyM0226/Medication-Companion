// Card look shared across the app (see components/ui/card.tsx): warm cream
// fill, thin border, rounded corners and no shadow, so cards sit flat on the
// sky. High contrast uses a thick border in the text color instead.

import { ViewStyle } from 'react-native';

import { ThemeColors } from '@/constants/colors';

export function cardStyle(colors: ThemeColors, highContrast: boolean, background = colors.surface): ViewStyle {
  return {
    backgroundColor: background,
    borderRadius: 22,
    padding: 18,
    borderWidth: highContrast ? 2 : 1,
    borderColor: highContrast ? colors.textPrimary : colors.ringTrack,
  };
}
