// Adds sign-out through the auth context, with loading and error feedback.
// The protected root layout returns signed-out users to the welcome screen.

import { useState } from 'react';
import {
  AccessibilityInfo,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  Vibration,
  View,
} from 'react-native';

import { ComingSoonCard } from '@/components/comingSoonCard';
import { FontSizeControl } from '@/components/settings/fontSizeControl';
import { MascotPicker } from '@/components/settings/mascotPicker';
import { SettingCard } from '@/components/settings/settingCard';
import { SettingText } from '@/components/settings/settingText';
import { SettingToggleRow } from '@/components/settings/settingToggleRow';
import { ThemePicker } from '@/components/settings/themePicker';
import { StatusBadge } from '@/components/statusBadge';
import { MedicationStatus } from '@/constants/colors';
import { SettingItem, SettingsSections } from '@/content/settingsContent';
import { useAuth } from '@/context/authContext';
import { useSettings } from '@/context/settingsContext';

const PREVIEW_STATUSES: MedicationStatus[] = [
  'taken',
  'missed',
  'upcoming',
  'skipped',
];

export default function SettingsScreen() {
  const {
    colors,
    fontScale: scale,
    systemReduceMotion,
    resetToDefaults,
    touchTarget,
  } = useSettings();

  const { signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');

  const text = { color: colors.textPrimary };

  async function handleSignOut() {
    if (signingOut) return;

    setSigningOut(true);
    setLogoutError('');

    try {
      await signOut();
    } catch (error) {
      setLogoutError(
        error instanceof Error
          ? error.message
          : 'Unable to sign out. Please try again.',
      );
    } finally {
      setSigningOut(false);
    }
  }

  const confirmReset = () => {
    const reset = () => {
      resetToDefaults();
      AccessibilityInfo.announceForAccessibility(
        'Settings reset to defaults',
      );
    };

    const message =
      'Text size, theme, mascot and every accessibility setting will go back to the default.';

    // Alert buttons are not supported on web.
    if (Platform.OS === 'web') {
      if (window.confirm(message)) reset();
      return;
    }

    Alert.alert('Reset to defaults?', message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: reset },
    ]);
  };

  const renderItem = (item: SettingItem) => {
    switch (item.type) {
      case 'toggle':
        return (
          <SettingToggleRow
            key={item.key}
            setting={
              item.key === 'reduceMotion' && systemReduceMotion
                ? {
                    ...item,
                    pendingNote:
                      'Your phone’s Reduce Motion is on, so motion stays reduced.',
                  }
                : item
            }
            onChange={
              item.key === 'vibrateReminders'
                ? (on) => {
                    if (on) Vibration.vibrate();
                  }
                : undefined
            }
          />
        );

      case 'fontSize':
        return <FontSizeControl key="fontSize" />;

      case 'theme':
        return <ThemePicker key="theme" />;

      case 'statusPreview':
        return (
          <SettingCard key="statusPreview">
            <Text
              style={[
                styles.previewLabel,
                text,
                { fontSize: 16 * scale },
              ]}>
              Status preview
            </Text>

            <View style={styles.badges}>
              {PREVIEW_STATUSES.map((status) => (
                <StatusBadge key={status} status={status} />
              ))}
            </View>
          </SettingCard>
        );

      case 'mascot':
        return <MascotPicker key="mascot" />;

      case 'caregiver':
        return (
          <ComingSoonCard
            key="caregiver"
            icon="👥"
            label="Caregiver sharing"
            note="Caregiver sharing and secure syncing are not connected yet."
          />
        );

      case 'language':
        return (
          <View
            key="language"
            accessible
            accessibilityLabel="Language, English. Only English is available right now">
            <SettingCard style={styles.rowCard}>
              <SettingText
                icon="🌐"
                label="Language: English"
                note="More languages coming later."
              />
            </SettingCard>
          </View>
        );

      case 'reset':
        return (
          <Pressable
            key="reset"
            onPress={confirmReset}
            accessibilityRole="button"
            accessibilityLabel="Reset to defaults"
            accessibilityHint="Asks before resetting text size, theme and accessibility settings"
            style={({ pressed }) => [
              styles.resetButton,
              {
                borderColor: colors.danger,
                minHeight: touchTarget + 8,
              },
              pressed && styles.pressed,
            ]}>
            <Text
              style={[
                styles.resetText,
                {
                  color: colors.danger,
                  fontSize: 18 * scale,
                },
              ]}>
              ↺ Reset to defaults
            </Text>
          </Pressable>
        );
    }
  };

  return (
    <ScrollView
      style={[
        styles.screen,
        { backgroundColor: colors.background },
      ]}
      contentContainerStyle={styles.content}>
      <View style={styles.column}>
        <Text
          style={[
            styles.title,
            text,
            { fontSize: 32 * scale },
          ]}
          accessibilityRole="header">
          Accessibility
        </Text>

        <Text
          style={{
            color: colors.textSecondary,
            fontSize: 16 * scale,
          }}>
          Changes save automatically and apply across the app.
        </Text>

        {SettingsSections.map((section) => (
          <View key={section.title}>
            <Text
              style={[
                styles.sectionTitle,
                text,
                { fontSize: 22 * scale },
              ]}
              accessibilityRole="header">
              {section.title}
            </Text>

            {section.items.map(renderItem)}
          </View>
        ))}

        <Text
          style={[
            styles.sectionTitle,
            text,
            { fontSize: 22 * scale },
          ]}
          accessibilityRole="header">
          Account
        </Text>

        {logoutError ? (
          <Text
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
            style={{
              color: colors.danger,
              fontSize: 16 * scale,
              marginBottom: 8,
            }}>
            {logoutError}
          </Text>
        ) : null}

        <Pressable
          onPress={handleSignOut}
          disabled={signingOut}
          accessibilityRole="button"
          accessibilityState={{
            disabled: signingOut,
            busy: signingOut,
          }}
          style={({ pressed }) => [
            styles.resetButton,
            {
              borderColor: colors.primary,
              minHeight: touchTarget + 8,
            },
            (pressed || signingOut) && styles.pressed,
          ]}>
          <Text
            style={[
              styles.resetText,
              {
                color: colors.primary,
                fontSize: 18 * scale,
              },
            ]}>
            {signingOut ? 'Signing out…' : 'Sign out'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  column: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
  },
  title: {
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionTitle: {
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 10,
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewLabel: {
    fontWeight: '600',
    marginBottom: 10,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  resetButton: {
    marginTop: 8,
    borderWidth: 2,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  resetText: {
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.6,
  },
});