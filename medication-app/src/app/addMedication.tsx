import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AccessibleButton } from '@/components/accessibleButton';
import { ChoiceChip } from '@/components/choiceChip';
import { FormField } from '@/components/formField';
import { ScheduleDraft, ScheduleFields } from '@/components/scheduleFields';
import { useSettings } from '@/context/settingsContext';
import { dateKey } from '@/services/doseSchedule';
import { localMedications } from '@/services/medicationStore';
import { DrugLabel, getDrugLabel } from '@/services/openFda';

const UNITS = ['mg', 'mcg', 'mL', 'tablet', 'capsule', 'drop', 'puff', 'unit'];

type Errors = {
  name?: string;
  dosage?: string;
  unit?: string;
  days?: string;
  times?: string;
  save?: string;
};

// First sentence or so of the label's purpose or uses, as a starting point
// the user can edit. Long FDA text would not fit a "what is it for" field.
function shortUse(label: DrugLabel) {
  const source = label.sections.find((section) => section.key === 'purpose' || section.key === 'uses');
  if (!source) return '';
  const text = source.text.replace(/\s+/g, ' ').trim();
  if (text.length <= 160) return text;
  const sentenceEnd = text.slice(0, 160).lastIndexOf('. ');
  return sentenceEnd > 40 ? text.slice(0, sentenceEnd + 1) : `${text.slice(0, 157)}…`;
}

export default function AddMedicationScreen() {
  // Set when opened from a Lookup label, to pre-fill the form.
  const { setId } = useLocalSearchParams<{ setId?: string }>();
  const { colors, fontScale: scale } = useSettings();

  const [label, setLabel] = useState<DrugLabel>();
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [unit, setUnit] = useState('');
  const [effect, setEffect] = useState('');
  const [instructions, setInstructions] = useState('');
  const [sideEffects, setSideEffects] = useState('');
  const [schedule, setSchedule] = useState<ScheduleDraft>({
    frequencyType: 'daily',
    daysOfWeek: [],
    reminderTimes: [],
  });
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!setId) return;
    let active = true;
    // Already cached from the Lookup screen, so this is usually instant.
    getDrugLabel(setId)
      .then((found) => {
        if (!active) return;
        setLabel(found);
        setName(found.displayName);
        setEffect(shortUse(found));
      })
      .catch(() => {
        // The form still works without the label; the user types the name.
      });
    return () => {
      active = false;
    };
  }, [setId]);

  const save = async () => {
    const amount = Number(dosage.replace(',', '.'));
    const next: Errors = {};
    if (!name.trim()) next.name = 'Enter the medication name.';
    if (!dosage.trim()) next.dosage = 'Enter how much you take each time.';
    else if (!Number.isFinite(amount) || amount <= 0) next.dosage = 'Enter a number, like 500 or 0.5.';
    if (!unit) next.unit = 'Choose a unit.';
    if (schedule.frequencyType === 'specific_days' && schedule.daysOfWeek.length === 0) {
      next.days = 'Choose at least one day.';
    }
    if (schedule.frequencyType !== 'as_needed' && schedule.reminderTimes.length === 0) {
      next.times = 'Choose at least one time.';
    }
    setErrors(next);

    if (Object.keys(next).length > 0) {
      AccessibilityInfo.announceForAccessibility(
        `Please fix ${Object.keys(next).length === 1 ? 'one field' : `${Object.keys(next).length} fields`}. ${Object.values(next).join(' ')}`,
      );
      return;
    }

    setSaving(true);
    try {
      await localMedications.add({
        name: name.trim(),
        dosage: amount,
        dosageUnit: unit,
        effect: effect.trim(),
        instructions: instructions.trim(),
        sideEffects: sideEffects
          .split(/[,\n]/)
          .map((item) => item.trim())
          .filter(Boolean),
        genericName: label?.genericName,
        fdaSetId: label?.setId,
        schedule: {
          frequencyType: schedule.frequencyType,
          daysOfWeek: schedule.frequencyType === 'specific_days' ? schedule.daysOfWeek : [],
          reminderTimes: schedule.frequencyType === 'as_needed' ? [] : schedule.reminderTimes,
          startDate: dateKey(new Date()),
        },
      });
      AccessibilityInfo.announceForAccessibility(`${name.trim()} added to your medications`);
      router.back();
    } catch {
      setErrors({ save: 'Could not save. Please try again.' });
      setSaving(false);
    }
  };

  const text = { color: colors.textPrimary, fontSize: 16 * scale, lineHeight: 24 * scale };
  const muted = { color: colors.textSecondary, fontSize: 14 * scale, lineHeight: 20 * scale };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets>
      <View style={styles.column}>
        {label ? (
          <View style={[styles.notice, { borderColor: colors.primary }]}>
            <Text style={text}>
              Filled in from the FDA label for <Text style={styles.bold}>{label.displayName}</Text>.
              Check each field and enter the dose your doctor or pharmacist gave you.
            </Text>
          </View>
        ) : null}

        <FormField
          label="Medication name"
          required
          value={name}
          onChangeText={setName}
          error={errors.name}
          autoCapitalize="words"
          placeholder="e.g. Lisinopril"
        />

        <FormField
          label="Dose amount"
          required
          help="How much you take each time, from your prescription or package."
          value={dosage}
          onChangeText={setDosage}
          error={errors.dosage}
          keyboardType="decimal-pad"
          placeholder="e.g. 10"
        />

        <View style={styles.field}>
          <Text style={[styles.fieldLabel, { color: colors.textPrimary, fontSize: 16 * scale }]}>
            Unit (required)
          </Text>
          <View style={styles.units} accessibilityRole="radiogroup" accessibilityLabel="Unit">
            {UNITS.map((option) => (
              <ChoiceChip key={option} label={option} selected={option === unit} onPress={() => setUnit(option)} />
            ))}
          </View>
          {errors.unit ? (
            <Text style={[styles.error, { color: colors.danger, fontSize: 14 * scale }]}>⚠ {errors.unit}</Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <ScheduleFields value={schedule} onChange={setSchedule} errors={errors} />
        </View>

        <FormField
          label="What it is for"
          value={effect}
          onChangeText={setEffect}
          multiline
          placeholder="e.g. Blood pressure"
        />

        <FormField
          label="Instructions"
          help="How your doctor or pharmacist told you to take it."
          value={instructions}
          onChangeText={setInstructions}
          multiline
          placeholder="e.g. 1 tablet every morning with food"
        />

        <FormField
          label="Side effects to watch for"
          help="Separate each one with a comma."
          value={sideEffects}
          onChangeText={setSideEffects}
          multiline
          placeholder="e.g. dizziness, dry cough"
        />

        {errors.save ? (
          <Text style={[styles.error, { color: colors.danger, fontSize: 15 * scale }]} accessibilityLiveRegion="polite">
            ⚠ {errors.save}
          </Text>
        ) : null}

        <AccessibleButton
          label={saving ? 'Saving…' : 'Save medication'}
          icon="✓"
          variant="primary"
          onPress={save}
          disabled={saving}
        />
        <AccessibleButton label="Cancel" onPress={() => router.back()} style={styles.cancel} />

        {/* FUTURE BACKEND: replace with account sync when the medications API is ready. */}
        <Text style={[muted, styles.footer]}>Saved on this phone only until accounts are connected.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 20, paddingBottom: 48 },
  column: { width: '100%', maxWidth: 640, alignSelf: 'center' },
  notice: { borderWidth: 2, borderRadius: 14, padding: 14, marginBottom: 20 },
  bold: { fontWeight: '700' },
  field: { marginBottom: 18 },
  fieldLabel: { fontWeight: '700', marginBottom: 8 },
  units: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  section: { marginBottom: 24 },
  error: { marginTop: 6, fontWeight: '700' },
  cancel: { marginTop: 10 },
  footer: { marginTop: 16, textAlign: 'center' },
});
