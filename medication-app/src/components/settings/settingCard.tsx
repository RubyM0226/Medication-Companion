// Card that every Settings row sits in. Same look as the app's other cards.

import { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { useSettings } from '@/context/settingsContext';

export function SettingCard({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors, touchTarget, toggles } = useSettings();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: toggles.highContrast ? colors.textPrimary : colors.ringTrack,
          borderWidth: toggles.highContrast ? 2 : 1,
          minHeight: touchTarget + 24,
        },
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 12,
    borderRadius: 18,
    justifyContent: 'center',
  },
});
