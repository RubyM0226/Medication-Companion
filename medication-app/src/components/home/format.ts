// Wording shared by the Home cards.

import { Dose, formatTime } from '@/services/doseSchedule';
import { Medication } from '@/services/medicationStore';

export function doseAmount(medication: Pick<Medication, 'dosage' | 'dosageUnit'>) {
  return medication.dosage > 0 && medication.dosageUnit
    ? `${medication.dosage} ${medication.dosageUnit}`
    : 'Dose not set';
}

// "in 42 min", "in 2 hr 5 min", "25 min late".
export function timeFromNow(target: Date, now: Date) {
  const minutes = Math.round((target.getTime() - now.getTime()) / 60000);
  const absolute = Math.abs(minutes);
  const hours = Math.floor(absolute / 60);
  const rest = absolute % 60;
  const span = hours > 0 ? `${hours} hr${rest ? ` ${rest} min` : ''}` : `${rest} min`;
  if (minutes > 0) return `in ${span}`;
  if (minutes === 0) return 'now';
  return `${span} late`;
}

export function statusLabel(dose: Dose) {
  if (dose.status === 'pending') return dose.isLate ? 'Pending · late' : 'Pending';
  return { taken: 'Taken', missed: 'Missed', skipped: 'Skipped' }[dose.status];
}

export function doseSentence(dose: Dose<Medication>) {
  return `${dose.medication.name}, ${doseAmount(dose.medication)}, at ${formatTime(dose.scheduledTime)}`;
}
