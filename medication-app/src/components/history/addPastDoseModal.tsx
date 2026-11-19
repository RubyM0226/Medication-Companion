// Lets a person add a past dose on a selected History day that was never logged,
// choosing taken (with time and on-time/early/late), skipped, or missed.

import { useEffect, useState } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AccessibleButton } from '@/components/accessibleButton';
import { AppModal } from '@/components/appModal';
import { doseAmount } from '@/components/home/format';
import { Text } from '@/components/ui/text';
import { useSettings } from '@/context/settingsContext';
import { logDose } from '@/services/doseLogStore';
import { DoseStatus, DoseTiming, parseTime } from '@/services/doseSchedule';
import { Medication } from '@/services/medicationStore';

const STATUS_WORDS: Record<DoseStatus, string> = {
  taken: 'taken',
  missed: 'missed',
  skipped: 'skipped',
};

const TIMING_WORDS: Record<DoseTiming, string> = {
  'on-time': 'on time',
  early: 'early',
  late: 'late',
};

function buildLoggedAtIso(scheduledDate: string, parsedHHMM: string): string {
  const [year, month, day] = scheduledDate.split('-').map(Number);
  const [hours, minutes] = parsedHHMM.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes).toISOString();
}

export function AddPastDoseModal({
  visible,
  dateKey,
  dateLabel,
  medications,
  onClose,
}: {
  visible: boolean;
  dateKey: string;
  dateLabel: string;
  medications: Medication[];
  onClose: () => void;
}) {
  const { colors, fontScale: scale } = useSettings();
  const [selectedMedId, setSelectedMedId] = useState<string>('');
  const [timeInput, setTimeInput] = useState('8:00 AM');
  const [choosingTiming, setChoosingTiming] = useState(false);
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setSelectedMedId(medications?.[0]?.id ?? '');
      setTimeInput('8:00 AM');
      setChoosingTiming(false);
      setError(undefined);
      setSaving(false);
    }
  }, [visible, medications]);

  const handleSave = async (status: DoseStatus, timing?: DoseTiming) => {
    if (saving) return;
    const med = medications.find((m) => m.id === selectedMedId);
    if (!med) {
      setError('Please select a medicine.');
      return;
    }
    const parsed = parseTime(timeInput);
    if (!parsed) {
      setError('Please enter a valid time (like 8:00 AM or 20:30).');
      return;
    }

    setSaving(true);
    setError(undefined);
    try {
      await logDose({
        medicationId: med.id,
        scheduledDate: dateKey,
        scheduledTime: parsed,
        status,
        timing,
        loggedAt: buildLoggedAtIso(dateKey, parsed),
      });
      const timingLabel = timing ? ` ${TIMING_WORDS[timing]}` : '';
      AccessibilityInfo.announceForAccessibility(
        `Added ${med.name} on ${dateLabel} as ${STATUS_WORDS[status]}${timingLabel}`,
      );
      onClose();
    } catch {
      setError('Could not save this dose. Please try again.');
    }
    setSaving(false);
  };

  const text = { color: colors.textPrimary, fontSize: 17 * scale, lineHeight: 25 * scale };

  return (
    <AppModal visible={visible} title={`Add past dose (${dateLabel})`} onClose={onClose}>
      <View style={styles.section}>
        <Text style={[text, styles.bold]}>Which medicine?</Text>
        <View style={styles.medList}>
          {medications.map((med) => {
            const active = med.id === selectedMedId;
            return (
              <Pressable
                key={med.id}
                onPress={() => {
                  setSelectedMedId(med.id);
                  if (error) setError(undefined);
                }}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                style={[
                  styles.medOption,
                  {
                    borderColor: active ? colors.primary : colors.textSecondary,
                    backgroundColor: active ? `${colors.primary}15` : 'transparent',
                  },
                ]}>
                <Text style={[text, styles.bold]}>{med.name}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 14 * scale }}>
                  {doseAmount(med)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[text, styles.bold]}>
          {choosingTiming ? 'What time did you take it?' : 'What time was this dose?'}
        </Text>
        <TextInput
          value={timeInput}
          onChangeText={(val) => {
            setTimeInput(val);
            if (error) setError(undefined);
          }}
          placeholder="e.g. 8:00 AM"
          placeholderTextColor={colors.textSecondary}
          accessibilityLabel="Dose time"
          style={[
            styles.input,
            {
              color: colors.textPrimary,
              borderColor: error ? colors.danger : colors.textPrimary,
              fontSize: 18 * scale,
            },
          ]}
        />
        {error ? (
          <Text style={[text, { color: colors.danger, fontSize: 15 * scale }]} accessibilityLiveRegion="polite">
            {error}
          </Text>
        ) : null}
      </View>

      {choosingTiming ? (
        <>
          <Text style={[text, styles.bold]}>Was it on time, early, or late?</Text>
          <AccessibleButton
            label="On time"
            icon="✓"
            variant="primary"
            onPress={() => handleSave('taken', 'on-time')}
            disabled={saving}
          />
          <View style={styles.row}>
            <AccessibleButton
              label="Early"
              onPress={() => handleSave('taken', 'early')}
              disabled={saving}
              style={styles.half}
            />
            <AccessibleButton
              label="Late"
              onPress={() => handleSave('taken', 'late')}
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
            onPress={() => {
              if (!selectedMedId) {
                setError('Please select a medicine.');
                return;
              }
              if (!parseTime(timeInput)) {
                setError('Please enter a valid time (like 8:00 AM or 20:30).');
                return;
              }
              setChoosingTiming(true);
            }}
            disabled={saving}
          />
          <View style={styles.row}>
            <AccessibleButton
              label="I skipped it"
              icon="—"
              onPress={() => handleSave('skipped')}
              disabled={saving}
              style={styles.half}
            />
            <AccessibleButton
              label="I missed it"
              icon="✕"
              onPress={() => handleSave('missed')}
              disabled={saving}
              style={styles.half}
            />
          </View>
          <AccessibleButton label="Cancel" onPress={onClose} disabled={saving} />
        </>
      )}
    </AppModal>
  );
}

const styles = StyleSheet.create({
  section: { gap: 8 },
  bold: { fontWeight: '600' },
  medList: { gap: 8 },
  medOption: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
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
