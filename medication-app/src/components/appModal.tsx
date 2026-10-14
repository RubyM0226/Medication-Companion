// Centered dialog used for confirmations and details. Fades in, or appears
// instantly when reduced motion is on. Android back and tapping outside close
// it.

import { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useSettings } from '@/context/settingsContext';

export function AppModal({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const { colors, fontScale, reduceMotion } = useSettings();

  return (
    <Modal
      visible={visible}
      transparent
      animationType={reduceMotion ? 'none' : 'fade'}
      onRequestClose={onClose}
      statusBarTranslucent>
      <View style={styles.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close"
        />
        <View
          style={[styles.dialog, { backgroundColor: colors.background, borderColor: colors.textPrimary }]}
          accessibilityViewIsModal>
          <ScrollView contentContainerStyle={styles.content}>
            <Text
              style={[styles.title, { color: colors.textPrimary, fontSize: 22 * fontScale }]}
              accessibilityRole="header">
              {title}
            </Text>
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    padding: 16,
  },
  dialog: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '90%',
    alignSelf: 'center',
    borderRadius: 20,
    borderWidth: 1.5,
  },
  content: { padding: 20, gap: 12 },
  title: { fontWeight: '700' },
});
