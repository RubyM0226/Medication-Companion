import { router } from 'expo-router';
import { AccessibilityInfo, Alert, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AccessibleButton } from '@/components/accessibleButton';
import { useSettings } from '@/context/settingsContext';
import { useMedications } from '@/hooks/useMedications';
import { describeSchedule } from '@/services/doseSchedule';
import { Medication } from '@/services/medicationStore';

export default function MedicationsScreen() {
  const { colors, fontScale: scale } = useSettings();
  const { medications, loaded, remove } = useMedications();

  const confirmRemove = (medication: Medication) => {
    const removeIt = async () => {
      await remove(medication.id);
      AccessibilityInfo.announceForAccessibility(`${medication.name} removed`);
    };
    const message = `Remove ${medication.name} from your medications?`;

    // Alert buttons are not supported on web.
    if (Platform.OS === 'web') {
      if (window.confirm(message)) removeIt();
      return;
    }
    Alert.alert('Remove medication?', message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: removeIt },
    ]);
  };

  const text = { color: colors.textPrimary, fontSize: 16 * scale, lineHeight: 24 * scale };
  const muted = { color: colors.textSecondary, fontSize: 14 * scale, lineHeight: 20 * scale };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}>
      <View style={styles.column}>
        <Text style={[styles.title, { color: colors.textPrimary, fontSize: 30 * scale }]} accessibilityRole="header">
          My Medications
        </Text>
        {/* FUTURE BACKEND: replace with account sync when the medications API is ready. */}
        <Text style={[muted, styles.subtitle]}>Saved on this phone only until accounts are connected.</Text>

        <AccessibleButton
          label="Add medication"
          icon="＋"
          variant="primary"
          onPress={() => router.push('/addMedication')}
          accessibilityHint="Opens a form to add a medication by hand"
        />
        <AccessibleButton
          label="Find a medication in Lookup"
          icon="🔍"
          onPress={() => router.navigate('/lookup')}
          style={styles.secondButton}
        />

        {loaded && medications.length === 0 ? (
          <View style={[styles.card, styles.empty, { borderColor: colors.textSecondary }]}>
            <Text style={[text, styles.bold]}>No medications yet</Text>
            <Text style={text}>
              Add one by hand, or search for it in Lookup and tap “Add to my medications”.
            </Text>
          </View>
        ) : null}

        {medications.length > 0 ? (
          <Text style={[styles.count, { color: colors.textPrimary, fontSize: 18 * scale }]} accessibilityRole="header">
            {medications.length} {medications.length === 1 ? 'medication' : 'medications'}
          </Text>
        ) : null}

        {medications.map((medication) => (
          <View key={medication.id} style={[styles.card, { borderColor: colors.textPrimary }]}>
            <Text style={[styles.name, { color: colors.textPrimary, fontSize: 22 * scale }]} accessibilityRole="header">
              {medication.name}
            </Text>
            <Text style={[text, styles.bold]}>
              Dose: {medication.dosage} {medication.dosageUnit}
            </Text>
            <Text style={text}>When: {describeSchedule(medication.schedule)}</Text>
            {medication.genericName && medication.genericName !== medication.name ? (
              <Text style={muted}>Generic: {medication.genericName}</Text>
            ) : null}
            {medication.effect ? <Text style={text}>For: {medication.effect}</Text> : null}
            {medication.instructions ? <Text style={text}>How to take: {medication.instructions}</Text> : null}
            {medication.sideEffects.length > 0 ? (
              <Text style={text}>Watch for: {medication.sideEffects.join(', ')}</Text>
            ) : null}

            <View style={styles.actions}>
              {medication.fdaSetId ? (
                <AccessibleButton
                  label="FDA label"
                  icon="ⓘ"
                  onPress={() =>
                    router.push({ pathname: '/drug/[setId]', params: { setId: medication.fdaSetId! } })
                  }
                  accessibilityLabel={`View FDA label for ${medication.name}`}
                  style={styles.action}
                />
              ) : null}
              <AccessibleButton
                label="Remove"
                icon="✕"
                variant="danger"
                onPress={() => confirmRemove(medication)}
                accessibilityLabel={`Remove ${medication.name}`}
                style={styles.action}
              />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  column: { width: '100%', maxWidth: 640, alignSelf: 'center' },
  title: { fontWeight: '700' },
  subtitle: { marginBottom: 16 },
  secondButton: { marginTop: 10 },
  card: { borderWidth: 1.5, borderRadius: 14, padding: 16, gap: 6, marginTop: 12 },
  empty: { borderStyle: 'dashed', marginTop: 24 },
  bold: { fontWeight: '700' },
  count: { fontWeight: '700', marginTop: 24 },
  name: { fontWeight: '700' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
  action: { flexGrow: 1 },
});
