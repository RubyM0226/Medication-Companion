import { StyleSheet, Text, View } from 'react-native';

export default function LookupScreen() {
  return (
    <View style={styles.container}>
      <Text>Lookup</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
