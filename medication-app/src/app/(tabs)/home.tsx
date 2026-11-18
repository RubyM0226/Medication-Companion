// Today. Builds on YHM882's original Home layout (greeting, next dose card,
// today's schedule, 7-day snapshot), driven by the saved schedule and dose logs.
// Design refresh: time-of-day sky, the next dose as a ticket, pill drawings in
// the dose list. The next dose comes first because it is what people open the
// app for; the privacy note moves to the bottom.

import { Link } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccessibleButton } from '@/components/accessibleButton';
import { DailyProgressCard, progressStatus } from '@/components/home/dailyProgressCard';
import { DoseConfirmationModal } from '@/components/home/doseConfirmationModal';
import { doseSentence } from '@/components/home/format';
import { MedicationScheduleCard } from '@/components/home/medicationScheduleCard';
import { PrivacyBanner } from '@/components/home/privacyBanner';
import { QuickActions } from '@/components/home/quickActions';
import { RemindLaterModal } from '@/components/home/remindLaterModal';
import { UpcomingDoseCard } from '@/components/home/upcomingDoseCard';
import { WelcomeHeader } from '@/components/home/welcomeHeader';
import { BodyText, Heading } from '@/components/ui/appText';
import { Card } from '@/components/ui/card';
import { SkyBackground, useTimeOfDay } from '@/components/ui/skyBackground';
import { StatusMark } from '@/components/ui/statusMark';
import { bodyStyle, headingStyle, TypeScale } from '@/constants/typography';
import { useSettings } from '@/context/settingsContext';
import { useReadAloud } from '@/hooks/useReadAloud';
import { useTodayDoses } from '@/hooks/useTodayDoses';
import { Dose } from '@/services/doseSchedule';
import { Medication } from '@/services/medicationStore';

export default function HomeScreen() {
  const { colors, fontScale: scale, reduceMotion } = useSettings();
  const insets = useSafeAreaInsets();
  const { state, now, retry } = useTodayDoses();
  const { speakingId, toggle } = useReadAloud();
  const [confirming, setConfirming] = useState<Dose<Medication> | null>(null);
  const [reminding, setReminding] = useState(false);
  const timeOfDay = useTimeOfDay(now);

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
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <SkyBackground timeOfDay={timeOfDay} />
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}>
        <View style={styles.column}>
          <WelcomeHeader now={now} />

          {state.status === 'loading' ? (
            <View style={styles.center} accessible accessibilityLiveRegion="polite">
              {reduceMotion ? null : <ActivityIndicator size="large" color={colors.primary} />}
              <BodyText>Loading today’s plan…</BodyText>
            </View>
          ) : null}

          {state.status === 'error' ? (
            <Card style={[styles.gap, { borderColor: colors.danger, borderWidth: 2 }]}>
              <View style={styles.errorTitle}>
                <StatusMark status="missed" size={24} />
                <BodyText bold color={colors.danger}>
                  Could not load your medicines
                </BodyText>
              </View>
              <BodyText>Your saved information is still on this phone. Please try again.</BodyText>
              <AccessibleButton label="Try again" variant="primary" onPress={retry} />
            </Card>
          ) : null}

          {state.status === 'ready' ? (
            <>
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
                    <Heading level="section">Today’s doses</Heading>
                    <Link
                      href="/medications"
                      style={[styles.link, bodyStyle(TypeScale.meta, scale, true), { color: colors.primary }]}
                      accessibilityRole="link"
                      accessibilityLabel="See all medicines">
                      See all ›
                    </Link>
                  </View>
                  {state.doses.length === 0 ? (
                    <BodyText>No doses are scheduled for today.</BodyText>
                  ) : (
                    state.doses.map((dose) => (
                      <MedicationScheduleCard key={dose.key} dose={dose} onLog={setConfirming} />
                    ))
                  )}
                  {state.medications.some((med) => med.schedule.frequencyType === 'as_needed') ? (
                    <BodyText size="meta" muted>
                      Medicines taken only when needed are not listed here.
                    </BodyText>
                  ) : null}
                </View>
              ) : null}

              <DailyProgressCard summary={state.summary} doses={state.doses} />

              <View style={styles.gap}>
                <Heading level="section">Quick actions</Heading>
                <QuickActions speaking={speakingId === 'summary'} onReadAloud={readSummary} />
              </View>

              <Card style={styles.snapshot} accessible>
                <View style={styles.snapshotText}>
                  <BodyText size="small" bold muted>
                    Last 7 days
                  </BodyText>
                  {state.week.total === 0 ? (
                    <BodyText>No scheduled doses in the last 7 days.</BodyText>
                  ) : (
                    <>
                      <BodyText bold>
                        {state.week.taken} of {state.week.total} doses taken
                      </BodyText>
                      <BodyText size="meta" muted>
                        Not counting today
                      </BodyText>
                    </>
                  )}
                </View>
                {state.week.total > 0 ? (
                  <BodyText style={[headingStyle(TypeScale.title, scale), { color: colors.primary }]}>
                    {Math.round((state.week.taken / state.week.total) * 100)}%
                  </BodyText>
                ) : null}
              </Card>
            </>
          ) : null}

          <PrivacyBanner />
        </View>

        <DoseConfirmationModal dose={confirming} onClose={() => setConfirming(null)} />
        <RemindLaterModal visible={reminding} onClose={() => setReminding(false)} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  column: { width: '100%', maxWidth: 640, alignSelf: 'center', gap: 20 },
  center: { alignItems: 'center', gap: 12, paddingVertical: 32 },
  gap: { gap: 10 },
  errorTitle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' },
  link: { paddingVertical: 12, paddingLeft: 12 },
  snapshot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' },
  snapshotText: { gap: 2, flexShrink: 1 },
});
