// The next dose still to log, drawn as a ticket: the time on a gold stub with a
// dashed tear line, the pill and medicine on the right, then the actions.
// Logging still goes through the confirmation step before anything is saved.

import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AccessibleButton } from '@/components/accessibleButton';
import { doseAmount, timeFromNow } from '@/components/home/format';
import { BodyText, Heading } from '@/components/ui/appText';
import { Card } from '@/components/ui/card';
import { pillAppearance, PillMark } from '@/components/ui/pillMark';
import { StatusMark } from '@/components/ui/statusMark';
import { headingStyle, TypeScale } from '@/constants/typography';
import { useSettings } from '@/context/settingsContext';
import { Dose, formatTime } from '@/services/doseSchedule';
import { Medication } from '@/services/medicationStore';

const TEAR_DASHES = Array.from({ length: 12 }, (_, index) => index);

// "6:00 PM" -> ["6:00", "PM"], so the stub can stack the time over AM/PM.
function splitTime(time: string) {
  const match = time.match(/^(.*?)\s*([AaPp]\.?\s?[Mm]\.?)$/);
  return match ? [match[1], match[2].toUpperCase()] : [time, ''];
}

export function UpcomingDoseCard({
  dose,
  now,
  hasMedications,
  allDone,
  onLog,
  onRemind,
}: {
  dose?: Dose<Medication>;
  now: Date;
  hasMedications: boolean;
  allDone: boolean;
  onLog: (dose: Dose<Medication>) => void;
  onRemind: () => void;
}) {
  const { colors, fontScale, toggles } = useSettings();

  if (!dose) {
    return (
      <Card style={styles.gap}>
        {allDone ? (
          <View style={styles.doneRow}>
            <StatusMark status="taken" size={32} />
            <View style={styles.flex}>
              <Heading level="section">All done for today</Heading>
              <BodyText size="meta" muted>
                Nothing left to log.
              </BodyText>
            </View>
          </View>
        ) : hasMedications ? (
          <BodyText>No doses are scheduled today.</BodyText>
        ) : (
          <>
            <Heading level="section">No medicines yet</Heading>
            <BodyText>Add a medicine with its times to see your day here.</BodyText>
            <AccessibleButton
              label="Add a medicine"
              icon="＋"
              variant="primary"
              onPress={() => router.push('/addMedication')}
            />
          </>
        )}
      </Card>
    );
  }

  const time = formatTime(dose.scheduledTime);
  const [clock, meridiem] = splitTime(time);
  const until = timeFromNow(dose.scheduledAt, now);
  const pill = pillAppearance(dose.medication);
  const stubColor = toggles.highContrast ? colors.surface : colors.accentSoft;
  const stubBorder = toggles.highContrast ? colors.textPrimary : colors.accent;

  return (
    <Card style={styles.ticket}>
      <View
        style={styles.top}
        accessible
        accessibilityLabel={`Next dose${dose.isLate ? ', past due' : ''}: ${dose.medication.name}, ${doseAmount(
          dose.medication,
        )}, at ${time}, ${until}.${dose.medication.instructions ? ` ${dose.medication.instructions}` : ''}`}>
        <View style={[styles.stub, { backgroundColor: stubColor }]}>
          <BodyText size="small" bold color={dose.isLate ? colors.danger : colors.textPrimary}>
            {dose.isLate ? 'Late' : 'Next'}
          </BodyText>
          <View>
            <BodyText style={headingStyle(TypeScale.heading, Math.min(fontScale, 1.3))}>{clock}</BodyText>
          </View>
          {meridiem ? (
            <BodyText size="meta" bold>
              {meridiem}
            </BodyText>
          ) : null}
        </View>

        {/* The dashed tear line, made of small dashes that space out to fit the
            card. (A percentage-height drawing here stretched the card endlessly on
            phones, and dashed single-side borders are unreliable on iOS.) */}
        <View style={[styles.tear, { backgroundColor: stubColor }]}>
          {TEAR_DASHES.map((key) => (
            <View key={key} style={[styles.dash, { backgroundColor: stubBorder }]} />
          ))}
        </View>

        <View style={styles.info}>
          <PillMark form={pill.form} color={pill.color} size={44} />
          <View style={styles.flex}>
            <Heading level="heading" accessibilityRole="text">
              {dose.medication.name}
            </Heading>
            <BodyText size="meta" muted>
              {doseAmount(dose.medication)} · {until}
            </BodyText>
            {dose.medication.instructions ? (
              <BodyText size="meta" muted>
                {dose.medication.instructions}
              </BodyText>
            ) : null}
          </View>
        </View>
      </View>

      <View style={[styles.actions, { borderTopColor: colors.ringTrack }]}>
        <AccessibleButton
          label="Mark taken"
          icon="✓"
          variant="primary"
          style={styles.flex}
          onPress={() => onLog(dose)}
          accessibilityLabel={`Mark ${dose.medication.name} taken, ${doseAmount(dose.medication)}, due ${time}`}
          accessibilityHint="Asks you to confirm before saving"
        />
        <AccessibleButton
          label="Later"
          onPress={onRemind}
          accessibilityLabel="Remind me later"
          accessibilityHint="Sets a phone notification. The dose stays pending."
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  gap: { gap: 12 },
  flex: { flex: 1 },
  doneRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  // The ticket draws its own sections, so it drops the card's padding.
  ticket: { padding: 0, overflow: 'hidden' },
  top: { flexDirection: 'row' },
  stub: {
    width: 104,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 6,
  },
  tear: { width: 2, alignSelf: 'stretch', overflow: 'hidden', justifyContent: 'space-evenly', paddingVertical: 6 },
  dash: { width: 2, height: 5, borderRadius: 1 },
  info: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  actions: { flexDirection: 'row', gap: 10, padding: 14, borderTopWidth: 1 },
});
