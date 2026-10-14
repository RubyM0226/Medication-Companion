// Works out which doses are due on a day and how many have been logged.
// Pure functions with no storage or UI, so Home, History and reminders all
// count doses the same way.

export type FrequencyType = 'daily' | 'specific_days' | 'as_needed';

export type MedicationSchedule = {
  frequencyType: FrequencyType;
  // 0 = Sunday … 6 = Saturday. Used when frequencyType is 'specific_days'.
  daysOfWeek: number[];
  // 24-hour "HH:MM" times.
  reminderTimes: string[];
  // "YYYY-MM-DD", inclusive.
  startDate: string;
  endDate?: string;
};

export type DoseStatus = 'taken' | 'missed' | 'skipped';

export type DoseLog = {
  id: string;
  medicationId: string;
  scheduledDate: string;
  scheduledTime: string;
  status: DoseStatus;
  loggedAt: string;
  notes?: string;
};

export type ScheduledMedication = {
  id: string;
  name: string;
  dosage: number;
  dosageUnit: string;
  instructions: string;
  schedule: MedicationSchedule;
};

export type Dose<M extends ScheduledMedication = ScheduledMedication> = {
  // Stable per medication, day and time.
  key: string;
  medication: M;
  scheduledDate: string;
  scheduledTime: string;
  scheduledAt: Date;
  // 'pending' means not logged yet. It is never assumed to be missed.
  status: DoseStatus | 'pending';
  // Pending and its time has passed.
  isLate: boolean;
  log?: DoseLog;
};

export type DaySummary<M extends ScheduledMedication = ScheduledMedication> = {
  total: number;
  taken: number;
  missed: number;
  skipped: number;
  pending: number;
  // null when nothing is scheduled, so there is no divide by zero.
  percentTaken: number | null;
  // The earliest dose still to log, including ones past their time.
  next?: Dose<M>;
};

export function dateKey(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function isValidTime(time: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
}

export function isScheduledOn(schedule: MedicationSchedule, date: Date) {
  const key = dateKey(date);
  if (key < schedule.startDate) return false;
  if (schedule.endDate && key > schedule.endDate) return false;
  if (schedule.frequencyType === 'daily') return true;
  if (schedule.frequencyType === 'specific_days') return schedule.daysOfWeek.includes(date.getDay());
  return false;
}

export function dosesForDay<M extends ScheduledMedication>(
  medications: M[],
  logs: DoseLog[],
  date: Date,
  now: Date,
): Dose<M>[] {
  const day = dateKey(date);
  const logByKey = new Map(
    logs
      .filter((log) => log.scheduledDate === day)
      .map((log) => [`${log.medicationId}|${log.scheduledTime}`, log]),
  );

  const doses: Dose<M>[] = [];
  for (const medication of medications) {
    if (!isScheduledOn(medication.schedule, date)) continue;
    // The same time listed twice is one dose, not two.
    const times = [...new Set(medication.schedule.reminderTimes.filter(isValidTime))];
    for (const time of times) {
      const [hours, minutes] = time.split(':').map(Number);
      const scheduledAt = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes);
      const log = logByKey.get(`${medication.id}|${time}`);
      const status = log?.status ?? 'pending';
      doses.push({
        key: `${medication.id}|${day}|${time}`,
        medication,
        scheduledDate: day,
        scheduledTime: time,
        scheduledAt,
        status,
        isLate: status === 'pending' && scheduledAt.getTime() < now.getTime(),
        log,
      });
    }
  }

  return doses.sort(
    (a, b) =>
      a.scheduledAt.getTime() - b.scheduledAt.getTime() ||
      a.medication.name.localeCompare(b.medication.name),
  );
}

export function summarizeDay<M extends ScheduledMedication>(doses: Dose<M>[]): DaySummary<M> {
  const count = (status: Dose['status']) => doses.filter((dose) => dose.status === status).length;
  const taken = count('taken');
  return {
    total: doses.length,
    taken,
    missed: count('missed'),
    skipped: count('skipped'),
    pending: count('pending'),
    percentTaken: doses.length === 0 ? null : Math.round((taken / doses.length) * 100),
    next: doses.find((dose) => dose.status === 'pending'),
  };
}

// "20:30" -> "8:30 PM" in the phone's locale.
export function formatTime(time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

// Accepts "8", "8:30", "8:30 pm", "8pm", "20:30". Returns "HH:MM" or null.
export function parseTime(input: string): string | null {
  const match = input
    .trim()
    .toLowerCase()
    .match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?$/);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2] ?? 0);
  const period = match[3]?.replace(/\./g, '');
  if (minutes > 59) return null;
  if (period) {
    if (hours < 1 || hours > 12) return null;
    if (period === 'pm' && hours !== 12) hours += 12;
    if (period === 'am' && hours === 12) hours = 0;
  } else if (hours > 23) {
    return null;
  }
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function describeSchedule(schedule: MedicationSchedule) {
  const times = [...schedule.reminderTimes].sort().map(formatTime).join(', ');
  if (schedule.frequencyType === 'as_needed') return 'Only when needed';
  const days =
    schedule.frequencyType === 'daily'
      ? 'Every day'
      : [...schedule.daysOfWeek].sort().map((day) => DAY_NAMES[day]).join(', ');
  return times ? `${days} at ${times}` : days;
}
