import { Tabs } from 'expo-router';
import { ColorValue, StyleSheet, View } from 'react-native';

import { AppIcon, IconName } from '@/components/appIcon';
import { Fonts } from '@/constants/typography';
import { useSettings } from '@/context/settingsContext';

// The active tab sits on a gold pill, uses a filled icon (where one exists) and
// a bold label, so it is never marked by color alone.
function tabIcon(icon: IconName, activeIcon: IconName = icon) {
  function TabIcon({ color, focused }: { color: ColorValue; focused: boolean }) {
    const { colors } = useSettings();
    return (
      <View style={[styles.pill, focused && { backgroundColor: colors.accent }]}>
        <AppIcon name={focused ? activeIcon : icon} size={24} color={focused ? colors.onAccent : color} />
      </View>
    );
  }
  return TabIcon;
}

export default function TabLayout() {
  const { colors, fontScale } = useSettings();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontFamily: Fonts.heading, fontSize: 18 * fontScale },
        headerShadowVisible: false,
        sceneStyle: { backgroundColor: colors.background },
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.ringTrack, minHeight: 64 },
        tabBarActiveTintColor: colors.textPrimary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarItemStyle: { paddingTop: 6 },
        // Tab labels have little room, so they grow less than other text.
        tabBarLabelStyle: { fontFamily: Fonts.bodyBold, fontSize: 13 * Math.min(fontScale, 1.3) },
      }}>
      <Tabs.Screen
        name="home"
        options={{ title: 'Today', headerShown: false, tabBarIcon: tabIcon('home', 'homeActive') }}
      />
      <Tabs.Screen
        name="medications"
        options={{
          title: 'Meds',
          headerTitle: 'My medicines',
          tabBarIcon: tabIcon('medications', 'medicationsActive'),
        }}
      />
      <Tabs.Screen name="lookup" options={{ title: 'Ask Pixie', tabBarIcon: tabIcon('lookup') }} />
      <Tabs.Screen name="history" options={{ title: 'History', tabBarIcon: tabIcon('history') }} />
      <Tabs.Screen
        name="settings"
        options={{ title: 'Settings', tabBarIcon: tabIcon('settings', 'settingsActive') }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  pill: {
    width: 56,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
