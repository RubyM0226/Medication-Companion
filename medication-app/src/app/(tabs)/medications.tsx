import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { useSettings } from '@/context/settingsContext';

export default function MedicationsScreen() {
  const { colors, fontScale } = useSettings();

  return (
    <View style={styles.container}>
      <Text style={{ color: colors.textPrimary, fontSize: 16 * fontScale }}>Medications</Text>
      <Link href="/addMedication" style={{ color: colors.primary, fontSize: 16 * fontScale }}>
        Add Medication
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
});
