import { BlurView } from 'expo-blur';
import type { BottomTabBarProps } from 'expo-router/tabs';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { color, font } from '@/theme/tokens';

import { Icon, type IconName, Txt, tap } from './ui';

export const TABS: Record<string, { label: string; icon: IconName }> = {
  index: { label: 'Главная', icon: 'home' },
  digests: { label: 'История', icon: 'clock' },
  people: { label: 'Люди', icon: 'users' },
  studio: { label: 'Студия', icon: 'feather' },
  profile: { label: 'Профиль', icon: 'user' },
};

/** Frosted bottom bar; active tab glows mint. */
export function Dock({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {Platform.OS === 'ios' ? <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} /> : null}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: Platform.OS === 'ios' ? 'rgba(12,18,20,0.7)' : color.ink2 }]} />
      <View style={styles.row}>
        {state.routes.map((r, i) => {
          const meta = TABS[r.name];
          if (!meta) return null;
          const focused = state.index === i;
          const tint = focused ? color.volt : color.textMute;
          return (
            <Pressable
              key={r.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={meta.label}
              onPress={() => {
                tap();
                const e = navigation.emit({ type: 'tabPress', target: r.key, canPreventDefault: true });
                if (!focused && !e.defaultPrevented) navigation.navigate(r.name);
              }}
              style={styles.tab}>
              {focused ? <View style={styles.glow} /> : null}
              <Icon name={meta.icon} size={22} tint={tint} />
              <Txt v="small" c={tint} style={{ fontFamily: focused ? font.bodyHeavy : font.bodyBold, fontSize: 11 }}>
                {meta.label}
              </Txt>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: color.lineStrong,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', paddingTop: 10, paddingHorizontal: 6 },
  tab: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 2 },
  glow: {
    position: 'absolute',
    top: -14,
    width: 36,
    height: 3,
    borderRadius: 2,
    backgroundColor: color.volt,
    shadowColor: color.volt,
    shadowOpacity: 0.9,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
});
