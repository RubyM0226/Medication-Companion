// Labelled text field with an optional help line and error message. The
// error is shown as text with an icon and a thicker border, not color alone.

import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { useSettings } from '@/context/settingsContext';

type Props = Omit<TextInputProps, 'style'> & {
  label: string;
  help?: string;
  error?: string;
  required?: boolean;
};

export function FormField({ label, help, error, required, multiline, ...inputProps }: Props) {
  const { colors, fontScale, touchTarget } = useSettings();
  const fullLabel = required ? `${label} (required)` : `${label} (optional)`;

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.textPrimary, fontSize: 16 * fontScale }]}>
        {fullLabel}
      </Text>
      {help ? (
        <Text style={{ color: colors.textSecondary, fontSize: 14 * fontScale, marginBottom: 6 }}>{help}</Text>
      ) : null}
      <TextInput
        {...inputProps}
        multiline={multiline}
        placeholderTextColor={colors.inputPlaceholder}
        accessibilityLabel={fullLabel}
        accessibilityHint={error ? `Error: ${error}` : help}
        style={[
          styles.input,
          {
            minHeight: multiline ? touchTarget * 2 : touchTarget + 4,
            backgroundColor: colors.inputBackground,
            color: colors.inputText,
            borderColor: error ? colors.danger : colors.textPrimary,
            borderWidth: error ? 2.5 : 1.5,
            fontSize: 17 * fontScale,
          },
          multiline && styles.multiline,
        ]}
      />
      {error ? (
        <Text
          style={[styles.error, { color: colors.danger, fontSize: 14 * fontScale }]}
          accessibilityLiveRegion="polite">
          ⚠ {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 18 },
  label: { fontWeight: '700', marginBottom: 4 },
  input: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  multiline: { textAlignVertical: 'top' },
  error: { marginTop: 6, fontWeight: '700' },
});
