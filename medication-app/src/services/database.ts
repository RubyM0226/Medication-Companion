// The on-device SQLite database for medications, schedules and dose logs.
// This is the single local source of truth for that data.
//
// FUTURE BACKEND: table and column names follow the Supabase tables on the
// medication-backend branch (medications, medication_schedules,
// medication_logs) so syncing can map them directly. dose_logs adds a status
// column, which the backend table does not have yet.

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'medication-companion.db';
// Where medications were kept before SQLite. Moved over once, then removed.
const LEGACY_MEDICATIONS_KEY = 'medications:v1';

let opening: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDatabase() {
  opening ??= open().catch((error) => {
    // Let the next call try again instead of caching the failure.
    opening = null;
    throw error;
  });
  return opening;
}

async function open() {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  await migrate(db);
  await importLegacyMedications(db);
  return db;
}

// Each entry upgrades the schema by one version. Append new entries; never
// edit ones that have shipped.
const MIGRATIONS = [
  `
  CREATE TABLE medications (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    dosage REAL NOT NULL,
    dosage_unit TEXT NOT NULL,
    effect TEXT NOT NULL DEFAULT '',
    instructions TEXT NOT NULL DEFAULT '',
    side_effects TEXT NOT NULL DEFAULT '[]',
    generic_name TEXT,
    fda_set_id TEXT,
    created_at TEXT NOT NULL,
    archived_at TEXT
  );
  CREATE TABLE medication_schedules (
    id TEXT PRIMARY KEY NOT NULL,
    medication_id TEXT NOT NULL UNIQUE REFERENCES medications(id),
    frequency_type TEXT NOT NULL CHECK (frequency_type IN ('daily', 'specific_days', 'as_needed')),
    days_of_week TEXT NOT NULL DEFAULT '[]',
    reminder_times TEXT NOT NULL DEFAULT '[]',
    start_date TEXT NOT NULL,
    end_date TEXT
  );
  CREATE TABLE dose_logs (
    id TEXT PRIMARY KEY NOT NULL,
    medication_id TEXT NOT NULL REFERENCES medications(id),
    scheduled_date TEXT NOT NULL,
    scheduled_time TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('taken', 'missed', 'skipped')),
    logged_at TEXT NOT NULL,
    notes TEXT,
    UNIQUE (medication_id, scheduled_date, scheduled_time)
  );
  CREATE INDEX dose_logs_by_date ON dose_logs (scheduled_date);
  `,
];

async function migrate(db: SQLite.SQLiteDatabase) {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const current = row?.user_version ?? 0;
  for (let version = current; version < MIGRATIONS.length; version++) {
    await db.withExclusiveTransactionAsync(async (txn) => {
      await txn.execAsync(MIGRATIONS[version]);
      await txn.execAsync(`PRAGMA user_version = ${version + 1}`);
    });
  }
}

type LegacyMedication = {
  id: string;
  name: string;
  dosage: number;
  dosageUnit: string;
  effect?: string;
  instructions?: string;
  sideEffects?: string[];
  genericName?: string;
  fdaSetId?: string;
  createdAt?: string;
};

// Medications saved before SQLite had no schedule, so they come over as
// "only when needed" and are not counted in daily progress until edited.
async function importLegacyMedications(db: SQLite.SQLiteDatabase) {
  const raw = await AsyncStorage.getItem(LEGACY_MEDICATIONS_KEY).catch(() => null);
  if (!raw) return;

  let legacy: LegacyMedication[] = [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) legacy = parsed as LegacyMedication[];
  } catch {
    // Unreadable; nothing to import.
  }

  await db.withExclusiveTransactionAsync(async (txn) => {
    for (const med of legacy) {
      if (!med?.id || !med.name) continue;
      const createdAt = med.createdAt ?? new Date().toISOString();
      await txn.runAsync(
        `INSERT OR IGNORE INTO medications
          (id, name, dosage, dosage_unit, effect, instructions, side_effects, generic_name, fda_set_id, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        med.id,
        med.name,
        Number(med.dosage) || 0,
        med.dosageUnit ?? '',
        med.effect ?? '',
        med.instructions ?? '',
        JSON.stringify(med.sideEffects ?? []),
        med.genericName ?? null,
        med.fdaSetId ?? null,
        createdAt,
      );
      await txn.runAsync(
        `INSERT OR IGNORE INTO medication_schedules
          (id, medication_id, frequency_type, start_date) VALUES (?, ?, 'as_needed', ?)`,
        `${med.id}-schedule`,
        med.id,
        createdAt.slice(0, 10),
      );
    }
  });
  // Only removed after the import committed, so nothing is lost on failure.
  await AsyncStorage.removeItem(LEGACY_MEDICATIONS_KEY).catch(() => {});
}

export function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
