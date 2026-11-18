// History: a week of doses at a glance, from the same dose logs Today writes.
// Design refresh: a week grid of checks and crosses per medicine, a summary,
// a key to the marks, and the selected day's doses listed in words.
//
// Replaces the earlier placeholder cards (Medication A / C), which used sample
// data. FUTURE BACKEND: past treatment courses (started, stopped, adherence)
// can come back as a section once removed medicines are listed.

import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { AccessibleButton } from '@/components/accessibleButton';
import { doseMark, doseStatusWords } from '@/components/history/dayStatus';
import { WeekGrid } from '@/components/history/weekGrid';
import { BodyText, Heading } from '@/components/ui/appText';
import { Card } from '@/components/ui/card';
import { ScreenTitle } from '@/components/ui/screenTitle';
import { StatusMark } from '@/components/ui/statusMark';
import { MedicationStatus } from '@/constants/colors';
import { headingStyle, TypeScale } from '@/constants/typography';
import { useSettings } from '@/context/settingsContext';
import { useWeekHistory } from '@/hooks/useWeekHistory';
import { formatTime } from '@/services/doseSchedule';

const shortDate = (date: Date) => date.toLocaleDateString([], { month: 'short', day: 'numeric' });

const KEY: { status: MedicationStatus; label: string }[] = [
  { status: 'taken', label: 'Taken' },
  { status: 'missed', label: 'Missed' },
  { status: 'skipped', label: 'Skipped' },
  { status: 'upcoming', label: 'Not logged yet' },
];

export default function HistoryScreen() {
  const { colors, fontScale, reduceMotion } = useSettings();
  const [weeksBack, setWeeksBack] = useState(0);
  const { state, retry } = useWeekHistory(weeksBack);
  const [selectedKey, setSelectedKey] = useState('');

  // Select the newest day whenever a new week loads.
  const lastKey = state.status === 'ready' ? state.days[state.days.length - 1].key : '';
  useEffect(() => {
    if (lastKey) setSelectedKey(lastKey);
  }, [lastKey]);

  if (state.status === 'loading') {
    return (
      <View style={styles.center} accessible accessibilityLiveRegion="polite">
        {reduceMotion ? null : <ActivityIndicator size="large" color={colors.primary} />}
        <BodyText>Loading your history…</BodyText>
      </View>
    );
  }

  if (state.status === 'error') {
    return (
      <View style={styles.center}>
        <Card style={styles.gap}>
          <BodyText bold color={colors.danger}>
            Could not load your history
          </BodyText>
          <BodyText>Your saved doses are still on this phone. Please try again.</BodyText>
          <AccessibleButton label="Try again" variant="primary" onPress={retry} />
        </Card>
      </View>
    );
  }

  const { medications, days, now } = state;
  const first = days[0].date;
  const last = days[days.length - 1].date;
  const allDoses = days.flatMap((day) => day.doses);
  const due = allDoses.filter((dose) => dose.status !== 'pending' || dose.scheduledAt < now);
  const taken = due.filter((dose) => dose.status === 'taken').length;
  const missed = due.filter((dose) => dose.status === 'missed').length;
  const notLogged = due.filter((dose) => dose.status === 'pending').length;
  const selected = days.find((day) => day.key === selectedKey) ?? days[days.length - 1];
  const rangeLabel = weeksBack === 0 ? 'Last 7 days' : `${shortDate(first)} – ${shortDate(last)}`;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.column}>
        <ScreenTitle title="History" />
        <View style={styles.weekRow}>
          <AccessibleButton
            label="‹ Earlier"
            onPress={() => setWeeksBack((weeks) => weeks + 1)}
            accessibilityLabel="Show the 7 days before these"
            style={styles.weekButton}
          />
          <View style={styles.weekLabel} accessible accessibilityLiveRegion="polite">
            <Heading level="section" style={styles.centerText}>
              {rangeLabel}
            </Heading>
            {weeksBack === 0 ? (
              <BodyText size="small" muted style={styles.centerText}>
                {shortDate(first)} – {shortDate(last)}
              </BodyText>
            ) : null}
          </View>
          <AccessibleButton
            label="Later ›"
            onPress={() => setWeeksBack((weeks) => Math.max(0, weeks - 1))}
            disabled={weeksBack === 0}
            accessibilityLabel="Show the next 7 days"
            style={styles.weekButton}
          />
        </View>

        {medications.length === 0 ? (
          <Card style={styles.gap}>
            <Heading level="section">Nothing to show yet</Heading>
            <BodyText>
              Add a medicine with a schedule, then log doses from Today. Each day’s checks and crosses will show up here.
            </BodyText>
            <AccessibleButton label="Add medicine" icon="＋" variant="primary" onPress={() => router.push('/addMedication')} />
          </Card>
        ) : (
          <>
            <Card style={styles.summary} accessible>
              <View style={styles.summaryText}>
                <BodyText bold>
                  {due.length === 0 ? 'No doses were due' : `${taken} of ${due.length} doses taken`}
                </BodyText>
                {missed || notLogged ? (
                  <BodyText size="meta" muted>
                    {[missed ? `${missed} missed` : '', notLogged ? `${notLogged} not logged` : '']
                      .filter(Boolean)
                      .join(' · ')}
                  </BodyText>
                ) : null}
              </View>
              {due.length > 0 ? (
                <BodyText style={[headingStyle(TypeScale.title, fontScale), { color: colors.primary }]}>
                  {Math.round((taken / due.length) * 100)}%
                </BodyText>
              ) : null}
            </Card>

            <Card>
              <WeekGrid
                medications={medications}
                days={days}
                now={now}
                selectedKey={selected.key}
                onSelect={setSelectedKey}
              />
            </Card>

            <View style={styles.key} accessible accessibilityLabel="Key: check means taken, cross means missed, dash means skipped, dotted ring means not logged yet">
              {KEY.map((item) => (
                <View key={item.status} style={styles.keyItem}>
                  <StatusMark status={item.status} size={20} />
                  <BodyText size="meta">{item.label}</BodyText>
                </View>
              ))}
            </View>

            <View style={styles.gap}>
              <Heading level="section">
                {selected.date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
              </Heading>
              {selected.doses.length === 0 ? (
                <BodyText muted>No doses were scheduled this day.</BodyText>
              ) : (
                selected.doses.map((dose) => {
                  const words = doseStatusWords(dose, now);
                  return (
                    <Card
                      key={dose.key}
                      style={styles.doseRow}
                      accessible
                      accessibilityLabel={`${formatTime(dose.scheduledTime)}, ${dose.medication.name}: ${words}`}>
                      <BodyText bold style={styles.time}>
                        {formatTime(dose.scheduledTime)}
                      </BodyText>
                      <BodyText style={styles.doseName}>{dose.medication.name}</BodyText>
                      <View style={styles.doseStatus}>
                        <StatusMark status={doseMark(dose)} size={20} />
                        <BodyText size="small" bold>
                          {words}
                        </BodyText>
                      </View>
                    </Card>
                  );
                })
              )}
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  column: { width: '100%', maxWidth: 640, alignSelf: 'center', gap: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 20 },
  gap: { gap: 10 },
  weekRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  weekButton: { paddingHorizontal: 12 },
  weekLabel: { flex: 1 },
  centerText: { textAlign: 'center' },
  summary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' },
  summaryText: { flexShrink: 1, gap: 2 },
  key: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 16, rowGap: 6 },
  keyItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  doseRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, flexWrap: 'wrap' },
  time: { minWidth: 76 },
  doseName: { flex: 1, minWidth: 100 },
  doseStatus: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
