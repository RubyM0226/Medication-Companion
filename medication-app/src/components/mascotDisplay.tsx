// The chosen dinosaur in a rounded cream frame. The artwork has a white
// background, so the frame stays light in every theme to look intentional.
// Decorative by default: screen readers skip it.

import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { findMascot, MascotChoice } from '@/constants/mascots';
import { useSettings } from '@/context/settingsContext';

export function MascotDisplay({ choice, size = 72 }: { choice?: MascotChoice; size?: number }) {
  const { colors, mascot } = useSettings();
  const found = findMascot(choice ?? mascot);
  if (!found) return null;

  return (
    <View
      style={[styles.frame, { width: size, height: size, borderColor: colors.textPrimary }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      <Image source={found.image} style={styles.image} contentFit="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: 18,
    borderWidth: 1.5,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    padding: 4,
  },
  image: { flex: 1 },
});
