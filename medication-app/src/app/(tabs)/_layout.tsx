import { Tabs } from 'expo-router';
import { ColorValue } from 'react-native';

import { AppIcon, IconName } from '@/components/appIcon';
import { Fonts } from '@/constants/typography';
import { useSettings } from '@/context/settingsContext';

// The active tab is marked by a filled icon (where one exists), a bold label
// and a highlighted background, not by color alone.
// Step 2 of the design refresh replaces this with a custom tab bar that puts a
// gold pill behind the active icon.
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
        headerTitleStyle: { fontFamily: Fonts.heading, fontSize: 18 * fontScale },
        headerShadowVisible: false,
        sceneStyle: { backgroundColor: colors.background },
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.ringTrack },
        tabBarActiveTintColor: colors.textPrimary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarActiveBackgroundColor: toggles.highContrast ? colors.background : colors.accentSoft,
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
