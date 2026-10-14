// Confirms a dose before anything is saved. Nothing is logged until the
// person picks an answer, and buttons lock while saving so a double tap
// cannot log twice. The database also rejects a second log of the same dose.

import { useState } from 'react';
import { AccessibilityInfo, StyleSheet, Text, View } from 'react-native';

import { AccessibleButton } from '@/components/accessibleButton';
import { AppModal } from '@/components/appModal';
import { doseAmount } from '@/components/home/format';
import { useSettings } from '@/context/settingsContext';
import { logDose } from '@/services/doseLogStore';
import { Dose, DoseStatus, formatTime } from '@/services/doseSchedule';
import { Medication } from '@/services/medicationStore';

const STATUS_WORDS: Record<DoseStatus, string> = { taken: 'taken', missed: 'missed', skipped: 'skipped' };

export function DoseConfirmationModal({ dose, onClose }: { dose: Dose<Medication> | null; onClose: () => void }) {
  const { colors, fontScale: scale } = useSettings();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string>();

  const close = () => {
    setMessage(undefined);
    setSaving(false);
    onClose();
  };

  const save = async (status: DoseStatus) => {
    if (!dose || saving) return;
    setSaving(true);
    try {
      const result = await logDose({
        medicationId: dose.medication.id,
        scheduledDate: dose.scheduledDate,
        scheduledTime: dose.scheduledTime,
        status,
      });
      if (result.saved) {
        AccessibilityInfo.announceForAccessibility(`${dose.medication.name} logged as ${STATUS_WORDS[status]}`);
        close();
        return;
      }
      const when = new Date(result.existing.loggedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      setMessage(`This dose was already logged as ${STATUS_WORDS[result.existing.status]} at ${when}. Nothing was changed.`);
    } catch {
      setMessage('Could not save. Please try again.');
    }
    setSaving(false);
  };

  const text = { color: colors.textPrimary, fontSize: 17 * scale, lineHeight: 25 * scale };

  return (
    <AppModal visible={!!dose} title="Log this dose?" onClose={close}>
      {dose ? (
        <View style={[styles.details, { borderColor: colors.textPrimary }]}>
          <Text style={[text, styles.name, { fontSize: 22 * scale }]}>{dose.medication.name}</Text>
          <Text style={text}>{doseAmount(dose.medication)}</Text>
          <Text style={text}>Scheduled for {formatTime(dose.scheduledTime)} today</Text>
          {dose.medication.instructions ? <Text style={text}>{dose.medication.instructions}</Text> : null}
        </View>
      ) : null}

      {message ? (
        <>
          <Text style={[text, styles.bold]} accessibilityLiveRegion="polite">
            ⓘ {message}
          </Text>
          <AccessibleButton label="Close" variant="primary" onPress={close} />
        </>
      ) : (
        <>
          <AccessibleButton
            label="Yes, I took it"
            icon="✓"
            variant="primary"
            onPress={() => save('taken')}
            disabled={saving}
          />
          <View style={styles.row}>
            <AccessibleButton label="I skipped it" icon="—" onPress={() => save('skipped')} disabled={saving} style={styles.half} />
            <AccessibleButton label="I missed it" icon="⚠" onPress={() => save('missed')} disabled={saving} style={styles.half} />
          </View>
          <AccessibleButton label="Cancel" onPress={close} disabled={saving} />
        </>
      )}
    </AppModal>
  );
}

const styles = StyleSheet.create({
  details: { borderWidth: 1.5, borderRadius: 14, padding: 14, gap: 4 },
  name: { fontWeight: '700' },
  bold: { fontWeight: '600' },
  row: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  half: { flexGrow: 1, flexBasis: 140 },
});
