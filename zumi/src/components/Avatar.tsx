import { StyleSheet, View } from 'react-native';

import type { Client, ClientStage } from '@/lib/types';
import { color, font } from '@/theme/tokens';

import { Txt } from './ui';

const initials = (n: string) =>
  n
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const STAGE_TINT: Record<ClientStage, string> = {
  lead: color.aqua,
  contact: color.ultra,
  showing: color.volt,
  offer: color.sun,
  deal: color.volt,
  lost: color.textMute,
};

export function Avatar({ c, size = 44 }: { c: Client; size?: number }) {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: `${STAGE_TINT[c.stage]}26` }]}>
      <Txt c={STAGE_TINT[c.stage]} style={{ fontFamily: font.bodyHeavy, fontSize: size * 0.36 }}>
        {initials(c.name)}
      </Txt>
    </View>
  );
}


const styles = StyleSheet.create({ avatar: { alignItems: 'center', justifyContent: 'center' } });
