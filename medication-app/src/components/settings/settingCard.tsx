// Bordered card that every Settings row sits in.

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
  const { colors, touchTarget } = useSettings();

  return (
    <View
      style={[styles.card, { borderColor: colors.textPrimary, minHeight: touchTarget + 24 }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    borderRadius: 12,
    justifyContent: 'center',
  },
});
