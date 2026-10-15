// Label section that opens and closes. Warnings get a rust border and a
// "Warning" tag so they stand out without relying on color.

import { ReactNode, useState } from 'react';
import { LayoutAnimation, Pressable, StyleSheet, Text, View } from 'react-native';

import { useSettings } from '@/context/settingsContext';

export function ExpandableSection({
  title,
  children,
  warning,
  initiallyOpen = false,
}: {
  title: string;
  children: ReactNode;
  warning?: boolean;
  initiallyOpen?: boolean;
}) {
  const { colors, fontScale, reduceMotion, touchTarget } = useSettings();
  const [open, setOpen] = useState(initiallyOpen);
  const border = warning ? colors.danger : colors.textPrimary;

  const toggle = () => {
    if (!reduceMotion) LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen(!open);
  };

  return (
    <View style={[styles.card, { borderColor: border, borderWidth: warning ? 2.5 : 1.5 }]}>
      <Pressable
        onPress={toggle}
        accessibilityRole="button"
        accessibilityLabel={warning ? `Warning: ${title}` : title}
        accessibilityHint={open ? 'Hides this section' : 'Shows this section'}
        accessibilityState={{ expanded: open }}
        style={({ pressed }) => [styles.header, { minHeight: touchTarget + 8 }, pressed && styles.pressed]}>
        <View style={styles.titleColumn}>
          {warning ? (
            <Text style={[styles.tag, { color: colors.danger, fontSize: 13 * fontScale }]}>⚠ WARNING</Text>
          ) : null}
          <Text style={[styles.title, { color: colors.textPrimary, fontSize: 18 * fontScale }]}>{title}</Text>
        </View>
        <Text style={[styles.toggle, { color: colors.textPrimary, fontSize: 15 * fontScale }]}>
          {open ? 'Hide ▴' : 'Show ▾'}
        </Text>
      </Pressable>
      {open ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, marginBottom: 12, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
  pressed: { opacity: 0.6 },
  titleColumn: { flex: 1, marginRight: 12 },
  tag: { fontWeight: '800', letterSpacing: 0.5 },
  title: { fontWeight: '700' },
  toggle: { fontWeight: '700' },
  body: { paddingHorizontal: 16, paddingBottom: 16, gap: 12 },
});
