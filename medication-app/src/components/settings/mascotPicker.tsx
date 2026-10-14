// Choose a dinosaur companion, or none. A radio group: the selected tile gets
// a thicker border, a check mark and the word "Selected", not just color.

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MascotDisplay } from '@/components/mascotDisplay';
import { SettingCard } from '@/components/settings/settingCard';
import { MASCOTS, MascotChoice } from '@/constants/mascots';
import { useSettings } from '@/context/settingsContext';

export function MascotPicker() {
  const { colors, fontScale, mascot, setMascot, touchTarget } = useSettings();
  const options: { id: MascotChoice; name: string }[] = [
    ...MASCOTS.map(({ id, name }) => ({ id, name })),
    { id: 'none', name: 'No mascot' },
  ];

  return (
    <SettingCard>
      <Text style={[styles.label, { color: colors.textPrimary, fontSize: 18 * fontScale }]}>
        Dinosaur companion
      </Text>
      <Text style={{ color: colors.textSecondary, fontSize: 14 * fontScale }}>
        Shown on your Home screen. It does not change how reminders or tracking work.
      </Text>
      <View style={styles.grid} accessibilityRole="radiogroup" accessibilityLabel="Dinosaur companion">
        {options.map((option) => {
          const selected = option.id === mascot;
          return (
            <Pressable
              key={option.id}
              onPress={() => setMascot(option.id)}
              accessibilityRole="radio"
              accessibilityLabel={option.name}
              accessibilityState={{ checked: selected }}
              style={({ pressed }) => [
                styles.tile,
                {
                  minHeight: touchTarget + 40,
                  borderColor: selected ? colors.primary : colors.textSecondary,
                  borderWidth: selected ? 3 : 1,
                },
                pressed && styles.pressed,
              ]}>
              {option.id === 'none' ? (
                <View style={[styles.none, { borderColor: colors.textSecondary }]}>
                  <Text style={{ color: colors.textPrimary, fontSize: 28 }}>⊘</Text>
                </View>
              ) : (
                <MascotDisplay choice={option.id} size={64} />
              )}
              <Text
                style={[
                  styles.name,
                  {
                    color: colors.textPrimary,
                    fontSize: 13 * fontScale,
                    fontWeight: selected ? '800' : '500',
                  },
                ]}>
                {selected ? `✓ ${option.name}` : option.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SettingCard>
  );
}

const styles = StyleSheet.create({
  label: { fontWeight: '600', marginBottom: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  tile: {
    width: 96,
    flexGrow: 1,
    alignItems: 'center',
    borderRadius: 14,
    padding: 8,
    gap: 6,
  },
  pressed: { opacity: 0.6 },
  none: {
    width: 64,
    height: 64,
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { textAlign: 'center' },
});
