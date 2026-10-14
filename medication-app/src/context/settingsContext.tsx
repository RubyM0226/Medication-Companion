// App-wide accessibility settings. Loaded from and saved to device storage so
// they survive restarts. Screens read colors and text size from useSettings().

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { AccessibilityInfo, useColorScheme } from 'react-native';

import { Colors, ThemeColors } from '@/constants/colors';
import { DarkColors } from '@/constants/darkColors';
import { HighContrastDarkColors, HighContrastLightColors } from '@/constants/highContrastColors';
import { DEFAULT_MASCOT, isMascotChoice, MascotChoice } from '@/constants/mascots';
import {
  DEFAULT_FONT_SCALE_INDEX,
  DEFAULT_THEME_MODE,
  DEFAULT_TOGGLES,
  FONT_SCALES,
  LARGE_TOUCH_TARGET,
  THEME_OPTIONS,
  ThemeMode,
  TOUCH_TARGET,
  ToggleSettingKey,
} from '@/content/settingsContent';

const STORAGE_KEY = 'settings:v1';

type StoredSettings = {
  toggles: Record<ToggleSettingKey, boolean>;
  fontScaleIndex: number;
  themeMode: ThemeMode;
  mascot: MascotChoice;
};

type SettingsContextValue = StoredSettings & {
  setToggle: (key: ToggleSettingKey, value: boolean) => void;
  setFontScaleIndex: (index: number) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setMascot: (mascot: MascotChoice) => void;
  resetToDefaults: () => void;
  fontScale: number;
  colors: ThemeColors;
  // True when the dark theme is showing (for the status bar).
  isDark: boolean;
  // The user's toggle or the device's Reduce Motion setting.
  reduceMotion: boolean;
  systemReduceMotion: boolean;
  // Minimum width and height for anything tappable.
  touchTarget: number;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

const DEFAULT_SETTINGS: StoredSettings = {
  toggles: DEFAULT_TOGGLES,
  fontScaleIndex: DEFAULT_FONT_SCALE_INDEX,
  themeMode: DEFAULT_THEME_MODE,
  mascot: DEFAULT_MASCOT,
};

function clampFontScaleIndex(index: number) {
  return Math.min(FONT_SCALES.length - 1, Math.max(0, Math.round(index)));
}

// Merge with defaults, dropping keys from settings that no longer exist so
// they are not saved again.
function pickKnownToggles(saved: Partial<Record<string, boolean>> | undefined) {
  const toggles = { ...DEFAULT_TOGGLES };
  for (const key of Object.keys(toggles) as ToggleSettingKey[]) {
    if (typeof saved?.[key] === 'boolean') toggles[key] = saved[key];
  }
  return toggles;
}

function isThemeMode(value: unknown): value is ThemeMode {
  return THEME_OPTIONS.some((option) => option.value === value);
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<StoredSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  const [systemReduceMotion, setSystemReduceMotion] = useState(false);
  const systemScheme = useColorScheme();

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const saved = JSON.parse(raw) as Partial<StoredSettings>;
        // Merge with defaults so settings added in later versions get a value.
        setSettings({
          toggles: pickKnownToggles(saved.toggles),
          fontScaleIndex: clampFontScaleIndex(saved.fontScaleIndex ?? DEFAULT_FONT_SCALE_INDEX),
          themeMode: isThemeMode(saved.themeMode) ? saved.themeMode : DEFAULT_THEME_MODE,
          mascot: isMascotChoice(saved.mascot) ? saved.mascot : DEFAULT_MASCOT,
        });
      })
      .catch(() => {
        // Unreadable storage falls back to defaults.
      })
      .finally(() => setLoaded(true));
  }, []);

  // Save after every change. Waiting for the load keeps defaults from
  // overwriting saved settings on startup.
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings)).catch(() => {});
  }, [settings, loaded]);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setSystemReduceMotion).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setSystemReduceMotion,
    );
    return () => subscription.remove();
  }, []);

  // Avoid flashing the default theme before saved settings are applied.
  if (!loaded) return null;

  const { toggles, themeMode } = settings;
  const darkMode = themeMode === 'dark' || (themeMode === 'system' && systemScheme === 'dark');

  const value: SettingsContextValue = {
    ...settings,
    // Functional updates so quick successive changes are not lost.
    setToggle: (key, on) =>
      setSettings((prev) => ({ ...prev, toggles: { ...prev.toggles, [key]: on } })),
    setFontScaleIndex: (index) =>
      setSettings((prev) => ({ ...prev, fontScaleIndex: clampFontScaleIndex(index) })),
    setThemeMode: (mode) => setSettings((prev) => ({ ...prev, themeMode: mode })),
    setMascot: (mascot) => setSettings((prev) => ({ ...prev, mascot })),
    resetToDefaults: () => setSettings(DEFAULT_SETTINGS),
    fontScale: FONT_SCALES[settings.fontScaleIndex],
    // High contrast keeps the light or dark choice and strengthens it.
    colors: toggles.highContrast
      ? darkMode
        ? HighContrastDarkColors
        : HighContrastLightColors
      : darkMode
        ? DarkColors
        : Colors,
    isDark: darkMode,
    reduceMotion: toggles.reduceMotion || systemReduceMotion,
    systemReduceMotion,
    touchTarget: toggles.largeTouchTargets ? LARGE_TOUCH_TARGET : TOUCH_TARGET,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const value = useContext(SettingsContext);
  if (!value) throw new Error('useSettings must be used inside SettingsProvider');
  return value;
}
