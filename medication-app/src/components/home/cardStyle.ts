// Rounded card look shared by Home. A subtle shadow normally; a solid border
// in high contrast, where shadows are hard to see.

import { ViewStyle } from 'react-native';

import { ThemeColors } from '@/constants/colors';

export function cardStyle(colors: ThemeColors, highContrast: boolean, background = colors.surface): ViewStyle {
  return {
    backgroundColor: background,
    borderRadius: 20,
    padding: 18,
    borderWidth: highContrast ? 2 : 1,
    borderColor: highContrast ? colors.textPrimary : colors.ringTrack,
    shadowColor: '#000000',
    shadowOpacity: highContrast ? 0 : 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: highContrast ? 0 : 2,
  };
}
