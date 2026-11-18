// One cell of the History grid: how one medicine went on one day, as a single
// mark plus words. A dose that was never logged is "Not logged", never
// assumed missed.

import { MedicationStatus } from '@/constants/colors';
import { Dose } from '@/services/doseSchedule';
import { Medication } from '@/services/medicationStore';

export type CellSummary = {
  // null: nothing was scheduled that day.
  mark: MedicationStatus | null;
  taken: number;
  total: number;
  words: string;
};

export function summarizeCell(doses: Dose<Medication>[], now: Date): CellSummary {
  const total = doses.length;
  if (total === 0) return { mark: null, taken: 0, total: 0, words: 'Nothing scheduled' };

  const taken = doses.filter((dose) => dose.status === 'taken').length;
  const missed = doses.filter((dose) => dose.status === 'missed').length;
  const skipped = doses.filter((dose) => dose.status === 'skipped').length;
  const notLogged = doses.filter((dose) => dose.status === 'pending' && dose.scheduledAt < now).length;
  const later = doses.filter((dose) => dose.status === 'pending' && dose.scheduledAt >= now).length;

  const parts = [`${taken} of ${total} taken`];
  if (missed) parts.push(`${missed} missed`);
  if (skipped) parts.push(`${skipped} skipped`);
  if (notLogged) parts.push(`${notLogged} not logged`);
  if (later) parts.push(`${later} still to come`);

  const mark: MedicationStatus =
    missed > 0 ? 'missed' : notLogged + later > 0 ? 'upcoming' : taken > 0 ? 'taken' : 'skipped';
  return { mark, taken, total, words: parts.join(', ') };
}

export function doseStatusWords(dose: Dose<Medication>, now: Date) {
  if (dose.status === 'taken') return 'Taken';
  if (dose.status === 'missed') return 'Missed';
  if (dose.status === 'skipped') return 'Skipped';
  return dose.scheduledAt < now ? 'Not logged' : 'Later';
}

export function doseMark(dose: Dose<Medication>): MedicationStatus {
  return dose.status === 'pending' ? 'upcoming' : dose.status;
}
