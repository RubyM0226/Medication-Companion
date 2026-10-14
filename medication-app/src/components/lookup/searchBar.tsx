// Large search field with separate Clear and Search buttons.

import { forwardRef } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { AccessibleButton } from '@/components/accessibleButton';
import { useSettings } from '@/context/settingsContext';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  // Shown under the field, e.g. when the search is too short.
  message?: string;
};

export const SearchBar = forwardRef<TextInput, Props>(function SearchBar(
  { value, onChangeText, onSubmit, onClear, message },
  ref,
) {
  const { colors, fontScale, touchTarget } = useSettings();

  return (
    <View>
      <Text
        style={[styles.label, { color: colors.textPrimary, fontSize: 16 * fontScale }]}
        nativeID="drug-search-label">
        Medication name
      </Text>
      <TextInput
        ref={ref}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder="Brand or generic name, e.g. Advil or ibuprofen"
        placeholderTextColor={colors.inputPlaceholder}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityLabel="Medication name"
        accessibilityLabelledBy="drug-search-label"
        accessibilityHint="Type a brand or generic name, then search"
        style={[
          styles.input,
          {
            minHeight: touchTarget + 8,
            backgroundColor: colors.inputBackground,
            color: colors.inputText,
            borderColor: colors.textPrimary,
            fontSize: 18 * fontScale,
          },
        ]}
      />
      {message ? (
        <Text
          style={[styles.message, { color: colors.danger, fontSize: 14 * fontScale }]}
          accessibilityLiveRegion="polite">
          ⓘ {message}
        </Text>
      ) : null}
      <View style={styles.buttons}>
        {value ? (
          <AccessibleButton
            label="Clear"
            icon="✕"
            onPress={onClear}
            accessibilityLabel="Clear search"
            style={styles.button}
          />
        ) : null}
        <AccessibleButton
          label="Search"
          icon="🔍"
          variant="primary"
          onPress={onSubmit}
          accessibilityHint="Searches FDA drug labels"
          style={[styles.button, styles.searchButton]}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  label: { fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 16 },
  message: { marginTop: 6, fontWeight: '600' },
  buttons: { flexDirection: 'row', gap: 10, marginTop: 10 },
  button: { flexGrow: 1 },
  searchButton: { flexGrow: 2 },
});
