// One dose in Today's doses: the pill drawing, medicine, time and dose, and the
// status shown with a drawn mark and a word, plus Log / Add notes / Edit actions.

import { Pressable, StyleSheet, View } from 'react-native';

import { AccessibleButton } from '@/components/accessibleButton';
import { doseAmount, statusLabel } from '@/components/home/format';
import { BodyText } from '@/components/ui/appText';
import { Card } from '@/components/ui/card';
import { pillAppearance, PillMark } from '@/components/ui/pillMark';
import { StatusMark } from '@/components/ui/statusMark';
import { MedicationStatus } from '@/constants/colors';
import { useSettings } from '@/context/settingsContext';
import { Dose, formatTime } from '@/services/doseSchedule';
import { Medication } from '@/services/medicationStore';

export function MedicationScheduleCard({
  dose,
  onLog,
  onNotes,
}: {
  dose: Dose<Medication>;
  onLog: (dose: Dose<Medication>) => void;
  onNotes: (dose: Dose<Medication>) => void;
}) {
  const { colors, toggles } = useSettings();
  const status: MedicationStatus = dose.status === 'pending' ? 'upcoming' : dose.status;
  const label = statusLabel(dose);
  const pill = pillAppearance(dose.medication);
  const time = formatTime(dose.scheduledTime);
  const loggedTime =
    dose.status === 'taken' && dose.log?.loggedAt
      ? new Date(dose.log.loggedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
      : null;
  const savedNote = dose.log?.notes;

  const statusColor =
    status === 'taken'
      ? toggles.colorBlindFriendly
        ? colors.colorBlindBlue
        : colors.primary
      : status === 'missed' || dose.isLate
        ? toggles.colorBlindFriendly
          ? colors.colorBlindOrange
          : colors.danger
        : colors.textSecondary;

  return (
    <Card style={styles.card}>
      <View
        style={styles.row}
        accessible
        accessibilityLabel={`${time}, ${dose.medication.name}, ${doseAmount(dose.medication)}. Status: ${label}`}>
        <PillMark form={pill.form} color={pill.color} size={40} />
        <View style={styles.text}>
          <BodyText bold>{dose.medication.name}</BodyText>
          <BodyText size="meta" muted>
            {time} · {doseAmount(dose.medication)}
            {loggedTime ? ` · Taken at ${loggedTime}` : ''}
          </BodyText>
          {savedNote ? (
            <BodyText size="meta" muted numberOfLines={2} style={styles.notePreview}>
              Note: {savedNote}
            </BodyText>
          ) : null}
        </View>
        <View style={styles.rightCol}>
          <View style={styles.status}>
            <StatusMark status={status} size={22} />
            <BodyText size="small" bold color={statusColor}>
              {label}
            </BodyText>
          </View>
          {dose.status !== 'pending' ? (
            <View style={styles.actionRow}>
              <Pressable
                onPress={() => onNotes(dose)}
                accessibilityRole="button"
                accessibilityLabel={`${savedNote ? 'Edit note' : 'Add notes'} for ${dose.medication.name} at ${time}`}
                style={[styles.chip, { borderColor: colors.primary }]}>
                <BodyText size="meta" bold color={colors.primary}>
                  {savedNote ? 'Edit note' : 'Add notes'}
                </BodyText>
              </Pressable>
              <Pressable
                onPress={() => onLog(dose)}
                accessibilityRole="button"
                accessibilityLabel={`Edit ${dose.medication.name} dose for ${time}`}
                style={[styles.chip, { borderColor: colors.textSecondary }]}>
                <BodyText size="meta" bold>
                  Edit
                </BodyText>
              </Pressable>
            </View>
          ) : null}
        </View>
      </View>
      {dose.status === 'pending' ? (
        <AccessibleButton
          label="Log"
          icon="✓"
          onPress={() => onLog(dose)}
          accessibilityLabel={`Log ${dose.medication.name} for ${time}`}
        />
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 10, padding: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  text: { flex: 1, minWidth: 120 },
  notePreview: { marginTop: 2, fontStyle: 'italic' },
  rightCol: { alignItems: 'flex-end', gap: 6 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  chip: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});
