import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ReactNode, useEffect, useState } from 'react';
import { ActivityIndicator, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AccessibleButton } from '@/components/accessibleButton';
import { ComingSoonCard } from '@/components/comingSoonCard';
import { Chip } from '@/components/lookup/chip';
import { ExpandableSection } from '@/components/lookup/expandableSection';
import { PlainLanguageCard } from '@/components/lookup/plainLanguageCard';
import { ReadAloudButton } from '@/components/lookup/readAloudButton';
import { useSettings } from '@/context/settingsContext';
import { useMedications } from '@/hooks/useMedications';
import { useReadAloud } from '@/hooks/useReadAloud';
import {
  dailyMedUrl,
  DrugLabel,
  DrugLookupError,
  getDrugLabel,
  LabelSection,
  LabelSectionKey,
} from '@/services/openFda';

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; label: DrugLabel };

const WARNING_KEYS: LabelSectionKey[] = [
  'boxedWarning',
  'contraindications',
  'warnings',
  'doNotUse',
  'askDoctor',
  'stopUse',
];

export default function DrugDetailsScreen() {
  const { setId } = useLocalSearchParams<{ setId: string }>();
  const { colors, fontScale: scale, reduceMotion } = useSettings();
  const [state, setState] = useState<State>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getDrugLabel(String(setId), controller.signal)
      .then((label) => setState({ status: 'ready', label }))
      .catch((error) => {
        if (controller.signal.aborted) return;
        setState({
          status: 'error',
          message: error instanceof DrugLookupError ? error.message : 'Something went wrong.',
        });
      });
    return () => controller.abort();
  }, [setId, attempt]);

  const text = { color: colors.textPrimary, fontSize: 16 * scale, lineHeight: 24 * scale };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}>
      <View style={styles.column}>
        {state.status === 'loading' ? (
          <View style={styles.center} accessible accessibilityLiveRegion="polite">
            {reduceMotion ? null : <ActivityIndicator size="large" color={colors.primary} />}
            <Text style={text}>Loading FDA label…</Text>
          </View>
        ) : null}

        {state.status === 'error' ? (
          <View style={[styles.card, { borderColor: colors.danger, borderWidth: 2.5 }]}>
            <Text style={[text, styles.bold, { color: colors.danger }]}>⚠ Could not load this label</Text>
            <Text style={text}>{state.message}</Text>
            <AccessibleButton
              label="Try again"
              variant="primary"
              onPress={() => {
                setState({ status: 'loading' });
                setAttempt(attempt + 1);
              }}
            />
          </View>
        ) : null}

        {state.status === 'ready' ? <LabelDetails label={state.label} /> : null}
      </View>
    </ScrollView>
  );
}

function LabelDetails({ label }: { label: DrugLabel }) {
  const { colors, fontScale: scale, toggles } = useSettings();
  const { speakingId, toggle } = useReadAloud();
  const { medications, loaded } = useMedications();
  const alreadyAdded = medications.some((medication) => medication.fdaSetId === label.setId);

  const text = { color: colors.textPrimary, fontSize: 16 * scale, lineHeight: 24 * scale };
  const muted = { color: colors.textSecondary, fontSize: 14 * scale, lineHeight: 20 * scale };
  const sections = new Map(label.sections.map((section) => [section.key, section]));
  const pick = (keys: LabelSectionKey[]) =>
    keys.map((key) => sections.get(key)).filter((section): section is LabelSection => !!section);

  const overview = [
    label.displayName,
    label.genericName && label.genericName !== label.displayName ? `Generic name: ${label.genericName}.` : '',
    ...pick(['purpose', 'uses']).map((section) => `${section.title}. ${section.text}`),
  ].join(' ');

  const renderSection = (section: LabelSection, options?: { warning?: boolean; open?: boolean }) => (
    <ExpandableSection
      key={section.key}
      title={section.title}
      warning={options?.warning}
      initiallyOpen={options?.open}>
      <Text style={text} selectable>
        {section.text}
      </Text>
      <ReadAloudButton
        speaking={speakingId === section.key}
        subject={section.title}
        onPress={() => toggle(section.key, `${section.title}. ${section.text}`)}
      />
    </ExpandableSection>
  );

  const heading = (title: string) => (
    <Text style={[styles.groupTitle, { color: colors.textPrimary, fontSize: 20 * scale }]} accessibilityRole="header">
      {title}
    </Text>
  );

  const note = (children: ReactNode) => (
    <View style={[styles.note, { borderColor: colors.textSecondary }]}>
      <Text style={muted}>{children}</Text>
    </View>
  );

  const plainLanguage = (
    <PlainLanguageCard
      label={label}
      speaking={speakingId === 'plainLanguage'}
      onReadAloud={(value) => toggle('plainLanguage', value)}
    />
  );

  return (
    <View>
      <Stack.Screen options={{ title: label.displayName }} />

      <Text style={[styles.name, { color: colors.textPrimary, fontSize: 30 * scale }]} accessibilityRole="header">
        {label.displayName}
      </Text>
      {label.genericName && label.genericName !== label.displayName ? (
        <Text style={[text, styles.bold]}>Generic name: {label.genericName}</Text>
      ) : null}
      <Text style={muted}>{[label.route, label.manufacturer].filter(Boolean).join(' • ')}</Text>
      <View style={styles.chips}>
        <Chip label="✓ FDA label found" tone="success" />
        {label.isPrescription !== undefined ? (
          <Chip label={label.isPrescription ? 'Prescription' : 'Over the counter'} />
        ) : null}
      </View>

      <View style={[styles.disclaimer, { backgroundColor: colors.accent }]} accessible>
        <Text style={{ color: colors.onAccent, fontSize: 15 * scale, lineHeight: 22 * scale }}>
          <Text style={styles.bold}>ⓘ Talk to a professional. </Text>
          This is general information from the drug label, not medical advice. Ask your doctor or
          pharmacist before starting, stopping or changing any medicine.
        </Text>
      </View>

      <ReadAloudButton
        speaking={speakingId === 'overview'}
        subject="the medication overview"
        onPress={() => toggle('overview', overview)}
      />

      <View style={styles.addRow}>
        {!loaded ? null : alreadyAdded ? (
          <>
            <Chip label="✓ In my medications" tone="success" />
            <AccessibleButton
              label="View my medications"
              onPress={() => router.navigate('/medications')}
            />
          </>
        ) : (
          <AccessibleButton
            label="Add to my medications"
            icon="＋"
            variant="primary"
            onPress={() => router.push({ pathname: '/addMedication', params: { setId: label.setId } })}
            accessibilityHint="Opens a form filled in from this label. You enter your own dose."
          />
        )}
      </View>

      {toggles.plainLanguage ? <View style={styles.group}>{plainLanguage}</View> : null}

      <View style={styles.group}>
        {heading('Original FDA label information')}
        <Text style={[muted, styles.groupHint]}>Exact wording from the official label.</Text>

        {label.sections.length === 0
          ? note('This label has no readable sections. Use the DailyMed link below to see the full label.')
          : null}

        {pick(['purpose', 'uses']).map((section) => renderSection(section, { open: section.key === 'uses' }))}

        {pick(WARNING_KEYS).length > 0 ? heading('Warnings') : null}
        {pick(WARNING_KEYS).map((section) =>
          renderSection(section, { warning: true, open: section.key === 'boxedWarning' }),
        )}

        {heading('Side effects')}
        {sections.get('sideEffects')
          ? renderSection(sections.get('sideEffects')!)
          : note(
              'This label has no separate side-effects section. Over-the-counter labels usually list them under Warnings and “Stop use and ask a doctor if”.',
            )}

        {sections.get('dosage') ? heading('How to take it') : null}
        {pick(['dosage']).map((section) => renderSection(section))}

        {heading('Drug interactions')}
        {sections.get('interactions') ? (
          <>
            {note('General interaction information from the label. This is not a check against your own medicines.')}
            {renderSection(sections.get('interactions')!)}
          </>
        ) : (
          note(
            'This label has no separate drug interactions section. Over-the-counter labels usually list them under “Ask a doctor or pharmacist before use”.',
          )
        )}
      </View>

      {toggles.plainLanguage ? null : (
        <View style={styles.group}>
          {note('Plain-language explanations are turned off. You can turn them on in Settings.')}
        </View>
      )}

      <View style={styles.group}>
        {heading('Coming soon')}
        {/* FUTURE BACKEND: both need user accounts and server-side services. */}
        <ComingSoonCard
          icon="⇄"
          label="Check interactions with my medicines"
          note="Needs your saved medicines and an interaction checking service."
        />
        <ComingSoonCard
          icon="👥"
          label="Share with a caregiver"
          note="Needs accounts and secure sharing, which are not built yet."
        />
      </View>

      <View style={[styles.card, styles.group, { borderColor: colors.textPrimary }]}>
        {heading('Source')}
        <Text style={text}>
          U.S. Food and Drug Administration (FDA) drug label, retrieved through openFDA
          (open.fda.gov).
        </Text>
        {label.effectiveDate ? <Text style={text}>Label effective date: {label.effectiveDate}</Text> : null}
        <Text style={muted} selectable>
          Label set ID: {label.setId}
        </Text>
        <Text style={muted}>
          openFDA data may not be complete or up to date and should not be used on its own to make
          medical decisions.
        </Text>
        <AccessibleButton
          label="View full label on DailyMed"
          icon="↗"
          onPress={() => Linking.openURL(dailyMedUrl(label.setId))}
          accessibilityHint="Opens the National Library of Medicine website in your browser"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 20, paddingBottom: 48 },
  column: { width: '100%', maxWidth: 640, alignSelf: 'center' },
  center: { alignItems: 'center', gap: 12, paddingVertical: 48 },
  card: { borderWidth: 1.5, borderRadius: 14, padding: 16, gap: 10 },
  bold: { fontWeight: '700' },
  name: { fontWeight: '700', marginBottom: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  addRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginTop: 12 },
  disclaimer: { borderRadius: 14, padding: 14, marginVertical: 16 },
  group: { marginTop: 24 },
  groupTitle: { fontWeight: '700', marginTop: 8, marginBottom: 10 },
  groupHint: { marginTop: -6, marginBottom: 12 },
  note: { borderWidth: 1, borderStyle: 'dashed', borderRadius: 12, padding: 12, marginBottom: 12 },
});
