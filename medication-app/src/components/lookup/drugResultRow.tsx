// One product in the search results. Rows with the same name are told apart
// by generic name, maker and route.

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Chip } from '@/components/lookup/chip';
import { useSettings } from '@/context/settingsContext';
import { DrugLabelSummary } from '@/services/openFda';

export function DrugResultRow({ drug, onPress }: { drug: DrugLabelSummary; onPress: () => void }) {
  const { colors, fontScale, touchTarget } = useSettings();
  const kind =
    drug.isPrescription === undefined ? undefined : drug.isPrescription ? 'Prescription' : 'Over the counter';
  const details = [drug.genericName, drug.route, drug.manufacturer].filter(Boolean);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={[drug.displayName, kind, ...details].filter(Boolean).join(', ')}
      accessibilityHint="Opens the FDA label details"
      style={({ pressed }) => [
        styles.row,
        { borderColor: colors.textPrimary, minHeight: touchTarget + 24 },
        pressed && styles.pressed,
      ]}>
      <View style={styles.text}>
        <Text style={[styles.name, { color: colors.textPrimary, fontSize: 18 * fontScale }]}>
          {drug.displayName}
        </Text>
        {drug.genericName && drug.genericName !== drug.displayName ? (
          <Text style={{ color: colors.textPrimary, fontSize: 15 * fontScale }}>
            Generic: {drug.genericName}
          </Text>
        ) : null}
        <Text style={{ color: colors.textSecondary, fontSize: 14 * fontScale }}>
          {[drug.route, drug.manufacturer].filter(Boolean).join(' • ')}
        </Text>
        {kind ? (
          <View style={styles.chips}>
            <Chip label={kind} />
          </View>
        ) : null}
      </View>
      <Text style={[styles.chevron, { color: colors.textPrimary, fontSize: 24 * fontScale }]}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 10,
  },
  pressed: { opacity: 0.6 },
  text: { flex: 1, gap: 2 },
  name: { fontWeight: '700' },
  chips: { flexDirection: 'row', marginTop: 6 },
  chevron: { marginLeft: 8 },
});
