import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { ComponentRef, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AccessibilityInfo, ScrollView, StyleSheet, View } from 'react-native';

import { AccessibleButton } from '@/components/accessibleButton';
import { ChoiceChip } from '@/components/choiceChip';
import { FormField } from '@/components/formField';
import { DEFAULT_PILL_LOOK, PillLook, PillPicker } from '@/components/pillPicker';
import { ScheduleDraft, ScheduleFields } from '@/components/scheduleFields';
import { BodyText, Heading } from '@/components/ui/appText';
import { pillAppearance } from '@/components/ui/pillMark';
import { SkyBackground } from '@/components/ui/skyBackground';
import { Text } from '@/components/ui/text';
import { useSettings } from '@/context/settingsContext';
import { dateKey } from '@/services/doseSchedule';
import { localMedications, Medication } from '@/services/medicationStore';
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

type RequiredFieldKey = 'name' | 'dosage' | 'unit' | 'days' | 'times';

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
  // setId is set from Lookup; id is set when opened from "Edit pill" on My medicines.
  const { setId, id } = useLocalSearchParams<{ setId?: string; id?: string }>();
  const medId = Array.isArray(id) ? id[0] : id;
  const navigation = useNavigation();
  const { colors, fontScale: scale, reduceMotion } = useSettings();

  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const fieldY = useRef<Partial<Record<RequiredFieldKey, number>>>({});

  const [existing, setExisting] = useState<Medication>();
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
  const [pillLook, setPillLook] = useState<PillLook>(DEFAULT_PILL_LOOK);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  useLayoutEffect(() => {
    if (medId) {
      navigation.setOptions({ title: 'Edit medicine' });
    }
  }, [medId, navigation]);

  useEffect(() => {
    if (!medId) return;
    let active = true;
    localMedications.list().then((list) => {
      if (!active) return;
      const found = list.find((med) => med.id === medId);
      if (!found) return;
      setExisting(found);
      setName(found.name);
      setDosage(String(found.dosage));
      setUnit(found.dosageUnit);
      setEffect(found.effect);
      setInstructions(found.instructions);
      setSideEffects(found.sideEffects.join(', '));
      setSchedule({
        frequencyType: found.schedule.frequencyType,
        daysOfWeek: found.schedule.daysOfWeek,
        reminderTimes: found.schedule.reminderTimes,
      });
      setPillLook(pillAppearance(found));
    });
    return () => {
      active = false;
    };
  }, [medId]);

  useEffect(() => {
    if (!setId || medId) return;
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
  }, [setId, medId]);

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
      const order: RequiredFieldKey[] = ['name', 'dosage', 'unit', 'days', 'times'];
      const firstMissing = order.find((key) => Boolean(next[key]));
      const targetY = firstMissing !== undefined ? fieldY.current[firstMissing] : undefined;
      if (targetY !== undefined) {
        scrollRef.current?.scrollTo({
          y: Math.max(0, targetY - 16),
          animated: !reduceMotion,
        });
      }

      AccessibilityInfo.announceForAccessibility(
        `Please fix ${Object.keys(next).length === 1 ? 'one field' : `${Object.keys(next).length} fields`}. ${Object.values(next).join(' ')}`,
      );
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        dosage: amount,
        dosageUnit: unit,
        effect: effect.trim(),
        instructions: instructions.trim(),
        sideEffects: sideEffects
          .split(/[,\n]/)
          .map((item) => item.trim())
          .filter(Boolean),
        genericName: existing?.genericName ?? label?.genericName,
        fdaSetId: existing?.fdaSetId ?? label?.setId,
        pillForm: pillLook.form,
        pillColor: pillLook.color,
        schedule: {
          frequencyType: schedule.frequencyType,
          daysOfWeek: schedule.frequencyType === 'specific_days' ? schedule.daysOfWeek : [],
          reminderTimes: schedule.frequencyType === 'as_needed' ? [] : schedule.reminderTimes,
          startDate: existing?.schedule.startDate ?? dateKey(new Date()),
          endDate: existing?.schedule.endDate,
        },
      };

      if (medId) {
        await localMedications.update(medId, payload);
        AccessibilityInfo.announceForAccessibility(`${name.trim()} updated`);
      } else {
        await localMedications.add(payload);
        AccessibilityInfo.announceForAccessibility(`${name.trim()} added to your medications`);
      }
      router.back();
    } catch {
      setErrors({ save: 'Could not save. Please try again.' });
      setSaving(false);
    }
  };
  const text = { color: colors.textPrimary, fontSize: 16 * scale, lineHeight: 24 * scale };
  const muted = { color: colors.textSecondary, fontSize: 14 * scale, lineHeight: 20 * scale };
  const unitOptions = unit && !UNITS.includes(unit) ? [...UNITS, unit] : UNITS;

  return (
    // Opens as a modal sheet, which does not show the app-wide sky, so it draws its own.
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <SkyBackground />
      <ScrollView
        ref={scrollRef}
        style={styles.screen}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets>
        <View style={styles.column}>
          {label ? (
            <View style={[styles.notice, { borderColor: colors.line, backgroundColor: colors.accentSoft }]}>
              <Text style={text}>
                Filled in from the FDA label for <Text style={styles.bold}>{label.displayName}</Text>.
                Check each field and enter the dose your doctor or pharmacist gave you.
              </Text>
            </View>
          ) : null}

          <View
            onLayout={(e) => {
              fieldY.current.name = e.nativeEvent.layout.y;
            }}>
            <FormField
              label="Medication name"
              required
              value={name}
              onChangeText={setName}
              error={errors.name}
              autoCapitalize="words"
              placeholder="e.g. Lisinopril"
            />
          </View>

          <View
            onLayout={(e) => {
              fieldY.current.dosage = e.nativeEvent.layout.y;
            }}>
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
          </View>

          <View
            style={styles.field}
            onLayout={(e) => {
              fieldY.current.unit = e.nativeEvent.layout.y;
            }}>
            <Text style={[styles.fieldLabel, { color: colors.textPrimary, fontSize: 16 * scale }]}>
              Unit (required)
            </Text>
            <View style={styles.units} accessibilityRole="radiogroup" accessibilityLabel="Unit">
              {unitOptions.map((option) => (
                <ChoiceChip key={option} label={option} selected={option === unit} onPress={() => setUnit(option)} />
              ))}
            </View>
            {errors.unit ? (
              <Text style={[styles.error, { color: colors.danger, fontSize: 14 * scale }]}>⚠ {errors.unit}</Text>
            ) : null}
          </View>

          <View style={[styles.section, styles.lookSection]}>
            <Heading level="section">How it looks</Heading>
            <BodyText size="meta" muted>
              Optional. A small drawing of your pill appears next to its name, to help you match it to what is in your
              hand.
            </BodyText>
            <PillPicker value={pillLook} onChange={setPillLook} />
          </View>

          <View
            style={styles.section}
            onLayout={(e) => {
              const y = e.nativeEvent.layout.y;
              fieldY.current.days = y;
              fieldY.current.times = y;
            }}>
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
            label={saving ? 'Saving…' : medId ? 'Save changes' : 'Save medication'}
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
    </View>
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
  lookSection: { gap: 6 },
  error: { marginTop: 6, fontWeight: '700' },
  cancel: { marginTop: 10 },
  footer: { marginTop: 16, textAlign: 'center' },
});
