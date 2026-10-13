import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Glass } from '@/components/chrome';
import { ItemRow } from '@/components/ItemRow';
import { Screen } from '@/components/Screen';
import { Chip, Empty, Icon, SectionLabel, Txt } from '@/components/ui';
import { ago, dayLabel } from '@/lib/format';
import { useStore } from '@/lib/store';
import { color } from '@/theme/tokens';

type Filter = 'all' | 'digests' | 'plans';

/** История: выжимки звонков/голосовых + все задачи и встречи. */
export default function History() {
  const digests = useStore((s) => s.digests);
  const items = useStore((s) => s.items);
  const clients = useStore((s) => s.clients);
  const [filter, setFilter] = useState<Filter>('all');

  const upcoming = useMemo(
    () => items.filter((i) => i.at && !i.done && new Date(i.at) >= new Date(new Date().setHours(0, 0, 0, 0))).sort((a, b) => a.at!.localeCompare(b.at!)),
    [items],
  );
  const groups = useMemo(() => {
    const m = new Map<string, typeof upcoming>();
    for (const i of upcoming) {
      const k = dayLabel(i.at!);
      m.set(k, [...(m.get(k) ?? []), i]);
    }
    return [...m.entries()];
  }, [upcoming]);

  return (
    <Screen tabbed>
      <Txt v="h1">История</Txt>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Chip label="Всё" active={filter === 'all'} onPress={() => setFilter('all')} />
        <Chip label="Выжимки" active={filter === 'digests'} onPress={() => setFilter('digests')} />
        <Chip label="Планы" active={filter === 'plans'} onPress={() => setFilter('plans')} />
      </View>

      {filter !== 'plans' && (
        <View>
          <SectionLabel>Звонки, встречи, голосовые</SectionLabel>
          {digests.length === 0 ? (
            <Empty icon="mic" title="Пока пусто" hint="Скажите «Привет, Зуми» или нажмите «Нажми и говори» на главной. Звонки по Линии Zumi появятся здесь сами." />
          ) : (
            <View style={{ gap: 10 }}>
              {digests.map((d) => {
                const client = clients.find((c) => c.id === d.clientId);
                const open = d.todos.filter((t) => !t.done).length;
                return (
                  <Glass key={d.id} onPress={() => router.push({ pathname: '/digest/[id]', params: { id: d.id } })}>
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                      <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: `${color.ultra}22`, alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name={d.source === 'shared-audio' ? 'phone' : 'mic'} size={18} tint={color.ultra} />
                      </View>
                      <View style={{ flex: 1, gap: 4 }}>
                        <Txt v="h3" numberOfLines={1}>{d.title}</Txt>
                        <Txt v="small" c={color.textDim} numberOfLines={2}>{d.summary}</Txt>
                        <Txt v="small" c={color.volt}>
                          {ago(d.createdAt)}
                          {client ? ` · ${client.name}` : ''}
                          {open ? ` · задач: ${open}` : ''}
                        </Txt>
                      </View>
                    </View>
                  </Glass>
                );
              })}
            </View>
          )}
        </View>
      )}

      {filter !== 'digests' && (
        <View>
          <SectionLabel>Впереди</SectionLabel>
          {groups.length === 0 ? (
            <Empty icon="calendar" title="Ничего не запланировано" />
          ) : (
            <View style={{ gap: 12 }}>
              {groups.map(([day, list]) => (
                <Glass key={day}>
                  <Txt v="label" c={color.volt}>{day}</Txt>
                  {list.map((i) => (
                    <ItemRow key={i.id} item={i} />
                  ))}
                </Glass>
              ))}
            </View>
          )}
        </View>
      )}
    </Screen>
  );
}
