// Confirms or edits a dose before anything is saved. When logging a taken dose,
// the person can enter the real time they took it (for example, "8:00 am" if
// they forgot to log earlier) and choose on time, early, or late.

import { useEffect, useState } from 'react';
import { AccessibilityInfo, StyleSheet, TextInput, View } from 'react-native';

import { AccessibleButton } from '@/components/accessibleButton';
import { AppModal } from '@/components/appModal';
import { doseAmount } from '@/components/home/format';
import { Text } from '@/components/ui/text';
import { useSettings } from '@/context/settingsContext';
import { logDose } from '@/services/doseLogStore';
import { dateKey, Dose, DoseStatus, DoseTiming, formatTime, parseTime } from '@/services/doseSchedule';
import { Medication } from '@/services/medicationStore';

const STATUS_WORDS: Record<DoseStatus, string> = { taken: 'taken', missed: 'missed', skipped: 'skipped' };
const TIMING_WORDS: Record<DoseTiming, string> = { 'on-time': 'on time', early: 'early', late: 'late' };

function currentTimeString(fromIso?: string): string {
  const date = fromIso ? new Date(fromIso) : new Date();
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function buildLoggedAtIso(scheduledDate: string, parsedHHMM: string): string {
  const [year, month, day] = scheduledDate.split('-').map(Number);
  const [hours, minutes] = parsedHHMM.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes).toISOString();
}

export function DoseConfirmationModal({ dose, onClose }: { dose: Dose<Medication> | null; onClose: () => void }) {
  const { colors, fontScale: scale } = useSettings();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string>();
  const [timeError, setTimeError] = useState<string>();
  const [choosingTiming, setChoosingTiming] = useState(false);
  const [takenTimeInput, setTakenTimeInput] = useState('');

  useEffect(() => {
    if (dose) {
      setMessage(undefined);
      setTimeError(undefined);
      setChoosingTiming(false);
      setTakenTimeInput(currentTimeString(dose.log?.loggedAt));
    }
  }, [dose]);

  const close = () => {
    setMessage(undefined);
    setTimeError(undefined);
    setSaving(false);
    setChoosingTiming(false);
    onClose();
  };

  const save = async (status: DoseStatus, timing?: DoseTiming) => {
    if (!dose || saving) return;

    let loggedAtIso: string | undefined;
    if (status === 'taken') {
      const parsed = parseTime(takenTimeInput);
      if (!parsed) {
        setTimeError('Please enter a valid time (like 8:00 AM or 20:30).');
        return;
      }
      setTimeError(undefined);
      loggedAtIso = buildLoggedAtIso(dose.scheduledDate, parsed);
    }

    setSaving(true);
    try {
      const result = await logDose({
        medicationId: dose.medication.id,
        scheduledDate: dose.scheduledDate,
        scheduledTime: dose.scheduledTime,
        status,
        timing,
        loggedAt: loggedAtIso,
      });
      if (result.saved) {
        const timingLabel = timing ? ` ${TIMING_WORDS[timing]}` : '';
        AccessibilityInfo.announceForAccessibility(
          `${dose.medication.name} logged as ${STATUS_WORDS[status]}${timingLabel}`,
        );
        close();
        return;
      }
    } catch {
      setMessage('Could not save. Please try again.');
    }
    setSaving(false);
  };

  const isToday = dose ? dose.scheduledDate === dateKey(new Date()) : true;
  const dateLabel = dose
    ? isToday
      ? 'today'
      : new Date(`${dose.scheduledDate}T12:00:00`).toLocaleDateString([], { month: 'short', day: 'numeric' })
    : '';
  const isEditing = dose ? dose.status !== 'pending' : false;
  const text = { color: colors.textPrimary, fontSize: 17 * scale, lineHeight: 25 * scale };

  return (
    <AppModal visible={!!dose} title={isEditing ? 'Edit this dose' : 'Log this dose?'} onClose={close}>
      {dose ? (
        <View style={[styles.details, { borderColor: colors.textPrimary }]}>
          <Text style={[text, styles.name, { fontSize: 22 * scale }]}>{dose.medication.name}</Text>
          <Text style={text}>{doseAmount(dose.medication)}</Text>
          <Text style={text}>
            Scheduled for {formatTime(dose.scheduledTime)} {dateLabel}
          </Text>
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
      ) : choosingTiming ? (
        <>
          <View style={styles.inputGroup}>
            <Text style={[text, styles.bold]}>What time did you take it?</Text>
            <TextInput
              value={takenTimeInput}
              onChangeText={(val) => {
                setTakenTimeInput(val);
                if (timeError) setTimeError(undefined);
              }}
              placeholder="e.g. 8:00 AM"
              placeholderTextColor={colors.textSecondary}
              accessibilityLabel="Time taken"
              style={[
                styles.input,
                {
                  color: colors.textPrimary,
                  borderColor: timeError ? colors.danger : colors.textPrimary,
                  fontSize: 18 * scale,
                },
              ]}
            />
            {timeError ? (
              <Text style={[text, { color: colors.danger, fontSize: 15 * scale }]} accessibilityLiveRegion="polite">
                {timeError}
              </Text>
            ) : null}
          </View>

          <Text style={[text, styles.bold]}>Was it on time, early, or late?</Text>
          <AccessibleButton
            label="On time"
            icon="✓"
            variant="primary"
            onPress={() => save('taken', 'on-time')}
            disabled={saving}
          />
          <View style={styles.row}>
            <AccessibleButton
              label="Early"
              onPress={() => save('taken', 'early')}
              disabled={saving}
              style={styles.half}
            />
            <AccessibleButton
              label="Late"
              onPress={() => save('taken', 'late')}
              disabled={saving}
              style={styles.half}
            />
          </View>
          <AccessibleButton label="Back" onPress={() => setChoosingTiming(false)} disabled={saving} />
        </>
      ) : (
        <>
          <AccessibleButton
            label="Yes, I took it"
            icon="✓"
            variant="primary"
            onPress={() => setChoosingTiming(true)}
            disabled={saving}
          />
          <View style={styles.row}>
            <AccessibleButton
              label="I skipped it"
              icon="—"
              onPress={() => save('skipped')}
              disabled={saving}
              style={styles.half}
            />
            <AccessibleButton
              label="I missed it"
              icon="✕"
              onPress={() => save('missed')}
              disabled={saving}
              style={styles.half}
            />
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
  inputGroup: { gap: 6 },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontWeight: '600',
  },
  row: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  half: { flexGrow: 1, flexBasis: 140 },
});