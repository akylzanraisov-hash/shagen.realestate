import { Tabs } from 'expo-router/tabs';

import { Dock } from '@/components/Dock';
import { color } from '@/theme/tokens';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <Dock {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: color.ink } }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="digests" />
      <Tabs.Screen name="people" />
      <Tabs.Screen name="studio" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
