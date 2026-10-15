// The user's medication list and schedules.
//
// FUTURE BACKEND: saved in the on-device SQLite database (see database.ts).
// A Supabase version of MedicationRepository can replace localMedications once
// the API has user accounts and a server URL. Screens only use the interface.

import { getDatabase, newId } from '@/services/database';
import { FrequencyType, MedicationSchedule } from '@/services/doseSchedule';

export type Medication = {
  id: string;
  name: string;
  dosage: number;
  dosageUnit: string;
  // What it is for.
  effect: string;
  instructions: string;
  sideEffects: string[];
  genericName?: string;
  // The FDA label it was added from, so its details can be opened again.
  fdaSetId?: string;
  createdAt: string;
  schedule: MedicationSchedule;
};

export type NewMedication = Omit<Medication, 'id' | 'createdAt'>;

export interface MedicationRepository {
  // Active medications only.
  list(): Promise<Medication[]>;
  add(medication: NewMedication): Promise<Medication>;
  // Archives rather than deletes, so past dose logs keep their medication.
  remove(id: string): Promise<void>;
}

type Row = {
  id: string;
  name: string;
  dosage: number;
  dosage_unit: string;
  effect: string;
  instructions: string;
  side_effects: string;
  generic_name: string | null;
  fda_set_id: string | null;
  created_at: string;
  frequency_type: FrequencyType | null;
  days_of_week: string | null;
  reminder_times: string | null;
  start_date: string | null;
  end_date: string | null;
};

function parseJsonArray<T>(value: string | null, isItem: (item: unknown) => item is T): T[] {
  try {
    const parsed: unknown = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed.filter(isItem) : [];
  } catch {
    return [];
  }
}

const isString = (item: unknown): item is string => typeof item === 'string';
const isNumber = (item: unknown): item is number => typeof item === 'number';

function fromRow(row: Row): Medication {
  return {
    id: row.id,
    name: row.name,
    dosage: row.dosage,
    dosageUnit: row.dosage_unit,
    effect: row.effect,
    instructions: row.instructions,
    sideEffects: parseJsonArray(row.side_effects, isString),
    genericName: row.generic_name ?? undefined,
    fdaSetId: row.fda_set_id ?? undefined,
    createdAt: row.created_at,
    schedule: {
      // A medication without a schedule row is treated as "when needed".
      frequencyType: row.frequency_type ?? 'as_needed',
      daysOfWeek: parseJsonArray(row.days_of_week, isNumber),
      reminderTimes: parseJsonArray(row.reminder_times, isString),
      startDate: row.start_date ?? row.created_at.slice(0, 10),
      endDate: row.end_date ?? undefined,
    },
  };
}

export const localMedications: MedicationRepository = {
  async list() {
    const db = await getDatabase();
    const rows = await db.getAllAsync<Row>(
      `SELECT m.*, s.frequency_type, s.days_of_week, s.reminder_times, s.start_date, s.end_date
         FROM medications m
         LEFT JOIN medication_schedules s ON s.medication_id = m.id
        WHERE m.archived_at IS NULL
        ORDER BY m.created_at`,
    );
    return rows.map(fromRow);
  },

  async add(medication) {
    const db = await getDatabase();
    const saved: Medication = { ...medication, id: newId(), createdAt: new Date().toISOString() };
    const { schedule } = saved;

    await db.withExclusiveTransactionAsync(async (txn) => {
      await txn.runAsync(
        `INSERT INTO medications
          (id, name, dosage, dosage_unit, effect, instructions, side_effects, generic_name, fda_set_id, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        saved.id,
        saved.name,
        saved.dosage,
        saved.dosageUnit,
        saved.effect,
        saved.instructions,
        JSON.stringify(saved.sideEffects),
        saved.genericName ?? null,
        saved.fdaSetId ?? null,
        saved.createdAt,
      );
      await txn.runAsync(
        `INSERT INTO medication_schedules
          (id, medication_id, frequency_type, days_of_week, reminder_times, start_date, end_date)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
        newId(),
        saved.id,
        schedule.frequencyType,
        JSON.stringify(schedule.daysOfWeek),
        JSON.stringify(schedule.reminderTimes),
        schedule.startDate,
        schedule.endDate ?? null,
      );
    });
    return saved;
  },

  async remove(id) {
    const db = await getDatabase();
    await db.runAsync('UPDATE medications SET archived_at = ? WHERE id = ?', new Date().toISOString(), id);
  },
};
