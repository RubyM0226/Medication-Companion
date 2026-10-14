// Static content for the Settings screen. Labels live here so copy can be
// changed (or translated later) without touching layout code.

export type ToggleSettingKey =
  | 'highContrast'
  | 'reduceMotion'
  | 'colorBlindFriendly'
  | 'plainLanguage'
  | 'readRemindersAloud'
  | 'largeTouchTargets'
  | 'visualAlerts'
  | 'vibrateReminders'
  | 'reminderSound';

export type ThemeMode = 'system' | 'light' | 'dark';

export type ToggleSetting = {
  type: 'toggle';
  key: ToggleSettingKey;
  icon: string;
  label: string;
  hint: string;
  // Shown under the label when the setting is saved now but only takes effect
  // once another part of the app (or a backend) exists.
  pendingNote?: string;
};

// Rows that need their own control rather than a switch.
export type CustomSetting = {
  type: 'fontSize' | 'theme' | 'statusPreview' | 'mascot' | 'caregiver' | 'language' | 'reset';
};

export type SettingItem = ToggleSetting | CustomSetting;

export type SettingsSection = {
  title: string;
  items: SettingItem[];
};

export const FONT_SCALES = [0.9, 1, 1.15, 1.3, 1.5] as const;
export const DEFAULT_FONT_SCALE_INDEX = 1;

export const DEFAULT_THEME_MODE: ThemeMode = 'system';

export const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

// Minimum touch target in points. 48 meets WCAG 2.2 target size with room to
// spare; the larger option is for tremors or limited dexterity.
export const TOUCH_TARGET = 48;
export const LARGE_TOUCH_TARGET = 64;

export const DEFAULT_TOGGLES: Record<ToggleSettingKey, boolean> = {
  highContrast: false,
  reduceMotion: false,
  colorBlindFriendly: false,
  plainLanguage: true,
  readRemindersAloud: false,
  largeTouchTargets: false,
  visualAlerts: true,
  vibrateReminders: true,
  reminderSound: true,
};

const REMINDERS_PENDING = 'Saved now. Takes effect once dose reminders are added to the app.';

export const SettingsSections: SettingsSection[] = [
  {
    title: 'Visual Accessibility',
    items: [
      { type: 'fontSize' },
      { type: 'theme' },
      {
        type: 'toggle',
        key: 'highContrast',
        icon: '◐',
        label: 'High contrast',
        hint: 'Uses black, white and strong colors that are easier to see. Works with light and dark themes.',
      },
      {
        type: 'toggle',
        key: 'colorBlindFriendly',
        icon: '◈',
        label: 'Color-blind-friendly indicators',
        hint: 'Uses blue and orange with different border styles for medication status',
      },
      { type: 'statusPreview' },
      {
        type: 'toggle',
        key: 'reduceMotion',
        icon: '◎',
        label: 'Reduce motion',
        hint: 'Turns off sliding screen transitions and other moving effects',
      },
    ],
  },
  {
    title: 'Reading & Comprehension',
    items: [
      {
        type: 'toggle',
        key: 'plainLanguage',
        icon: '💬',
        label: 'Plain-language explanations',
        hint: 'Explains medicines in everyday words instead of medical terms',
        // FUTURE BACKEND: explanations come from the raia AI agent, which is
        // not connected yet (see src/services/plainLanguage.ts).
        pendingNote: 'Lookup will show simple explanations once our AI assistant is connected.',
      },
      {
        type: 'toggle',
        key: 'readRemindersAloud',
        icon: '🔊',
        label: 'Read reminders aloud',
        hint: 'Speaks the medication name and dose when a reminder appears',
        pendingNote: REMINDERS_PENDING,
      },
    ],
  },
  {
    title: 'Motor Accessibility',
    items: [
      {
        type: 'toggle',
        key: 'largeTouchTargets',
        icon: '☝',
        label: 'Larger touch targets',
        hint: 'Makes buttons and switches bigger and easier to tap',
      },
    ],
  },
  {
    title: 'Hearing Accessibility',
    items: [
      {
        type: 'toggle',
        key: 'visualAlerts',
        icon: '💡',
        label: 'Visual reminder alerts',
        hint: 'Shows a large on-screen banner when a dose is due',
        pendingNote: REMINDERS_PENDING,
      },
      {
        type: 'toggle',
        key: 'vibrateReminders',
        icon: '📳',
        label: 'Vibrate',
        hint: 'Vibrates the phone when a dose is due',
        pendingNote: REMINDERS_PENDING,
      },
      {
        type: 'toggle',
        key: 'reminderSound',
        icon: '🔔',
        label: 'Play sound',
        hint: 'Plays a sound when a dose is due',
        pendingNote: REMINDERS_PENDING,
      },
    ],
  },
  {
    title: 'Caregiver & Preferences',
    items: [{ type: 'mascot' }, { type: 'caregiver' }, { type: 'language' }, { type: 'reset' }],
  },
];
