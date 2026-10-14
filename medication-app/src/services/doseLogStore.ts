// Shared dose log service. Home writes doses here and History can read the
// same records, so both screens always agree.
//
// FUTURE BACKEND: maps to the Supabase medication_logs table, which still
// needs a status column for missed and skipped doses.

import { getDatabase, newId } from '@/services/database';
import { DoseLog, DoseStatus } from '@/services/doseSchedule';

export type NewDoseLog = {
  medicationId: string;
  scheduledDate: string;
  scheduledTime: string;
  status: DoseStatus;
  notes?: string;
};

export type LogDoseResult =
  | { saved: true; log: DoseLog }
  // This dose was already logged (for example, a double tap or another
  // screen). Nothing new was written.
  | { saved: false; existing: DoseLog };

export type DoseLogWithMedication = DoseLog & {
  medicationName: string;
  dosage: number;
  dosageUnit: string;
};

type Row = {
  id: string;
  medication_id: string;
  scheduled_date: string;
  scheduled_time: string;
  status: DoseStatus;
  logged_at: string;
  notes: string | null;
};

function fromRow(row: Row): DoseLog {
  return {
    id: row.id,
    medicationId: row.medication_id,
    scheduledDate: row.scheduled_date,
    scheduledTime: row.scheduled_time,
    status: row.status,
    loggedAt: row.logged_at,
    notes: row.notes ?? undefined,
  };
}

const listeners = new Set<() => void>();

// Called whenever a dose is logged, so open screens can refresh.
export function subscribeToDoseLogs(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export async function logDose(entry: NewDoseLog): Promise<LogDoseResult> {
  const db = await getDatabase();
  const log: DoseLog = { ...entry, id: newId(), loggedAt: new Date().toISOString() };

  // The UNIQUE (medication, date, time) constraint makes a second log of the
  // same dose a no-op instead of a duplicate.
  const result = await db.runAsync(
    `INSERT INTO dose_logs (id, medication_id, scheduled_date, scheduled_time, status, logged_at, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT (medication_id, scheduled_date, scheduled_time) DO NOTHING`,
    log.id,
    log.medicationId,
    log.scheduledDate,
    log.scheduledTime,
    log.status,
    log.loggedAt,
    log.notes ?? null,
  );

  if (result.changes === 0) {
    const existing = await db.getFirstAsync<Row>(
      'SELECT * FROM dose_logs WHERE medication_id = ? AND scheduled_date = ? AND scheduled_time = ?',
      entry.medicationId,
      entry.scheduledDate,
      entry.scheduledTime,
    );
    if (existing) return { saved: false, existing: fromRow(existing) };
  }

  listeners.forEach((listener) => listener());
  return { saved: true, log };
}

export async function getDoseLogsForDate(date: string): Promise<DoseLog[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<Row>('SELECT * FROM dose_logs WHERE scheduled_date = ?', date);
  return rows.map(fromRow);
}

// For History: logs between two dates (inclusive), newest first, with the
// medication's details even if it has since been removed.
export async function getDoseLogsBetween(from: string, to: string): Promise<DoseLogWithMedication[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<
    Row & { medication_name: string; dosage: number; dosage_unit: string }
  >(
    `SELECT l.*, m.name AS medication_name, m.dosage, m.dosage_unit
       FROM dose_logs l
       JOIN medications m ON m.id = l.medication_id
      WHERE l.scheduled_date BETWEEN ? AND ?
      ORDER BY l.scheduled_date DESC, l.scheduled_time DESC`,
    from,
    to,
  );
  return rows.map((row) => ({
    ...fromRow(row),
    medicationName: row.medication_name,
    dosage: row.dosage,
    dosageUnit: row.dosage_unit,
  }));
}
