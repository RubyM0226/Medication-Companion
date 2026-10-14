import { StyleSheet, Text, View } from 'react-native';

import { useSettings } from '@/context/settingsContext';

export default function AddMedicationScreen() {
  const { colors, fontScale } = useSettings();

  return (
    <View style={styles.container}>
      <Text style={{ color: colors.textPrimary, fontSize: 16 * fontScale }}>Add Medication</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
