import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function MedicationsScreen() {
  return (
    <View style={styles.container}>
      <Text>Medications</Text>
      <Link href="/addMedication">Add Medication</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
});
