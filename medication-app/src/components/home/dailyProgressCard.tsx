// Today's progress from real scheduled doses and logs. The wording only
// states what the logs show; it never calls the day "on track".

import { StyleSheet, View } from 'react-native';

import { ProgressRing } from '@/components/home/progressRing';
import { cardStyle } from '@/components/home/cardStyle';
import { Text } from '@/components/ui/text';
import { bodyStyle, headingStyle, TypeScale } from '@/constants/typography';
import { useSettings } from '@/context/settingsContext';
import { DaySummary, Dose, formatTime } from '@/services/doseSchedule';

function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

export function progressStatus(summary: DaySummary, doses: Dose[]) {
  const late = doses.filter((dose) => dose.isLate).length;
  if (summary.total === 0) return 'No doses scheduled today';
  if (summary.pending === 0) {
    return summary.taken === summary.total ? 'All of today’s doses taken' : 'All of today’s doses logged';
  }
  if (late > 0) return `${plural(late, 'dose')} past due`;
  return `${summary.pending === 1 ? 'One dose' : plural(summary.pending, 'dose')} left today`;
}

export function DailyProgressCard({ summary, doses }: { summary: DaySummary; doses: Dose[] }) {
  const { colors, fontScale: scale, toggles } = useSettings();
  const status = progressStatus(summary, doses);
  const next = summary.next;
  const nextLine = next
    ? next.isLate
      ? `Next was due at ${formatTime(next.scheduledTime)}`
      : `Next at ${formatTime(next.scheduledTime)}`
    : undefined;
  const breakdown = [
    `${summary.taken} taken`,
    `${summary.pending} still to take`,
    summary.missed ? `${summary.missed} missed` : '',
    summary.skipped ? `${summary.skipped} skipped` : '',
  ].filter(Boolean);

  const headline =
    summary.total === 0 ? 'No doses today' : `${summary.taken} of ${plural(summary.total, 'dose')} taken`;
  const spoken = [
    'Today’s progress.',
    headline + '.',
    summary.percentTaken !== null ? `${summary.percentTaken} percent.` : '',
    status + '.',
    nextLine ? nextLine + '.' : '',
    summary.total ? breakdown.join(', ') + '.' : '',
  ].join(' ');

  return (
    <View
      style={[cardStyle(colors, toggles.highContrast, colors.sage), styles.card]}
      accessible
      accessibilityLabel={spoken}>
      <ProgressRing
        progress={summary.total ? summary.taken / summary.total : 0}
        size={112 * Math.min(scale, 1.2)}
        strokeWidth={12}
        color={colors.primary}
        trackColor={colors.ringTrack}>
        <Text style={[headingStyle(TypeScale.section, scale), { color: colors.textPrimary }]}>
          {summary.percentTaken === null ? '—' : `${summary.percentTaken}%`}
        </Text>
      </ProgressRing>

      <View style={styles.text}>
        <Text style={[bodyStyle(TypeScale.small, scale, true), { color: colors.textSecondary }]}>Today’s progress</Text>
        <Text style={[headingStyle(TypeScale.section, scale), { color: colors.textPrimary }]}>{headline}</Text>
        <Text style={[bodyStyle(TypeScale.meta, scale, true), { color: colors.textPrimary }]}>{status}</Text>
        {nextLine ? <Text style={[bodyStyle(TypeScale.meta, scale), { color: colors.textPrimary }]}>{nextLine}</Text> : null}
        {summary.total > 0 ? (
          <Text style={[bodyStyle(TypeScale.meta, scale), { color: colors.textSecondary, marginTop: 4 }]}>
            {breakdown.join(' · ')}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 18, flexWrap: 'wrap' },
  text: { flex: 1, minWidth: 170, gap: 3 },
});
