import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Item } from '@/lib/types';
import { color, kindColor } from '@/theme/tokens';

import { Txt } from './ui';

const START = 7;
const END = 23;

/**
 * The day as a single horizontal strip: hour ticks, coloured blocks for what's
 * planned and a volt "now" needle. Reads at a glance, like a waveform of the day.
 */
export function DayRibbon({ items }: { items: Item[] }) {
  const [w, setW] = useState(0);
  const now = new Date();
  const x = (d: Date) => {
    const h = d.getHours() + d.getMinutes() / 60;
    return (Math.min(Math.max(h, START), END) - START) / (END - START) * w;
  };

  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ height: 64 }}>
      {w > 0 && (
        <>
          <View style={styles.track} />
          {Array.from({ length: END - START + 1 }, (_, i) => {
            const h = START + i;
            const left = (i / (END - START)) * w;
            const major = h % 3 === 0;
            return (
              <View key={h} style={[styles.tick, { left, height: major ? 12 : 6, opacity: major ? 0.5 : 0.25 }]}>
                {major ? (
                  <Txt v="small" c={color.textMute} style={styles.tickLabel}>
                    {h}
                  </Txt>
                ) : null}
              </View>
            );
          })}
          {items
            .filter((i) => i.at)
            .map((i) => {
              const s = new Date(i.at!);
              const e = new Date(s.getTime() + (i.durationMin ?? 30) * 60000);
              const left = x(s);
              const width = Math.max(6, x(e) - left);
              return (
                <View
                  key={i.id}
                  style={[styles.block, { left, width, backgroundColor: kindColor[i.kind], opacity: i.done ? 0.3 : 0.9 }]}
                />
              );
            })}
          {now.getHours() >= START && now.getHours() < END && (
            <View style={[styles.needle, { left: x(now) - 1 }]}>
              <View style={styles.needleDot} />
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { position: 'absolute', left: 0, right: 0, top: 26, height: 12, borderRadius: 6, backgroundColor: color.ink3 },
  tick: { position: 'absolute', top: 44, width: 1, backgroundColor: color.text },
  tickLabel: { position: 'absolute', top: 12, left: -6, width: 24, fontSize: 10 },
  block: { position: 'absolute', top: 26, height: 12, borderRadius: 6 },
  needle: { position: 'absolute', top: 14, width: 2, height: 36, backgroundColor: color.volt, borderRadius: 1, alignItems: 'center' },
  needleDot: { position: 'absolute', top: -5, width: 10, height: 10, borderRadius: 5, backgroundColor: color.volt },
});
