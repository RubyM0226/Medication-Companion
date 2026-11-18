// Seven days of doses for History, built from the saved schedule and dose logs
// (the same records Today writes). weeksBack = 0 is the 7 days ending today.
// Reloads when the screen comes into view and whenever a dose is logged.
//
// Only current medicines are shown; removed ones keep their logs in the
// database but have no row here yet.

import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { getDoseLogsBetween, subscribeToDoseLogs } from '@/services/doseLogStore';
import { dateKey, Dose, dosesForDay } from '@/services/doseSchedule';
import { localMedications, Medication } from '@/services/medicationStore';

export type HistoryDay = { date: Date; key: string; doses: Dose<Medication>[] };

export type WeekHistoryState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; medications: Medication[]; days: HistoryDay[]; now: Date };

function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

export function useWeekHistory(weeksBack: number) {
  const [state, setState] = useState<WeekHistoryState>({ status: 'loading' });

  const load = useCallback(async () => {
    try {
      const now = new Date();
      const last = addDays(now, -7 * weeksBack);
      const first = addDays(last, -6);
      const medications = (await localMedications.list()).filter(
        (medication) => medication.schedule.frequencyType !== 'as_needed',
      );
      const logs = await getDoseLogsBetween(dateKey(first), dateKey(last));
      const days: HistoryDay[] = [];
      for (let offset = 0; offset < 7; offset++) {
        const date = addDays(first, offset);
        days.push({ date, key: dateKey(date), doses: dosesForDay(medications, logs, date, now) });
      }
      setState({ status: 'ready', medications, days, now });
    } catch {
      setState({ status: 'error' });
    }
  }, [weeksBack]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  useEffect(() => subscribeToDoseLogs(load), [load]);

  const retry = () => {
    setState({ status: 'loading' });
    load();
  };

  return { state, retry };
}
