import { Tabs } from 'expo-router';
import { ColorValue } from 'react-native';

import { AppIcon, IconName } from '@/components/appIcon';
import { useSettings } from '@/context/settingsContext';

// The active tab is marked by a filled icon (where one exists), a bold label
// and a highlighted background, not by color alone.
function tabIcon(icon: IconName, activeIcon: IconName = icon) {
  function TabIcon({ color, focused }: { color: ColorValue; focused: boolean }) {
    return <AppIcon name={focused ? activeIcon : icon} size={26} color={color} />;
  }
  return TabIcon;
}

export default function TabLayout() {
  const { colors, fontScale, toggles } = useSettings();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontSize: 17 * fontScale },
        sceneStyle: { backgroundColor: colors.background },
        tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.textPrimary },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textPrimary,
        tabBarActiveBackgroundColor: toggles.highContrast ? colors.background : colors.sage,
        // Tab labels have little room, so they grow less than other text.
        tabBarLabelStyle: { fontSize: 11 * Math.min(fontScale, 1.3), fontWeight: '700' },
      }}>
      <Tabs.Screen
        name="home"
        options={{ title: 'Home', headerShown: false, tabBarIcon: tabIcon('home', 'homeActive') }}
      />
      <Tabs.Screen
        name="medications"
        options={{ title: 'Medications', tabBarIcon: tabIcon('medications', 'medicationsActive') }}
      />
      <Tabs.Screen name="lookup" options={{ title: 'Lookup', tabBarIcon: tabIcon('lookup') }} />
      <Tabs.Screen name="history" options={{ title: 'History', tabBarIcon: tabIcon('history') }} />
      <Tabs.Screen
        name="settings"
        options={{ title: 'Settings', tabBarIcon: tabIcon('settings', 'settingsActive') }}
      />
    </Tabs>
  );
}
