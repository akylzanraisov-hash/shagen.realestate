import * as Contacts from 'expo-contacts';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Glass } from '@/components/chrome';
import { Screen } from '@/components/Screen';
import { Chip, Empty, Icon, IconButton, Txt } from '@/components/ui';
import { STAGES, ago, stageLabel, whenLabel } from '@/lib/format';
import { useStore } from '@/lib/store';
import { Avatar } from '@/components/Avatar';
import type { ClientStage } from '@/lib/types';
import { color, font } from '@/theme/tokens';

async function importContacts() {
  if (Platform.OS === 'web') return;
  const { granted } = await Contacts.requestPermissionsAsync();
  if (!granted) return;
  const { data } = await Contacts.getContactsAsync({ fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name] });
  const s = useStore.getState();
  let n = 0;
  for (const c of data) {
    const phone = c.phoneNumbers?.[0]?.number;
    if (!c.name || !phone) continue;
    if (s.clients.some((x) => x.phone === phone)) continue;
    s.upsertClient({ name: c.name, phone, stage: 'contact', tags: ['импорт'] });
    n++;
  }
  Alert.alert('Готово', `Добавлено контактов: ${n}`);
}

/** Memory Box: лёгкая CRM, которую ИИ заполняет сам. */
export default function People() {
  const clients = useStore((s) => s.clients);
  const [q, setQ] = useState('');
  const [stage, setStage] = useState<ClientStage | 'all'>('all');

  const list = useMemo(() => {
    const n = q.trim().toLowerCase();
    return clients
      .filter((c) => stage === 'all' || c.stage === stage)
      .filter((c) => !n || c.name.toLowerCase().includes(n) || c.phone?.includes(n) || c.interest?.toLowerCase().includes(n))
      .sort((a, b) => (b.lastTouchAt ?? b.createdAt).localeCompare(a.lastTouchAt ?? a.createdAt));
  }, [clients, q, stage]);

  const [now] = useState(() => Date.now());
  const dueFollowUps = clients.filter((c) => c.followUpAt && new Date(c.followUpAt).getTime() < now + 86400000).length;

  return (
    <Screen tabbed>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Txt v="h1">Люди</Txt>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <IconButton name="send" onPress={() => router.push({ pathname: '/broadcast/[id]', params: { id: 'new' } })} />
          <IconButton name="plus" bg={color.volt} tint={color.ink} onPress={() => router.push({ pathname: '/client/[id]', params: { id: 'new' } })} />
        </View>
      </View>

      <Glass onPress={() => router.push('/memory')} tint={color.volt}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Txt style={{ fontSize: 26 }}>💼</Txt>
          <View style={{ flex: 1 }}>
            <Txt v="h3">Обновить карточку</Txt>
            <Txt v="small" c={color.textDim}>Надиктуйте итоги встречи или вставьте переписку — Zumi сама всё разнесёт</Txt>
          </View>
          <Icon name="chevron-right" tint={color.textMute} />
        </View>
      </Glass>

      {dueFollowUps ? (
        <Txt v="bodyBold" c={color.sun}>
          🔔 Фоллоу-апов на сегодня: {dueFollowUps}
        </Txt>
      ) : null}

      <Glass pad={0}>
        <View style={styles.search}>
          <Icon name="search" size={18} tint={color.textMute} />
          <TextInput value={q} onChangeText={setQ} placeholder="Имя, телефон, запрос…" placeholderTextColor={color.textMute} style={styles.searchInput} />
        </View>
      </Glass>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        <Chip label={`Все · ${clients.length}`} active={stage === 'all'} onPress={() => setStage('all')} />
        {STAGES.map((s) => (
          <Chip key={s.id} label={`${s.label} · ${clients.filter((c) => c.stage === s.id).length}`} active={stage === s.id} onPress={() => setStage(s.id)} />
        ))}
      </ScrollView>

      {list.length === 0 ? (
        <View style={{ gap: 12 }}>
          <Empty icon="users" title="Здесь будут ваши клиенты" hint="Скажите: «Новый клиент Алия, +7 701 123 45 67, ищет двушку» — или импортируйте контакты." />
          <Chip label="Импорт из контактов" icon="download" onPress={importContacts} />
        </View>
      ) : (
        <View style={{ gap: 8 }}>
          {list.map((c) => (
            <Glass key={c.id} pad={12} onPress={() => router.push({ pathname: '/client/[id]', params: { id: c.id } })}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Avatar c={c} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Txt v="h3" numberOfLines={1}>{c.name}</Txt>
                  <Txt v="small" c={color.textDim} numberOfLines={1}>
                    {[stageLabel(c.stage), c.interest ?? c.interests?.[0], c.budget].filter(Boolean).join(' · ')}
                  </Txt>
                  {c.followUpAt ? (
                    <Txt v="small" c={color.sun}>→ {whenLabel(c.followUpAt)}</Txt>
                  ) : (
                    <Txt v="small" c={color.textMute}>{ago(c.lastTouchAt ?? c.createdAt)}</Txt>
                  )}
                </View>
                <Icon name="chevron-right" size={18} tint={color.textMute} />
              </View>
            </Glass>
          ))}
          <Chip label="Импорт из контактов" icon="download" onPress={importContacts} />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, height: 48 },
  searchInput: { flex: 1, color: color.text, fontFamily: font.body, fontSize: 15 },
});
