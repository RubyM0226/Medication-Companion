// Plain-language explanation from the raia AI agent. Until that integration
// exists, this shows a clearly labelled unavailable state and never any
// made-up explanation.

import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AccessibleButton } from '@/components/accessibleButton';
import { ReadAloudButton } from '@/components/lookup/readAloudButton';
import { useSettings } from '@/context/settingsContext';
import { DrugLabel } from '@/services/openFda';
import { getPlainLanguageService, PlainLanguageExplanation } from '@/services/plainLanguage';

type State =
  | { status: 'unavailable' }
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; explanation: PlainLanguageExplanation };

export function PlainLanguageCard({
  label,
  speaking,
  onReadAloud,
}: {
  label: DrugLabel;
  speaking: boolean;
  onReadAloud: (text: string) => void;
}) {
  const { colors, fontScale, reduceMotion } = useSettings();
  // Created once so the effect below does not restart on every render.
  const [service] = useState(getPlainLanguageService);
  const [state, setState] = useState<State>({ status: service ? 'loading' : 'unavailable' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!service) return;
    const controller = new AbortController();
    service
      .explain(
        {
          setId: label.setId,
          drugName: label.displayName,
          genericName: label.genericName,
          sections: label.sections,
        },
        controller.signal,
      )
      .then((explanation) => {
        // Never show an explanation that was made for a different label.
        if (explanation.basedOnSetId !== label.setId) throw new Error('Mismatched label');
        setState({ status: 'ready', explanation });
      })
      .catch(() => {
        if (!controller.signal.aborted) setState({ status: 'error' });
      });
    return () => controller.abort();
  }, [service, label, attempt]);

  const text = { color: colors.textPrimary, fontSize: 16 * fontScale, lineHeight: 24 * fontScale };
  const muted = { color: colors.textSecondary, fontSize: 14 * fontScale, lineHeight: 20 * fontScale };

  return (
    <View style={[styles.card, { borderColor: colors.primary }]}>
      <Text style={[styles.title, { color: colors.textPrimary, fontSize: 20 * fontScale }]} accessibilityRole="header">
        💬 Plain-language explanation
      </Text>

      {state.status === 'unavailable' ? (
        <View accessible accessibilityLiveRegion="polite">
          <Text style={[styles.unavailableTag, { color: colors.textPrimary, fontSize: 14 * fontScale }]}>
            NOT AVAILABLE YET
          </Text>
          <Text style={text}>
            Simple explanations from our AI assistant are not connected yet. For now, read the
            original FDA information below or ask your pharmacist to explain it.
          </Text>
        </View>
      ) : null}

      {state.status === 'loading' ? (
        <View style={styles.row} accessible accessibilityLabel="Loading plain-language explanation">
          {reduceMotion ? null : <ActivityIndicator color={colors.primary} />}
          <Text style={text}>Preparing a simpler explanation…</Text>
        </View>
      ) : null}

      {state.status === 'error' ? (
        <View style={styles.gap}>
          <Text style={text}>ⓘ The plain-language explanation could not be loaded.</Text>
          <AccessibleButton label="Try again" onPress={() => {
              setState({ status: 'loading' });
              setAttempt(attempt + 1);
            }}
          />
        </View>
      ) : null}

      {state.status === 'ready' ? (
        <View style={styles.gap}>
          <Text style={[styles.aiTag, { color: colors.textPrimary, fontSize: 13 * fontScale }]}>
            AI-GENERATED • may contain mistakes
          </Text>
          <Text style={text}>{state.explanation.summary}</Text>
          {state.explanation.keyPoints.map((point) => (
            <Text key={point.title} style={text}>
              <Text style={styles.bold}>{point.title}: </Text>
              {point.text}
            </Text>
          ))}
          <Text style={muted}>
            Based on the FDA label. Generated {new Date(state.explanation.generatedAt).toLocaleDateString()}.
          </Text>
          <ReadAloudButton
            speaking={speaking}
            subject="the plain-language explanation"
            onPress={() =>
              onReadAloud(
                [state.explanation.summary, ...state.explanation.keyPoints.map((p) => `${p.title}. ${p.text}`)].join(' '),
              )
            }
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 2, borderRadius: 14, padding: 16, marginBottom: 12, gap: 10 },
  title: { fontWeight: '700' },
  unavailableTag: { fontWeight: '800', letterSpacing: 0.5, marginBottom: 4 },
  aiTag: { fontWeight: '800', letterSpacing: 0.5 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  gap: { gap: 10 },
  bold: { fontWeight: '700' },
});
