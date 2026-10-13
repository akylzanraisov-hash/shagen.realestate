import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, Ellipse, Path, RadialGradient, Rect, Stop, LinearGradient as SvgLinear } from 'react-native-svg';

import { hasBackend } from '@/lib/config';
import { color, font, radius } from '@/theme/tokens';

import { Txt, tap } from './ui';

/** Graphite-teal canvas with two soft colour glows (lilac top-right, mint bottom-left). */
export function Backdrop() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient colors={[color.bgTop, color.ink, color.bgBottom]} locations={[0, 0.45, 1]} style={StyleSheet.absoluteFill} />
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Defs>
          <RadialGradient id="g1" cx="85%" cy="12%" r="55%">
            <Stop offset="0" stopColor={color.ultra} stopOpacity={0.18} />
            <Stop offset="1" stopColor={color.ultra} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="g2" cx="10%" cy="70%" r="60%">
            <Stop offset="0" stopColor={color.volt} stopOpacity={0.1} />
            <Stop offset="1" stopColor={color.volt} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#g1)" />
        <Rect width="100%" height="100%" fill="url(#g2)" />
      </Svg>
    </View>
  );
}

/** Frosted glass panel — the only container shape in the app. */
export function Glass({
  children,
  style,
  onPress,
  tint,
  pad = 16,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  /** optional colour wash for hero panels */
  tint?: string;
  pad?: number;
}) {
  const inner = (
    <>
      {Platform.OS === 'ios' ? <BlurView intensity={24} tint="dark" style={StyleSheet.absoluteFill} /> : null}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: color.glass }]} />
      {tint ? (
        <LinearGradient
          colors={[`${tint}33`, 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <View style={{ padding: pad }}>{children}</View>
    </>
  );
  if (onPress) {
    return (
      <Pressable
        onPress={() => {
          tap();
          onPress();
        }}
        style={({ pressed }) => [styles.glass, style, { transform: [{ scale: pressed ? 0.985 : 1 }] }]}>
        {inner}
      </Pressable>
    );
  }
  return <View style={[styles.glass, style]}>{inner}</View>;
}

/** Zumi mascot: a soft lilac blob with mint cheeks and a sparkle. */
export function Mascot({ size = 30 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Defs>
        <SvgLinear id="mb" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#D4BFFF" />
          <Stop offset="1" stopColor={color.ultra} />
        </SvgLinear>
      </Defs>
      <Path d="M32 8c13 0 24 10 24 24 0 15-9 24-24 24S8 47 8 32C8 18 19 8 32 8z" fill="url(#mb)" />
      <Ellipse cx="24" cy="32" rx="3.2" ry="4.2" fill="#1A1430" />
      <Ellipse cx="40" cy="32" rx="3.2" ry="4.2" fill="#1A1430" />
      <Circle cx="18" cy="40" r="3.6" fill={color.volt} opacity={0.7} />
      <Circle cx="46" cy="40" r="3.6" fill={color.volt} opacity={0.7} />
      <Path d="M27 42c3 3 7 3 10 0" stroke="#1A1430" strokeWidth={2.4} strokeLinecap="round" fill="none" />
      <Path d="M50 4l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill={color.volt} />
    </Svg>
  );
}

export const Logo = ({ size = 26 }: { size?: number }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
    <Mascot size={size + 6} />
    <Txt c={color.volt} style={{ fontFamily: font.logo, fontSize: size, letterSpacing: -0.5 }}>
      Zumi
    </Txt>
  </View>
);

/** "● В сети" — shows whether the AI backend is reachable/configured. */
export function LivePill() {
  const online = hasBackend();
  return (
    <View style={styles.live}>
      <View style={[styles.liveDot, { backgroundColor: online ? color.volt : color.sun }]} />
      <Txt v="small" style={{ fontFamily: font.bodyBold }}>
        {online ? 'В сети' : 'Офлайн-режим'}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  glass: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: color.glassBorder,
  },
  live: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    height: 32,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: color.glassStrong,
    borderWidth: 1,
    borderColor: color.glassBorder,
  },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
});
