// Recent Lookup searches, kept only on this device.

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'lookup:recentSearches:v1';
const MAX_RECENT = 6;

export async function loadRecentSearches(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const saved: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(saved) ? saved.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

// Moves the query to the front and returns the updated list.
export async function addRecentSearch(query: string): Promise<string[]> {
  const trimmed = query.trim();
  const current = await loadRecentSearches();
  const next = [trimmed, ...current.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())]
    .slice(0, MAX_RECENT);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  return next;
}

export async function clearRecentSearches() {
  await AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
}
