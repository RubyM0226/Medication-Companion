// App-wide accessibility settings. Loaded from and saved to device storage so
// they survive restarts. Screens read colors and text size from useSettings().

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { Colors, ThemeColors } from '@/constants/colors';
import { HighContrastColors } from '@/constants/highContrastColors';
import {
  DEFAULT_FONT_SCALE_INDEX,
  DEFAULT_TOGGLES,
  FONT_SCALES,
  ToggleSettingKey,
} from '@/content/settingsContent';

const STORAGE_KEY = 'settings:v1';

type StoredSettings = {
  toggles: Record<ToggleSettingKey, boolean>;
  fontScaleIndex: number;
};

type SettingsContextValue = StoredSettings & {
  setToggle: (key: ToggleSettingKey, value: boolean) => void;
  setFontScaleIndex: (index: number) => void;
  fontScale: number;
  colors: ThemeColors;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

const DEFAULT_SETTINGS: StoredSettings = {
  toggles: DEFAULT_TOGGLES,
  fontScaleIndex: DEFAULT_FONT_SCALE_INDEX,
};

function clampFontScaleIndex(index: number) {
  return Math.min(FONT_SCALES.length - 1, Math.max(0, Math.round(index)));
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<StoredSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const saved = JSON.parse(raw) as Partial<StoredSettings>;
        // Merge with defaults so toggles added in later versions get a value.
        setSettings({
          toggles: { ...DEFAULT_TOGGLES, ...saved.toggles },
          fontScaleIndex: clampFontScaleIndex(saved.fontScaleIndex ?? DEFAULT_FONT_SCALE_INDEX),
        });
      })
      .catch(() => {
        // Unreadable storage falls back to defaults.
      })
      .finally(() => setLoaded(true));
  }, []);

  const update = (next: StoredSettings) => {
    setSettings(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  };

  // Avoid flashing the default theme before saved settings are applied.
  if (!loaded) return null;

  const value: SettingsContextValue = {
    ...settings,
    setToggle: (key, on) => update({ ...settings, toggles: { ...settings.toggles, [key]: on } }),
    setFontScaleIndex: (index) =>
      update({ ...settings, fontScaleIndex: clampFontScaleIndex(index) }),
    fontScale: FONT_SCALES[settings.fontScaleIndex],
    colors: settings.toggles.highContrast ? HighContrastColors : Colors,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const value = useContext(SettingsContext);
  if (!value) throw new Error('useSettings must be used inside SettingsProvider');
  return value;
}
