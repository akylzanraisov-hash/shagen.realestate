import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { ComponentProps, ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { color, font, radius } from '@/theme/tokens';

export type IconName = ComponentProps<typeof Feather>['name'];

export const Icon = ({ name, size = 20, tint = color.text }: { name: IconName; size?: number; tint?: string }) => (
  <Feather name={name} size={size} color={tint} />
);

type Variant = 'mega' | 'h1' | 'h2' | 'h3' | 'body' | 'bodyBold' | 'small' | 'label' | 'num';

const variants: Record<Variant, TextStyle> = {
  mega: { fontFamily: font.display, fontSize: 52, lineHeight: 56, letterSpacing: -2 },
  h1: { fontFamily: font.display, fontSize: 30, lineHeight: 35, letterSpacing: -0.8 },
  h2: { fontFamily: font.display, fontSize: 21, lineHeight: 26, letterSpacing: -0.4 },
  h3: { fontFamily: font.bodyHeavy, fontSize: 16, lineHeight: 21, letterSpacing: -0.1 },
  body: { fontFamily: font.body, fontSize: 15, lineHeight: 22 },
  bodyBold: { fontFamily: font.bodyBold, fontSize: 15, lineHeight: 21 },
  small: { fontFamily: font.body, fontSize: 13, lineHeight: 18 },
  label: { fontFamily: font.bodyHeavy, fontSize: 12, lineHeight: 15, letterSpacing: 0.8, textTransform: 'uppercase' },
  num: { fontFamily: font.display, fontSize: 40, lineHeight: 44, letterSpacing: -1.5 },
};

export function Txt({
  v = 'body',
  c = color.text,
  style,
  ...rest
}: TextProps & { v?: Variant; c?: string; style?: StyleProp<TextStyle> }) {
  return <Text {...rest} style={[variants[v], { color: c }, style]} />;
}

/** Uppercase section label, e.g. "БЫСТРЫЕ ШАБЛОНЫ". */
export const SectionLabel = ({ children, right }: { children: ReactNode; right?: ReactNode }) => (
  <View style={styles.section}>
    <Txt v="label" c={color.textMute}>
      {children}
    </Txt>
    {right}
  </View>
);

export const Hairline = ({ style }: { style?: StyleProp<ViewStyle> }) => <View style={[styles.hair, style]} />;

export const tap = () => Haptics.selectionAsync().catch(() => undefined);
export const thud = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
export const success = () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);

export function Button({
  title,
  onPress,
  kind = 'volt',
  icon,
  loading,
  disabled,
  style,
  small,
}: {
  title: string;
  onPress?: () => void;
  kind?: 'volt' | 'ghost' | 'ink' | 'danger';
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  small?: boolean;
}) {
  const bg = { volt: color.volt, ghost: 'transparent', ink: color.glassStrong, danger: 'transparent' }[kind];
  const fg = { volt: color.ink, ghost: color.text, ink: color.text, danger: color.flare }[kind];
  return (
    <Pressable
      disabled={disabled || loading}
      onPress={() => {
        tap();
        onPress?.();
      }}
      style={({ pressed }) => [
        styles.btn,
        small && styles.btnSmall,
        { backgroundColor: bg, opacity: disabled ? 0.4 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
        (kind === 'ghost' || kind === 'danger') && { borderWidth: 1, borderColor: kind === 'danger' ? color.flare : color.lineStrong },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          <Txt v="bodyBold" c={fg} style={small ? { fontSize: 14 } : undefined}>
            {title}
          </Txt>
          {icon ? <Icon name={icon} size={small ? 16 : 18} tint={fg} /> : null}
        </>
      )}
    </Pressable>
  );
}

export function Chip({
  label,
  active,
  onPress,
  tint = color.volt,
  icon,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  tint?: string;
  icon?: IconName;
}) {
  return (
    <Pressable
      onPress={() => {
        tap();
        onPress?.();
      }}
      style={[
        styles.chip,
        active ? { backgroundColor: tint, borderColor: tint } : { borderColor: color.lineStrong },
      ]}>
      {icon ? <Icon name={icon} size={13} tint={active ? color.ink : color.textDim} /> : null}
      <Txt v="small" c={active ? color.ink : color.textDim} style={{ fontFamily: font.bodyBold }}>
        {label}
      </Txt>
    </Pressable>
  );
}

export function IconButton({
  name,
  tint = color.text,
  bg = color.glassStrong,
  size = 44,
  onPress,
  ...rest
}: { name: IconName; tint?: string; bg?: string; size?: number; onPress?: () => void } & Omit<PressableProps, 'onPress'>) {
  return (
    <Pressable
      hitSlop={8}
      {...rest}
      onPress={() => {
        tap();
        onPress?.();
      }}
      style={({ pressed }) => [
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' },
        { transform: [{ scale: pressed ? 0.92 : 1 }] },
      ]}>
      <Icon name={name} size={size * 0.42} tint={tint} />
    </Pressable>
  );
}

/** Tiny coloured signal dot used instead of icons in lists. */
export const Dot = ({ c, size = 8 }: { c: string; size?: number }) => (
  <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: c }} />
);

export const Empty = ({ title, hint, icon = 'wind' }: { title: string; hint?: string; icon?: IconName }) => (
  <View style={styles.empty}>
    <Icon name={icon} size={22} tint={color.textMute} />
    <Txt v="h3" c={color.textDim} style={{ textAlign: 'center' }}>
      {title}
    </Txt>
    {hint ? (
      <Txt v="small" c={color.textMute} style={{ textAlign: 'center', maxWidth: 280 }}>
        {hint}
      </Txt>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  section: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10 },
  hair: { height: StyleSheet.hairlineWidth, backgroundColor: color.line },
  btn: {
    height: 56,
    borderRadius: radius.pill,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  btnSmall: { height: 40, paddingHorizontal: 16 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: 32,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  empty: { alignItems: 'center', gap: 8, paddingVertical: 36 },
});
