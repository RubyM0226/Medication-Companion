// The History week grid: one row per medicine, one column per day, with a
// check for taken, a cross for missed, a dash for skipped and a dotted ring
// for not logged yet. Each medicine's name sits on its own line above its row
// of days, so long names and large text sizes still fit on a phone.
//
// Every cell is a button that selects its day and reads out what happened, so
// the grid works with a screen reader and is never color only.

import { Pressable, StyleSheet, View } from 'react-native';

import { summarizeCell } from '@/components/history/dayStatus';
import { BodyText } from '@/components/ui/appText';
import { pillAppearance, PillMark } from '@/components/ui/pillMark';
import { StatusMark } from '@/components/ui/statusMark';
import { useSettings } from '@/context/settingsContext';
import { HistoryDay } from '@/hooks/useWeekHistory';
import { Medication } from '@/services/medicationStore';

const longDay = (date: Date) => date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

export function WeekGrid({
  medications,
  days,
  now,
  selectedKey,
  onSelect,
}: {
  medications: Medication[];
  days: HistoryDay[];
  now: Date;
  selectedKey: string;
  onSelect: (key: string) => void;
}) {
  const { colors, touchTarget, toggles } = useSettings();
  const todayKey = days.find((day) => day.date.toDateString() === now.toDateString())?.key;
  const cellHeight = Math.max(touchTarget, 48);

  return (
    <View style={styles.grid}>
      {/* Day headings. Tapping one shows that day's doses below. */}
      <View style={styles.row}>
        {days.map((day) => {
          const selected = day.key === selectedKey;
          const today = day.key === todayKey;
          return (
            <Pressable
              key={day.key}
              onPress={() => onSelect(day.key)}
              accessibilityRole="button"
              accessibilityLabel={`${today ? 'Today, ' : ''}${longDay(day.date)}`}
              accessibilityHint="Shows this day's doses"
              accessibilityState={{ selected }}
              style={({ pressed }) => [
                styles.dayHead,
                { minHeight: cellHeight },
                selected && { backgroundColor: colors.accent },
                pressed && styles.pressed,
              ]}>
              <BodyText size="small" bold color={selected ? colors.onAccent : colors.textSecondary}>
                {day.date.toLocaleDateString([], { weekday: 'narrow' })}
              </BodyText>
              <BodyText size="meta" bold color={selected ? colors.onAccent : colors.textPrimary}>
                {day.date.getDate()}
              </BodyText>
              {today ? <View style={[styles.todayDot, { backgroundColor: selected ? colors.onAccent : colors.primary }]} /> : null}
            </Pressable>
          );
        })}
      </View>

      {medications.map((medication) => {
        const pill = pillAppearance(medication);
        return (
          <View key={medication.id} style={[styles.medicine, { borderTopColor: colors.ringTrack }]}>
            <View style={styles.name}>
              <PillMark form={pill.form} color={pill.color} size={26} />
              <BodyText bold style={styles.nameText}>
                {medication.name}
              </BodyText>
            </View>
            <View style={styles.row}>
              {days.map((day) => {
                const cell = summarizeCell(
                  day.doses.filter((dose) => dose.medication.id === medication.id),
                  now,
                );
                const selected = day.key === selectedKey;
                return (
                  <Pressable
                    key={day.key}
                    onPress={() => onSelect(day.key)}
                    accessibilityRole="button"
                    accessibilityLabel={`${medication.name}, ${longDay(day.date)}: ${cell.words}`}
                    accessibilityState={{ selected }}
                    style={({ pressed }) => [
                      styles.cell,
                      {
                        minHeight: cellHeight,
                        backgroundColor: cell.mark ? colors.surface : 'transparent',
                        // Days with nothing scheduled stay blank, even when selected.
                        borderColor: !cell.mark
                          ? 'transparent'
                          : selected || toggles.highContrast
                            ? colors.textPrimary
                            : colors.ringTrack,
                        borderWidth: selected && cell.mark ? 2 : 1,
                      },
                      pressed && styles.pressed,
                    ]}>
                    {cell.mark ? <StatusMark status={cell.mark} size={22} /> : null}
                    {cell.total > 1 ? (
                      <BodyText size="small" muted>
                        {cell.taken}/{cell.total}
                      </BodyText>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { gap: 6 },
  row: { flexDirection: 'row', gap: 4 },
  dayHead: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 14, paddingVertical: 4 },
  todayDot: { width: 6, height: 6, borderRadius: 3, marginTop: 2 },
  medicine: { gap: 6, borderTopWidth: 1, paddingTop: 10, marginTop: 4 },
  name: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nameText: { flexShrink: 1 },
  cell: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  pressed: { opacity: 0.7 },
});
