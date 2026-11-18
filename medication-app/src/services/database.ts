// The on-device SQLite database for medications, schedules and dose logs.
// This is the single local source of truth for that data.
//
// FUTURE BACKEND: table and column names follow the Supabase tables on the
// medication-backend branch (medications, medication_schedules,
// medication_logs) so syncing can map them directly. dose_logs adds a status
// column, which the backend table does not have yet.
//
// CHANGES:
// - Added a separate SQLite database for each signed-in user
// - Added validation and an import guard to preserve unreadable legacy
//   data 
// - Legacy AsyncStorage data is removed only after a successful import.

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';

const LEGACY_MEDICATIONS_KEY = 'medications:v1';

let currentUserId: string | null = null;

const databases = new Map<
  string,
  Promise<SQLite.SQLiteDatabase>
>();

// Prevent simultaneous legacy imports into different accounts.
let legacyImportInProgress = false;

export function setDatabaseUser(userId: string | null) {
  currentUserId = userId;
}

export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!currentUserId) {
    return Promise.reject(
      new Error('Sign in to access your medications.'),
    );
  }

  const userId = currentUserId;
  const existing = databases.get(userId);

  if (existing) {
    return existing;
  }

  const opening = open(userId).catch((error) => {
    databases.delete(userId);
    throw error;
  });

  databases.set(userId, opening);
  return opening;
}

async function open(userId: string) {
  const filename = `medications-${encodeURIComponent(userId)}.db`;
  const db = await SQLite.openDatabaseAsync(filename);

  await db.execAsync(
    'PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;',
  );

  await migrate(db);

  // Do not automatically import accountless legacy data here.
  return db;
}

// Each entry upgrades the schema by one version.
// Append new migrations; do not edit migrations that have shipped.
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
    frequency_type TEXT NOT NULL CHECK (
      frequency_type IN ('daily', 'specific_days', 'as_needed')
    ),
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
    status TEXT NOT NULL CHECK (
      status IN ('taken', 'missed', 'skipped')
    ),
    logged_at TEXT NOT NULL,
    notes TEXT,
    UNIQUE (medication_id, scheduled_date, scheduled_time)
  );

  CREATE INDEX dose_logs_by_date ON dose_logs (scheduled_date);
  `,
];

async function migrate(db: SQLite.SQLiteDatabase) {
  const row = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version',
  );

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

function isLegacyMedication(value: unknown): value is LegacyMedication {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const med = value as Record<string, unknown>;

  const optionalTextFields = [
    'effect',
    'instructions',
    'genericName',
    'fdaSetId',
    'createdAt',
  ];

  return (
    typeof med.id === 'string' &&
    med.id.length > 0 &&
    typeof med.name === 'string' &&
    med.name.trim().length > 0 &&
    typeof med.dosage === 'number' &&
    Number.isFinite(med.dosage) &&
    typeof med.dosageUnit === 'string' &&
    optionalTextFields.every(
      (field) => med[field] === undefined || typeof med[field] === 'string',
    ) &&
    (
      med.sideEffects === undefined ||
      (
        Array.isArray(med.sideEffects) &&
        med.sideEffects.every((effect) => typeof effect === 'string')
      )
    )
  );
}

// Use this to decide whether to offer a legacy import prompt.
export async function hasLegacyMedications(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(LEGACY_MEDICATIONS_KEY);
  return raw !== null;
}

// Call ONLY after the user confirms that the older device data
// belongs to their currently signed-in account.
//
// Pass the user ID shown in the confirmation prompt so an account
// switch cannot silently redirect the import to another account.
export async function importLegacyMedications(
  confirmedUserId: string,
): Promise<void> {
  if (!currentUserId || currentUserId !== confirmedUserId) {
    throw new Error('Your account changed. Confirm the import again.');
  }

  if (legacyImportInProgress) {
    throw new Error('An import is already in progress.');
  }

  legacyImportInProgress = true;

  try {
    // Capture the database for the confirmed account before awaiting.
    const databasePromise = getDatabase();
    const db = await databasePromise;

    const raw = await AsyncStorage.getItem(LEGACY_MEDICATIONS_KEY);

    if (raw === null) {
      return;
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error(
        'The older medication data could not be read. It has not been deleted.',
      );
    }

    if (
      !Array.isArray(parsed) ||
      !parsed.every(isLegacyMedication)
    ) {
      throw new Error(
        'The older medication data has an unexpected format. It has not been deleted.',
      );
    }

    const legacy: LegacyMedication[] = parsed;

    if (currentUserId !== confirmedUserId) {
      throw new Error('Your account changed. Confirm the import again.');
    }

    await db.withExclusiveTransactionAsync(async (txn) => {
      for (const med of legacy) {
        const createdAt = med.createdAt ?? new Date().toISOString();

        await txn.runAsync(
          `INSERT OR IGNORE INTO medications
            (
              id,
              name,
              dosage,
              dosage_unit,
              effect,
              instructions,
              side_effects,
              generic_name,
              fda_set_id,
              created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          med.id,
          med.name,
          med.dosage,
          med.dosageUnit,
          med.effect ?? '',
          med.instructions ?? '',
          JSON.stringify(med.sideEffects ?? []),
          med.genericName ?? null,
          med.fdaSetId ?? null,
          createdAt,
        );

        // Legacy medications had no schedule.
        await txn.runAsync(
          `INSERT OR IGNORE INTO medication_schedules
            (
              id,
              medication_id,
              frequency_type,
              start_date
            )
            VALUES (?, ?, 'as_needed', ?)`,
          `${med.id}-schedule`,
          med.id,
          createdAt.slice(0, 10),
        );
      }
    });

    // Remove the old entry only after the SQLite transaction succeeds.
    await AsyncStorage.removeItem(LEGACY_MEDICATIONS_KEY);
  } finally {
    legacyImportInProgress = false;
  }
}

export function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}