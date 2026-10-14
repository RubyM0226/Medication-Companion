import { StyleSheet, Text, View } from 'react-native';

import { useSettings } from '@/context/settingsContext';

export default function LoginScreen() {
  const { colors, fontScale } = useSettings();

  return (
    <View style={styles.container}>
      <Text style={{ color: colors.textPrimary, fontSize: 16 * fontScale }}>Log In</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
