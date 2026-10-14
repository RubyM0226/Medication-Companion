// The next dose still to log. Keeps the "NEXT • time" and "IN 42 MIN"
// badges from YHM882's original Home design.

import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AccessibleButton } from '@/components/accessibleButton';
import { AppIcon } from '@/components/appIcon';
import { cardStyle } from '@/components/home/cardStyle';
import { doseAmount, timeFromNow } from '@/components/home/format';
import { useSettings } from '@/context/settingsContext';
import { Dose, formatTime } from '@/services/doseSchedule';
import { Medication } from '@/services/medicationStore';

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
  const { colors, fontScale: scale, toggles } = useSettings();
  const card = cardStyle(colors, toggles.highContrast);
  const text = { color: colors.textPrimary, fontSize: 16 * scale, lineHeight: 23 * scale };

  if (!dose) {
    return (
      <View style={[card, styles.gap]}>
        <Text style={[styles.label, { color: colors.textPrimary, fontSize: 13 * scale }]}>UP NEXT</Text>
        {allDone ? (
          <Text style={[text, styles.bold]}>✓ Nothing left to log today.</Text>
        ) : hasMedications ? (
          <Text style={text}>No doses scheduled today.</Text>
        ) : (
          <>
            <Text style={[text, styles.bold]}>No medications yet</Text>
            <Text style={text}>Add a medication with its times to see your daily plan here.</Text>
            <AccessibleButton
              label="Add a medication"
              icon="＋"
              variant="primary"
              onPress={() => router.push('/addMedication')}
            />
          </>
        )}
      </View>
    );
  }

  const time = formatTime(dose.scheduledTime);
  const until = timeFromNow(dose.scheduledAt, now);

  return (
    <View style={[card, styles.gap]}>
      <View style={styles.badges}>
        <View style={[styles.badge, { borderColor: colors.textPrimary }]}>
          <Text style={[styles.badgeText, { color: colors.textPrimary, fontSize: 12 * scale }]}>
            UP NEXT • {time.toUpperCase()}
          </Text>
        </View>
        <View
          style={[
            styles.badge,
            dose.isLate
              ? { backgroundColor: colors.danger, borderColor: colors.danger }
              : { borderColor: colors.primary },
          ]}>
          <Text
            style={[
              styles.badgeText,
              { color: dose.isLate ? colors.onDanger : colors.primary, fontSize: 12 * scale },
            ]}>
            {dose.isLate ? `⚠ ${until.toUpperCase()}` : until.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.medRow}>
        <View style={[styles.pill, { backgroundColor: colors.sage }]}>
          <AppIcon name="pill" size={28} color={colors.primary} />
        </View>
        <View style={styles.medText}>
          <Text style={[styles.name, { color: colors.textPrimary, fontSize: 24 * scale }]}>{dose.medication.name}</Text>
          <Text style={[text, styles.bold]}>
            {doseAmount(dose.medication)} • {time}
          </Text>
          {dose.medication.instructions ? <Text style={text}>{dose.medication.instructions}</Text> : null}
        </View>
      </View>

      <AccessibleButton
        label="Log this dose"
        icon="✓"
        variant="primary"
        onPress={() => onLog(dose)}
        accessibilityLabel={`Log ${dose.medication.name}, ${doseAmount(dose.medication)}, due ${time}`}
        accessibilityHint="Asks you to confirm before saving"
      />
      <AccessibleButton
        label="Remind me later"
        icon="⏰"
        onPress={onRemind}
        accessibilityHint="Sets a phone notification. The dose stays pending."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  gap: { gap: 12 },
  label: { fontWeight: '800', letterSpacing: 1 },
  bold: { fontWeight: '600' },
  badges: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 },
  badge: { borderWidth: 1.5, borderRadius: 8, paddingVertical: 4, paddingHorizontal: 8 },
  badgeText: { fontWeight: '800', letterSpacing: 0.5 },
  medRow: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  pill: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  medText: { flex: 1, gap: 2 },
  name: { fontWeight: '700' },
});
