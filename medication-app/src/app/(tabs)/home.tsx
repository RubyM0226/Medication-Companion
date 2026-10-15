// Home dashboard. Builds on YHM882's original Home layout (greeting, next
// dose card with time badges, later today, 7-day snapshot), now driven by the
// saved schedule and dose logs instead of sample data.

import { Link } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccessibleButton } from '@/components/accessibleButton';
import { cardStyle } from '@/components/home/cardStyle';
import { DailyProgressCard, progressStatus } from '@/components/home/dailyProgressCard';
import { DoseConfirmationModal } from '@/components/home/doseConfirmationModal';
import { doseSentence } from '@/components/home/format';
import { MedicationScheduleCard } from '@/components/home/medicationScheduleCard';
import { PrivacyBanner } from '@/components/home/privacyBanner';
import { QuickActions } from '@/components/home/quickActions';
import { RemindLaterModal } from '@/components/home/remindLaterModal';
import { UpcomingDoseCard } from '@/components/home/upcomingDoseCard';
import { WelcomeHeader } from '@/components/home/welcomeHeader';
import { useSettings } from '@/context/settingsContext';
import { useReadAloud } from '@/hooks/useReadAloud';
import { useTodayDoses } from '@/hooks/useTodayDoses';
import { Dose } from '@/services/doseSchedule';
import { Medication } from '@/services/medicationStore';

export default function HomeScreen() {
  const { colors, fontScale: scale, reduceMotion, toggles } = useSettings();
  const insets = useSafeAreaInsets();
  const { state, now, retry } = useTodayDoses();
  const { speakingId, toggle } = useReadAloud();
  const [confirming, setConfirming] = useState<Dose<Medication> | null>(null);
  const [reminding, setReminding] = useState(false);

  const heading = (title: string) => (
    <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: 20 * scale }]} accessibilityRole="header">
      {title}
    </Text>
  );
  const text = { color: colors.textPrimary, fontSize: 16 * scale, lineHeight: 23 * scale };

  // Only read when the person taps Read aloud; never automatically.
  const readSummary = () => {
    if (state.status !== 'ready') return;
    const { summary, doses } = state;
    const parts = [progressStatus(summary, doses) + '.'];
    if (summary.total > 0) parts.push(`${summary.taken} of ${summary.total} doses taken.`);
    const upcoming = doses.filter((dose) => dose.status === 'pending');
    if (upcoming.length > 0) parts.push(`Still to take: ${upcoming.map(doseSentence).join('; ')}.`);
    toggle('summary', parts.join(' '));
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}>
      <View style={styles.column}>
        <WelcomeHeader now={now} />
        <PrivacyBanner />

        {state.status === 'loading' ? (
          <View style={styles.center} accessible accessibilityLiveRegion="polite">
            {reduceMotion ? null : <ActivityIndicator size="large" color={colors.primary} />}
            <Text style={text}>Loading today’s plan…</Text>
          </View>
        ) : null}

        {state.status === 'error' ? (
          <View style={[cardStyle(colors, toggles.highContrast), styles.gap, { borderColor: colors.danger, borderWidth: 2 }]}>
            <Text style={[text, styles.bold, { color: colors.danger }]}>⚠ Could not load your medications</Text>
            <Text style={text}>Your saved information is still on this phone. Please try again.</Text>
            <AccessibleButton label="Try again" variant="primary" onPress={retry} />
          </View>
        ) : null}

        {state.status === 'ready' ? (
          <>
            <DailyProgressCard summary={state.summary} doses={state.doses} />

            <UpcomingDoseCard
              dose={state.summary.next}
              now={now}
              hasMedications={state.medications.length > 0}
              allDone={state.summary.total > 0 && state.summary.pending === 0}
              onLog={setConfirming}
              onRemind={() => setReminding(true)}
            />

            {state.medications.length > 0 ? (
              <View style={styles.gap}>
                <View style={styles.sectionRow}>
                  {heading('Today’s Schedule')}
                  <Link
                    href="/medications"
                    style={[styles.link, { color: colors.primary, fontSize: 16 * scale }]}
                    accessibilityRole="link"
                    accessibilityLabel="See all medications">
                    See all ›
                  </Link>
                </View>
                {state.doses.length === 0 ? (
                  <Text style={text}>No doses are scheduled for today.</Text>
                ) : (
                  state.doses.map((dose) => (
                    <MedicationScheduleCard key={dose.key} dose={dose} onLog={setConfirming} />
                  ))
                )}
                {state.medications.some((med) => med.schedule.frequencyType === 'as_needed') ? (
                  <Text style={{ color: colors.textSecondary, fontSize: 14 * scale }}>
                    Medications taken only when needed are not listed here.
                  </Text>
                ) : null}
              </View>
            ) : null}

            <View style={styles.gap}>
              {heading('Quick actions')}
              <QuickActions speaking={speakingId === 'summary'} onReadAloud={readSummary} />
            </View>

            <View style={[cardStyle(colors, toggles.highContrast), styles.snapshot]} accessible>
              <View style={styles.snapshotText}>
                <Text style={[styles.label, { color: colors.textPrimary, fontSize: 13 * scale }]}>LAST 7 DAYS</Text>
                {state.week.total === 0 ? (
                  <Text style={text}>No scheduled doses in the last 7 days.</Text>
                ) : (
                  <>
                    <Text style={[styles.bold, { color: colors.textPrimary, fontSize: 18 * scale }]}>
                      {state.week.taken} of {state.week.total} doses taken
                    </Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 14 * scale }}>Not counting today</Text>
                  </>
                )}
              </View>
              {state.week.total > 0 ? (
                <Text style={[styles.percent, { color: colors.textPrimary, fontSize: 34 * scale }]}>
                  {Math.round((state.week.taken / state.week.total) * 100)}%
                </Text>
              ) : null}
            </View>
          </>
        ) : null}
      </View>

      <DoseConfirmationModal dose={confirming} onClose={() => setConfirming(null)} />
      <RemindLaterModal visible={reminding} onClose={() => setReminding(false)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  column: { width: '100%', maxWidth: 640, alignSelf: 'center', gap: 18 },
  center: { alignItems: 'center', gap: 12, paddingVertical: 32 },
  gap: { gap: 12 },
  bold: { fontWeight: '700' },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' },
  sectionTitle: { fontWeight: '700' },
  link: { fontWeight: '700', paddingVertical: 12, paddingLeft: 12 },
  label: { fontWeight: '800', letterSpacing: 1 },
  snapshot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' },
  snapshotText: { gap: 2, flexShrink: 1 },
  percent: { fontWeight: '800' },
});
