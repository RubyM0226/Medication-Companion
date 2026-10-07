import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';

export default function AddMedicationScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Add Medication</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { color: Colors.textPrimary },
});
