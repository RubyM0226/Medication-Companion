import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';

export default function MedicationsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Medications</Text>
      <Link href="/addMedication" style={styles.link}>Add Medication</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  text: { color: Colors.textPrimary },
  link: { color: Colors.primary },
});
