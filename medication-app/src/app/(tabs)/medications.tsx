// My medicines: every saved medicine with its pill drawing, dose and schedule.
// Design refresh: one title (the header), cards with the pill drawing, long
// "watch for" lists shortened behind Show more, and Change pill look.

import { router } from 'expo-router';
import { useState } from 'react';
import { AccessibilityInfo, Alert, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { AccessibleButton } from '@/components/accessibleButton';
import { AppModal } from '@/components/appModal';
import { PillLook, PillPicker } from '@/components/pillPicker';
import { BodyText, Heading } from '@/components/ui/appText';
import { Card } from '@/components/ui/card';
import { ScreenTitle } from '@/components/ui/screenTitle';
import { describePill, pillAppearance, PillMark } from '@/components/ui/pillMark';
import { useSettings } from '@/context/settingsContext';
import { useMedications } from '@/hooks/useMedications';
import { describeSchedule } from '@/services/doseSchedule';
import { Medication } from '@/services/medicationStore';

// Side effects shown before "Show more", so one medicine cannot fill the screen.
const SIDE_EFFECTS_SHOWN = 3;

function MedicationCard({
  medication,
  onChangeLook,
  onRemove,
}: {
  medication: Medication;
  onChangeLook: () => void;
  onRemove: () => void;
}) {
  const { colors } = useSettings();
  const [expanded, setExpanded] = useState(false);
  const pill = pillAppearance(medication);
  const extra = medication.sideEffects.length - SIDE_EFFECTS_SHOWN;
  const sideEffects =
    expanded || extra <= 0
      ? medication.sideEffects.join(', ')
      : `${medication.sideEffects.slice(0, SIDE_EFFECTS_SHOWN).join(', ')} and ${extra} more`;
  const longText = medication.instructions.length > 140;
  const canExpand = extra > 0 || longText;

  return (
    <Card style={styles.card}>
      <View style={styles.top}>
        <PillMark form={pill.form} color={pill.color} size={52} />
        <View style={styles.topText}>
          <Heading level="section">{medication.name}</Heading>
          <BodyText bold>
            {medication.dosage} {medication.dosageUnit}
          </BodyText>
          <BodyText size="meta" muted>
            {describeSchedule(medication.schedule)}
          </BodyText>
        </View>
      </View>

      <View style={[styles.details, { borderTopColor: colors.ringTrack }]}>
        {medication.genericName && medication.genericName !== medication.name ? (
          <BodyText size="meta" muted>
            Generic name: {medication.genericName}
          </BodyText>
        ) : null}
        {medication.effect ? (
          <BodyText>
            <BodyText bold>For </BodyText>
            {medication.effect}
          </BodyText>
        ) : null}
        {medication.instructions ? (
          <BodyText numberOfLines={expanded ? undefined : 3}>
            <BodyText bold>How to take </BodyText>
            {medication.instructions}
          </BodyText>
        ) : null}
        {medication.sideEffects.length > 0 ? (
          <BodyText>
            <BodyText bold>Watch for </BodyText>
            {sideEffects}
          </BodyText>
        ) : null}
        {canExpand ? (
          <AccessibleButton
            label={expanded ? 'Show less' : 'Show more'}
            onPress={() => setExpanded((open) => !open)}
            accessibilityLabel={`${expanded ? 'Show less' : 'Show more'} about ${medication.name}`}
            style={styles.more}
          />
        ) : null}
      </View>

      <View style={styles.actions}>
        <AccessibleButton
          label="Change pill look"
          onPress={onChangeLook}
          accessibilityLabel={`Change pill look for ${medication.name}. Now: ${describePill(pill.form, pill.color)}`}
          style={styles.action}
        />
        {medication.fdaSetId ? (
          <AccessibleButton
            label="FDA label"
            icon="ⓘ"
            onPress={() => router.push({ pathname: '/drug/[setId]', params: { setId: medication.fdaSetId! } })}
            accessibilityLabel={`View FDA label for ${medication.name}`}
            style={styles.action}
          />
        ) : null}
        <AccessibleButton
          label="Remove"
          variant="danger"
          onPress={onRemove}
          accessibilityLabel={`Remove ${medication.name}`}
          style={styles.action}
        />
      </View>
    </Card>
  );
}

export default function MedicationsScreen() {
  const { colors } = useSettings();
  const { medications, loaded, remove, updateAppearance } = useMedications();
  const [editing, setEditing] = useState<Medication | null>(null);
  const [look, setLook] = useState<PillLook>({ form: 'round', color: '#FFFFFF' });
  const [saveError, setSaveError] = useState('');

  const confirmRemove = (medication: Medication) => {
    const removeIt = async () => {
      await remove(medication.id);
      AccessibilityInfo.announceForAccessibility(`${medication.name} removed`);
    };
    const message = `Remove ${medication.name} from your medicines? Your past doses stay in History.`;

    // Alert buttons are not supported on web.
    if (Platform.OS === 'web') {
      if (window.confirm(message)) removeIt();
      return;
    }
    Alert.alert('Remove medicine?', message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: removeIt },
    ]);
  };

  const openLook = (medication: Medication) => {
    setLook(pillAppearance(medication));
    setSaveError('');
    setEditing(medication);
  };

  const saveLook = async () => {
    if (!editing) return;
    try {
      await updateAppearance(editing.id, look.form, look.color);
      AccessibilityInfo.announceForAccessibility(`${editing.name} now shows a ${describePill(look.form, look.color)}`);
      setEditing(null);
    } catch {
      setSaveError('Could not save. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.column}>
        {/* FUTURE BACKEND: replace with account sync when the medications API is ready. */}
        <ScreenTitle title="My medicines" subtitle="Saved on this phone only until accounts are connected." />

        <View style={styles.buttons}>
          <AccessibleButton
            label="Add medicine"
            icon="＋"
            variant="primary"
            onPress={() => router.push('/addMedication')}
            accessibilityHint="Opens a form to add a medicine by hand"
          />
          <AccessibleButton label="Find a medicine in Lookup" onPress={() => router.navigate('/lookup')} />
        </View>

        {loaded && medications.length === 0 ? (
          <Card style={styles.empty}>
            <Heading level="section">No medicines yet</Heading>
            <BodyText>Add one by hand, or search for it in Lookup and tap “Add to my medications”.</BodyText>
          </Card>
        ) : null}

        {medications.length > 0 ? (
          <BodyText size="meta" bold muted accessibilityRole="header">
            {medications.length} {medications.length === 1 ? 'medicine' : 'medicines'}
          </BodyText>
        ) : null}

        {medications.map((medication) => (
          <MedicationCard
            key={medication.id}
            medication={medication}
            onChangeLook={() => openLook(medication)}
            onRemove={() => confirmRemove(medication)}
          />
        ))}
      </View>

      <AppModal visible={editing !== null} title="Change pill look" onClose={() => setEditing(null)}>
        {editing ? <BodyText muted>{editing.name}</BodyText> : null}
        <PillPicker value={look} onChange={setLook} />
        {saveError ? (
          <BodyText bold color={colors.danger} accessibilityLiveRegion="polite">
            {saveError}
          </BodyText>
        ) : null}
        <AccessibleButton label="Save" icon="✓" variant="primary" onPress={saveLook} />
        <AccessibleButton label="Cancel" onPress={() => setEditing(null)} />
      </AppModal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  column: { width: '100%', maxWidth: 640, alignSelf: 'center', gap: 14 },
  buttons: { gap: 10 },
  empty: { gap: 6, marginTop: 8 },
  card: { gap: 12 },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  topText: { flex: 1, gap: 2 },
  details: { gap: 6, borderTopWidth: 1, paddingTop: 12 },
  more: { alignSelf: 'flex-start', marginTop: 4 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  action: { flexGrow: 1 },
});
