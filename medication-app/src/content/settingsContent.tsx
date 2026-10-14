// Static content for the Settings screen. Labels live here so copy can be
// changed (or translated later) without touching layout code.

export type ToggleSettingKey =
  | 'highContrast'
  | 'reduceMotion'
  | 'readRemindersAloud'
  | 'vibrateReminders'
  | 'reminderSound';

export type ToggleSetting = {
  key: ToggleSettingKey;
  icon: string;
  label: string;
  hint: string;
};

export type SettingsSection = {
  title: string;
  toggles: ToggleSetting[];
};

export const FONT_SCALES = [0.9, 1, 1.15, 1.3, 1.5] as const;
export const DEFAULT_FONT_SCALE_INDEX = 1;

export const DEFAULT_TOGGLES: Record<ToggleSettingKey, boolean> = {
  highContrast: false,
  reduceMotion: false,
  readRemindersAloud: false,
  vibrateReminders: true,
  reminderSound: true,
};

export const SettingsSections: SettingsSection[] = [
  {
    title: 'Appearance',
    toggles: [
      {
        key: 'highContrast',
        icon: '◐',
        label: 'High contrast',
        hint: 'Uses stronger colors that are easier to see',
      },
      {
        key: 'reduceMotion',
        icon: '◎',
        label: 'Block blinking and animations',
        hint: 'Turns off moving and flashing effects',
      },
    ],
  },
  {
    title: 'Speech',
    toggles: [
      {
        key: 'readRemindersAloud',
        icon: '🔊',
        label: 'Read reminders aloud',
        hint: 'Speaks the medication name and dose when a reminder appears',
      },
    ],
  },
  {
    title: 'Reminders',
    toggles: [
      {
        key: 'vibrateReminders',
        icon: '📳',
        label: 'Vibrate',
        hint: 'Vibrates the phone when a dose is due',
      },
      {
        key: 'reminderSound',
        icon: '🔔',
        label: 'Play sound',
        hint: 'Plays a sound when a dose is due',
      },
    ],
  },
];
