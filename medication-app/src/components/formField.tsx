// Labelled text field with an optional help line and error message. The
// error is shown in bold text with a thicker border, not color alone.

import { StyleSheet, TextInputProps, View } from 'react-native';

import { Text, TextInput } from '@/components/ui/text';
import { Fonts } from '@/constants/typography';
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
      <Text style={[styles.label, { color: colors.textPrimary, fontSize: 17 * fontScale }]}>
        {fullLabel}
      </Text>
      {help ? (
        <Text style={[styles.help, { color: colors.textSecondary, fontSize: 15 * fontScale }]}>{help}</Text>
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
            minHeight: multiline ? touchTarget * 2 : Math.max(touchTarget + 4, 56),
            backgroundColor: colors.inputBackground,
            color: colors.inputText,
            borderColor: error ? colors.danger : colors.line,
            borderWidth: error ? 3 : 2,
            fontSize: 18 * fontScale,
          },
          multiline && styles.multiline,
        ]}
      />
      {error ? (
        <Text
          style={[styles.error, { color: colors.danger, fontSize: 15 * fontScale }]}
          accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 18 },
  label: { fontFamily: Fonts.bodyBold, marginBottom: 6 },
  help: { fontFamily: Fonts.body, marginBottom: 6 },
  input: { fontFamily: Fonts.body, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 10 },
  multiline: { textAlignVertical: 'top' },
  error: { fontFamily: Fonts.bodyBold, marginTop: 6 },
});
