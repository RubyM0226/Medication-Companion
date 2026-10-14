// Today's scheduled doses, progress and the last 7 days, for Home. Reloads
// when the screen comes into view, when any screen logs a dose, and once a
// minute so "late" labels and the date stay current.

import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { getDoseLogsBetween, subscribeToDoseLogs } from '@/services/doseLogStore';
import { dateKey, Dose, DaySummary, dosesForDay, summarizeDay } from '@/services/doseSchedule';
import { localMedications, Medication } from '@/services/medicationStore';

export type WeekSummary = { taken: number; total: number };

export type TodayState =
  | { status: 'loading' }
  | { status: 'error' }
  | {
      status: 'ready';
      medications: Medication[];
      doses: Dose<Medication>[];
      summary: DaySummary<Medication>;
      // The 7 days before today. Today is left out so doses still to come
      // do not count against it.
      week: WeekSummary;
    };

function daysAgo(now: Date, days: number) {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - days);
}

export function useTodayDoses() {
  const [state, setState] = useState<TodayState>({ status: 'loading' });
  const [now, setNow] = useState(() => new Date());

  const load = useCallback(async () => {
    try {
      const current = new Date();
      const medications = await localMedications.list();
      const logs = await getDoseLogsBetween(dateKey(daysAgo(current, 7)), dateKey(current));

      const doses = dosesForDay(medications, logs, current, current);
      const week = { taken: 0, total: 0 };
      for (let offset = 1; offset <= 7; offset++) {
        const day = summarizeDay(dosesForDay(medications, logs, daysAgo(current, offset), current));
        week.taken += day.taken;
        week.total += day.total;
      }

      setNow(current);
      setState({ status: 'ready', medications, doses, summary: summarizeDay(doses), week });
    } catch {
      setState({ status: 'error' });
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
      const timer = setInterval(load, 60 * 1000);
      return () => clearInterval(timer);
    }, [load]),
  );

  useEffect(() => subscribeToDoseLogs(load), [load]);

  const retry = () => {
    setState({ status: 'loading' });
    load();
  };

  return { state, now, retry, reload: load };
}
