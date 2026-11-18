// One dose in Today's doses: the pill drawing, medicine, time and dose, and the
// status shown with a drawn mark and a word, plus a Log button while pending.

import { StyleSheet, View } from 'react-native';

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
}: {
  dose: Dose<Medication>;
  onLog: (dose: Dose<Medication>) => void;
}) {
  const { colors, toggles } = useSettings();
  const status: MedicationStatus = dose.status === 'pending' ? 'upcoming' : dose.status;
  const label = statusLabel(dose);
  const pill = pillAppearance(dose.medication);
  const time = formatTime(dose.scheduledTime);
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
          </BodyText>
        </View>
        <View style={styles.status}>
          <StatusMark status={status} size={22} />
          <BodyText size="small" bold color={statusColor}>
            {label}
          </BodyText>
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
  status: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
