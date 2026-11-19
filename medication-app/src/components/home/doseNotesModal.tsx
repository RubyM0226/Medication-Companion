// Lets a person add or edit notes (symptoms, side effects, dose details) for a dose.

import { useEffect, useState } from 'react';
import { AccessibilityInfo, StyleSheet, TextInput, View } from 'react-native';

import { AccessibleButton } from '@/components/accessibleButton';
import { AppModal } from '@/components/appModal';
import { doseAmount } from '@/components/home/format';
import { Text } from '@/components/ui/text';
import { useSettings } from '@/context/settingsContext';
import { updateDoseNotes } from '@/services/doseLogStore';
import { Dose, formatTime } from '@/services/doseSchedule';
import { Medication } from '@/services/medicationStore';

export function DoseNotesModal({
  dose,
  onClose,
  onNeedLogFirst,
}: {
  dose: Dose<Medication> | null;
  onClose: () => void;
  onNeedLogFirst?: (dose: Dose<Medication>) => void;
}) {
  const { colors, fontScale: scale } = useSettings();
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (dose) {
      setNotes(dose.log?.notes ?? '');
      setError(undefined);
      setSaving(false);
    }
  }, [dose]);

  const close = () => {
    setError(undefined);
    setSaving(false);
    onClose();
  };

  const handleSave = async () => {
    if (!dose || saving) return;
    setSaving(true);
    setError(undefined);
    try {
      const updated = await updateDoseNotes(
        dose.medication.id,
        dose.scheduledDate,
        dose.scheduledTime,
        notes,
      );
      if (updated) {
        AccessibilityInfo.announceForAccessibility(`Notes saved for ${dose.medication.name}`);
        close();
        return;
      }
      setError('Log this dose first before saving notes.');
    } catch {
      setError('Could not save notes. Please try again.');
    }
    setSaving(false);
  };

  const isPending = dose?.status === 'pending';
  const hasExistingNote = Boolean(dose?.log?.notes);
  const text = { color: colors.textPrimary, fontSize: 17 * scale, lineHeight: 25 * scale };

  return (
    <AppModal visible={!!dose} title={hasExistingNote ? 'Edit dose notes' : 'Add dose notes'} onClose={close}>
      {dose ? (
        <View style={[styles.details, { borderColor: colors.textPrimary }]}>
          <Text style={[text, styles.name, { fontSize: 22 * scale }]}>{dose.medication.name}</Text>
          <Text style={text}>{doseAmount(dose.medication)}</Text>
          <Text style={text}>Scheduled for {formatTime(dose.scheduledTime)}</Text>
        </View>
      ) : null}

      {isPending && dose ? (
        <>
          <Text style={text}>
            This dose hasn’t been logged yet. Log whether you took, skipped, or missed it first, then add your notes.
          </Text>
          {onNeedLogFirst ? (
            <AccessibleButton
              label="Log this dose first"
              icon="✓"
              variant="primary"
              onPress={() => {
                const target = dose;
                close();
                onNeedLogFirst(target);
              }}
            />
          ) : null}
          <AccessibleButton label="Cancel" onPress={close} />
        </>
      ) : (
        <>
          <View style={styles.inputGroup}>
            <Text style={[text, styles.bold]}>Symptoms, side effects, or details</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g. Felt slightly dizzy, took with breakfast..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              accessibilityLabel="Dose notes"
              style={[
                styles.textArea,
                {
                  color: colors.textPrimary,
                  borderColor: error ? colors.danger : colors.textPrimary,
                  fontSize: 17 * scale,
                },
              ]}
            />
            {error ? (
              <Text style={[text, { color: colors.danger, fontSize: 15 * scale }]} accessibilityLiveRegion="polite">
                {error}
              </Text>
            ) : null}
          </View>

          <AccessibleButton
            label="Save notes"
            icon="✓"
            variant="primary"
            onPress={handleSave}
            disabled={saving}
          />
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
  inputGroup: { gap: 8 },
  textArea: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
    minHeight: 110,
  },
});