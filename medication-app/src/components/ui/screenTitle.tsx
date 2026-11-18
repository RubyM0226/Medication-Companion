// The one title at the top of each tab screen. Tab screens hide the navigation
// header, so the title is not shown twice, and this leaves room for the
// phone's status bar. It scrolls with the page.

import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BodyText, Heading } from '@/components/ui/appText';

export function ScreenTitle({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 16 }]}>
      <Heading level="title">{title}</Heading>
      {subtitle ? <BodyText muted>{subtitle}</BodyText> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 4, marginBottom: 4 },
});
