import { StyleSheet, Text, View } from 'react-native';

export default function AddMedicationScreen() {
  return (
    <View style={styles.container}>
      <Text>Add Medication</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
