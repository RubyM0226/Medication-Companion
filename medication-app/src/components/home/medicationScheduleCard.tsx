// One dose in Today's Schedule: time, medication, dose and status shown with
// an icon and a word, plus a Log button while it is still pending.

import { StyleSheet, Text, View } from 'react-native';

import { AccessibleButton } from '@/components/accessibleButton';
import { cardStyle } from '@/components/home/cardStyle';
import { doseAmount, statusLabel } from '@/components/home/format';
import { StatusBadge } from '@/components/statusBadge';
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
  const { colors, fontScale: scale, toggles } = useSettings();
  const badge: MedicationStatus = dose.status === 'pending' ? 'upcoming' : dose.status;
  const label = statusLabel(dose);

  return (
    <View style={[cardStyle(colors, toggles.highContrast), styles.card]}>
      <View
        style={styles.info}
        accessible
        accessibilityLabel={`${formatTime(dose.scheduledTime)}, ${dose.medication.name}, ${doseAmount(dose.medication)}. Status: ${label}`}>
        <Text style={[styles.time, { color: colors.primary, fontSize: 16 * scale }]}>{formatTime(dose.scheduledTime)}</Text>
        <View style={styles.text}>
          <Text style={[styles.name, { color: colors.textPrimary, fontSize: 18 * scale }]}>{dose.medication.name}</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 15 * scale }}>{doseAmount(dose.medication)}</Text>
        </View>
        <StatusBadge status={badge} label={label} />
      </View>
      {dose.status === 'pending' ? (
        <AccessibleButton
          label="Log"
          icon="✓"
          onPress={() => onLog(dose)}
          accessibilityLabel={`Log ${dose.medication.name} for ${formatTime(dose.scheduledTime)}`}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: 10, padding: 14 },
  info: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  time: { fontWeight: '800', minWidth: 72 },
  text: { flex: 1, minWidth: 120 },
  name: { fontWeight: '700' },
});
