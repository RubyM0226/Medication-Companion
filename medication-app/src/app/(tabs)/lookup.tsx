import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AccessibleButton } from '@/components/accessibleButton';
import { DrugResultRow } from '@/components/lookup/drugResultRow';
import { SearchBar } from '@/components/lookup/searchBar';
import { useSettings } from '@/context/settingsContext';
import { MIN_QUERY_LENGTH, useDrugSearch } from '@/hooks/useDrugSearch';

export default function LookupScreen() {
  const { colors, fontScale: scale, reduceMotion } = useSettings();
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState<string>();
  const inputRef = useRef<TextInput>(null);
  const { state, recent, search, reset, clearRecent } = useDrugSearch();

  // Screen readers do not notice new content below the search bar on their own.
  useEffect(() => {
    if (state.status === 'results') {
      AccessibilityInfo.announceForAccessibility(
        `${state.results.length} ${state.results.length === 1 ? 'product' : 'products'} found`,
      );
    } else if (state.status === 'empty') {
      AccessibilityInfo.announceForAccessibility('No results found');
    } else if (state.status === 'error') {
      AccessibilityInfo.announceForAccessibility(`Search failed. ${state.error.message}`);
    }
  }, [state]);

  const submit = (text = query) => {
    if (text.trim().length < MIN_QUERY_LENGTH) {
      setMessage(`Enter at least ${MIN_QUERY_LENGTH} letters to search.`);
      return;
    }
    setMessage(undefined);
    setQuery(text);
    Keyboard.dismiss();
    search(text);
  };

  const clear = () => {
    setQuery('');
    setMessage(undefined);
    reset();
    inputRef.current?.focus();
  };

  const text = { color: colors.textPrimary, fontSize: 16 * scale, lineHeight: 24 * scale };
  const muted = { color: colors.textSecondary, fontSize: 14 * scale, lineHeight: 20 * scale };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled">
      <View style={styles.column}>
        <Text style={[styles.title, { color: colors.textPrimary, fontSize: 30 * scale }]} accessibilityRole="header">
          Drug Lookup
        </Text>
        <Text style={[muted, styles.subtitle]}>Search official FDA drug labels by name.</Text>

        <SearchBar
          ref={inputRef}
          value={query}
          onChangeText={(value) => {
            setQuery(value);
            if (message) setMessage(undefined);
          }}
          onSubmit={() => submit()}
          onClear={clear}
          message={message}
        />

        <View style={styles.body}>
          {state.status === 'idle' ? (
            recent.length > 0 ? (
              <View>
                <Text style={[styles.heading, { color: colors.textPrimary, fontSize: 20 * scale }]} accessibilityRole="header">
                  Recent searches
                </Text>
                <View style={styles.recentList}>
                  {recent.map((item) => (
                    <AccessibleButton
                      key={item}
                      label={item}
                      icon="↺"
                      onPress={() => submit(item)}
                      accessibilityLabel={`Search again for ${item}`}
                    />
                  ))}
                </View>
                <Text style={muted}>Saved only on this phone.</Text>
                <AccessibleButton
                  label="Clear recent searches"
                  onPress={clearRecent}
                  style={styles.clearRecent}
                />
              </View>
            ) : (
              <Text style={muted}>
                Try a brand name like “Advil” or a generic name like “ibuprofen”.
              </Text>
            )
          ) : null}

          {state.status === 'loading' ? (
            <View style={styles.loading} accessible accessibilityLiveRegion="polite">
              {reduceMotion ? null : <ActivityIndicator size="large" color={colors.primary} />}
              <Text style={text}>Searching FDA labels for “{state.query}”…</Text>
            </View>
          ) : null}

          {state.status === 'empty' ? (
            <View style={[styles.card, { borderColor: colors.textPrimary }]}>
              <Text style={[text, styles.bold]}>No FDA labels found for “{state.query}”.</Text>
              <Text style={text}>
                Check the spelling, or try the generic name (for example, ibuprofen instead of Advil).
              </Text>
            </View>
          ) : null}

          {state.status === 'error' ? (
            <View style={[styles.card, { borderColor: colors.danger, borderWidth: 2.5 }]}>
              <Text style={[text, styles.bold, { color: colors.danger }]}>⚠ Search failed</Text>
              <Text style={text}>{state.error.message}</Text>
              <AccessibleButton label="Try again" variant="primary" onPress={() => submit(state.query)} />
            </View>
          ) : null}

          {state.status === 'results' ? (
            <View>
              <Text style={[styles.heading, { color: colors.textPrimary, fontSize: 20 * scale }]} accessibilityRole="header">
                {state.results.length} {state.results.length === 1 ? 'product' : 'products'} for “{state.query}”
              </Text>
              {state.results.length > 1 ? (
                <Text style={[muted, styles.hint]}>
                  Several products share this name. Choose the one that matches your package or
                  prescription label.
                </Text>
              ) : null}
              {state.total > state.results.length ? (
                <Text style={[muted, styles.hint]}>
                  Showing the closest matches. Type more of the name to narrow the list.
                </Text>
              ) : null}
              {state.results.map((drug) => (
                <DrugResultRow
                  key={drug.setId}
                  drug={drug}
                  onPress={() => router.push({ pathname: '/drug/[setId]', params: { setId: drug.setId } })}
                />
              ))}
            </View>
          ) : null}
        </View>

        <Text style={[muted, styles.footer]}>
          Information comes from the U.S. Food and Drug Administration through openFDA. It is not
          medical advice.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  column: { width: '100%', maxWidth: 640, alignSelf: 'center' },
  title: { fontWeight: '700' },
  subtitle: { marginBottom: 16 },
  body: { marginTop: 24 },
  heading: { fontWeight: '700', marginBottom: 10 },
  hint: { marginBottom: 12 },
  recentList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  clearRecent: { alignSelf: 'flex-start', marginTop: 10 },
  loading: { alignItems: 'center', gap: 12, paddingVertical: 24 },
  card: { borderWidth: 1.5, borderRadius: 14, padding: 16, gap: 10 },
  bold: { fontWeight: '700' },
  footer: { marginTop: 32 },
});
