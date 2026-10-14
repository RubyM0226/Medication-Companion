// How often and at what times a medication is taken. Times are stored as
// 24-hour "HH:MM" and shown in the phone's 12- or 24-hour format.

import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AccessibleButton } from '@/components/accessibleButton';
import { ChoiceChip } from '@/components/choiceChip';
import { FormField } from '@/components/formField';
import { useSettings } from '@/context/settingsContext';
import { formatTime, FrequencyType, parseTime } from '@/services/doseSchedule';

export type ScheduleDraft = {
  frequencyType: FrequencyType;
  daysOfWeek: number[];
  reminderTimes: string[];
};

const FREQUENCIES: { value: FrequencyType; label: string }[] = [
  { value: 'daily', label: 'Every day' },
  { value: 'specific_days', label: 'Certain days' },
  { value: 'as_needed', label: 'Only when needed' },
];

const DAYS = [
  { value: 1, short: 'Mon', long: 'Monday' },
  { value: 2, short: 'Tue', long: 'Tuesday' },
  { value: 3, short: 'Wed', long: 'Wednesday' },
  { value: 4, short: 'Thu', long: 'Thursday' },
  { value: 5, short: 'Fri', long: 'Friday' },
  { value: 6, short: 'Sat', long: 'Saturday' },
  { value: 0, short: 'Sun', long: 'Sunday' },
];

const COMMON_TIMES = ['08:00', '12:00', '18:00', '21:00'];

export function ScheduleFields({
  value,
  onChange,
  errors,
}: {
  value: ScheduleDraft;
  onChange: (next: ScheduleDraft) => void;
  errors: { days?: string; times?: string };
}) {
  const { colors, fontScale } = useSettings();
  const [customTime, setCustomTime] = useState('');
  const [customError, setCustomError] = useState<string>();

  const toggleTime = (time: string) =>
    onChange({
      ...value,
      reminderTimes: value.reminderTimes.includes(time)
        ? value.reminderTimes.filter((item) => item !== time)
        : [...value.reminderTimes, time].sort(),
    });

  const addCustomTime = () => {
    const time = parseTime(customTime);
    if (!time) {
      setCustomError('Enter a time like 8:30 AM or 20:30.');
      return;
    }
    setCustomError(undefined);
    setCustomTime('');
    if (!value.reminderTimes.includes(time)) toggleTime(time);
  };

  const label = [styles.label, { color: colors.textPrimary, fontSize: 16 * fontScale }];
  const error = [styles.error, { color: colors.danger, fontSize: 14 * fontScale }];

  return (
    <View>
      <Text style={[styles.heading, { color: colors.textPrimary, fontSize: 20 * fontScale }]} accessibilityRole="header">
        When you take it
      </Text>

      <Text style={label}>How often (required)</Text>
      <View style={styles.row} accessibilityRole="radiogroup" accessibilityLabel="How often">
        {FREQUENCIES.map((option) => (
          <ChoiceChip
            key={option.value}
            label={option.label}
            selected={value.frequencyType === option.value}
            onPress={() => onChange({ ...value, frequencyType: option.value })}
          />
        ))}
      </View>

      {value.frequencyType === 'specific_days' ? (
        <View style={styles.group}>
          <Text style={label}>Which days (required)</Text>
          <View style={styles.row}>
            {DAYS.map((day) => (
              <ChoiceChip
                key={day.value}
                label={day.short}
                accessibilityLabel={day.long}
                role="checkbox"
                selected={value.daysOfWeek.includes(day.value)}
                onPress={() =>
                  onChange({
                    ...value,
                    daysOfWeek: value.daysOfWeek.includes(day.value)
                      ? value.daysOfWeek.filter((item) => item !== day.value)
                      : [...value.daysOfWeek, day.value],
                  })
                }
              />
            ))}
          </View>
          {errors.days ? <Text style={error} accessibilityLiveRegion="polite">⚠ {errors.days}</Text> : null}
        </View>
      ) : null}

      {value.frequencyType === 'as_needed' ? (
        <Text style={[styles.group, { color: colors.textSecondary, fontSize: 14 * fontScale }]}>
          “Only when needed” medications are not counted in your daily progress.
        </Text>
      ) : (
        <View style={styles.group}>
          <Text style={label}>Times (required)</Text>
          <View style={styles.row}>
            {COMMON_TIMES.map((time) => (
              <ChoiceChip
                key={time}
                label={formatTime(time)}
                role="checkbox"
                selected={value.reminderTimes.includes(time)}
                onPress={() => toggleTime(time)}
              />
            ))}
          </View>

          <View style={styles.custom}>
            <View style={styles.customField}>
              <FormField
                label="Other time"
                value={customTime}
                onChangeText={(text) => {
                  setCustomTime(text);
                  if (customError) setCustomError(undefined);
                }}
                onSubmitEditing={addCustomTime}
                error={customError}
                placeholder="e.g. 7:30 AM"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
              />
            </View>
            <AccessibleButton label="Add time" icon="＋" onPress={addCustomTime} style={styles.addButton} />
          </View>

          {value.reminderTimes.filter((time) => !COMMON_TIMES.includes(time)).length > 0 ? (
            <View style={styles.row}>
              {value.reminderTimes
                .filter((time) => !COMMON_TIMES.includes(time))
                .map((time) => (
                  <AccessibleButton
                    key={time}
                    label={formatTime(time)}
                    icon="✕"
                    onPress={() => toggleTime(time)}
                    accessibilityLabel={`Remove ${formatTime(time)}`}
                  />
                ))}
            </View>
          ) : null}

          {errors.times ? <Text style={error} accessibilityLiveRegion="polite">⚠ {errors.times}</Text> : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { fontWeight: '700', marginTop: 8, marginBottom: 12 },
  label: { fontWeight: '700', marginBottom: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  group: { marginTop: 16 },
  custom: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 14, flexWrap: 'wrap' },
  customField: { flexGrow: 1, flexBasis: 180 },
  addButton: { marginTop: 26 },
  error: { marginTop: 6, fontWeight: '700' },
});
