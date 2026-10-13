import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { completeItem, deleteItem } from '@/lib/execute';
import { hhmm } from '@/lib/format';
import { useStore } from '@/lib/store';
import type { Item } from '@/lib/types';
import { color, font, kindColor } from '@/theme/tokens';

import { Icon, Txt, tap } from './ui';

const KIND_LABEL: Record<Item['kind'], string> = {
  event: 'встреча',
  reminder: 'напомнить',
  task: 'задача',
  note: 'заметка',
};

/**
 * Timeline row: oversized light time on the left, a colour "signal" bar, and
 * integration badges (calendar / push / WhatsApp) instead of decoration.
 */
export function ItemRow({ item, showDate }: { item: Item; showDate?: boolean }) {
  const client = useStore((s) => (item.clientId ? s.clients.find((c) => c.id === item.clientId) : undefined));
  const tint = kindColor[item.kind];

  return (
    <Pressable
      onPress={() => {
        tap();
        completeItem(item);
      }}
      onLongPress={() =>
        Alert.alert(item.title, 'Удалить вместе с событием в календаре и напоминаниями?', [
          { text: 'Отмена', style: 'cancel' },
          { text: 'Удалить', style: 'destructive', onPress: () => deleteItem(item) },
        ])
      }
      style={({ pressed }) => [styles.row, { opacity: item.done ? 0.38 : pressed ? 0.7 : 1 }]}>
      <View style={styles.timeCol}>
        <Txt v="h2" style={{ fontFamily: font.displayLight, fontSize: 24 }} c={item.at ? color.text : color.textMute}>
          {item.at ? hhmm(item.at) : '—'}
        </Txt>
        {showDate && item.at ? (
          <Txt v="small" c={color.textMute}>
            {new Date(item.at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
          </Txt>
        ) : null}
      </View>
      <View style={[styles.bar, { backgroundColor: tint }]} />
      <View style={{ flex: 1, gap: 4 }}>
        <Txt v="bodyBold" style={item.done ? { textDecorationLine: 'line-through' } : undefined} numberOfLines={2}>
          {item.title}
        </Txt>
        <View style={styles.meta}>
          <Txt v="label" c={tint} style={{ fontSize: 9 }}>
            {KIND_LABEL[item.kind]}
          </Txt>
          {client ? (
            <Txt v="small" c={color.rose}>
              · {client.name}
            </Txt>
          ) : null}
          {item.calendarEventId ? <Icon name="calendar" size={12} tint={color.textMute} /> : null}
          {item.notificationId ? <Icon name="bell" size={12} tint={color.textMute} /> : null}
          {item.whatsappJobId ? <Icon name="message-circle" size={12} tint={color.aqua} /> : null}
        </View>
      </View>
      <View style={[styles.check, item.done && { backgroundColor: color.aqua, borderColor: color.aqua }]}>
        {item.done ? <Icon name="check" size={14} tint={color.ink} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  timeCol: { width: 74 },
  bar: { width: 3, alignSelf: 'stretch', borderRadius: 2 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: color.lineStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
