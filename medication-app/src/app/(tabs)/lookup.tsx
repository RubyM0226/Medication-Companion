import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';

export default function LookupScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Lookup</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { color: Colors.textPrimary },
});
