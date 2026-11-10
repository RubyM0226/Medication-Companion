// Pieces shared by Log in and Sign up: the intro, the show-password switch,
// the privacy note and the inline message. Messages appear on the screen
// (and are announced) instead of in pop-ups, which do not work on web.

import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ChoiceChip } from '@/components/choiceChip';
import { BodyText, Heading } from '@/components/ui/appText';
import { Card } from '@/components/ui/card';
import { useSettings } from '@/context/settingsContext';

export function AuthIntro() {
  const { colors } = useSettings();
  return (
    <View style={styles.intro}>
      <Heading level="heading" style={{ color: colors.primary }}>
        A calmer way to stay on track.
      </Heading>
      <BodyText muted>Clear reminders, plain-language facts, and support without judgment.</BodyText>
    </View>
  );
}

export function ShowPasswordToggle({ shown, onChange }: { shown: boolean; onChange: (shown: boolean) => void }) {
  return (
    <View style={styles.toggle}>
      <ChoiceChip role="checkbox" label="Show password" selected={shown} onPress={() => onChange(!shown)} />
    </View>
  );
}

export type AuthMessage = { kind: 'error' | 'info'; text: string };

export function AuthMessageText({ message }: { message?: AuthMessage }) {
  const { colors } = useSettings();
  if (!message) return null;
  return (
    <BodyText
      bold
      color={message.kind === 'error' ? colors.danger : colors.textPrimary}
      accessibilityLiveRegion="polite"
      accessibilityRole={message.kind === 'error' ? 'alert' : undefined}>
      {message.text}
    </BodyText>
  );
}

export function PrivacyNote() {
  return (
    <Card style={styles.privacy}>
      <BodyText bold>Your privacy</BodyText>
      <BodyText size="meta">
        Your medication information is encrypted. You control what is shared and with whom.
      </BodyText>
    </Card>
  );
}

export function AuthSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Heading level="section">{title}</Heading>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  intro: { gap: 8, marginBottom: 8 },
  toggle: { flexDirection: 'row', marginTop: -6, marginBottom: 12 },
  privacy: { gap: 4, marginTop: 12 },
  section: { gap: 4 },
});
