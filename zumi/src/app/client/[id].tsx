import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { useShallow } from 'zustand/react/shallow';

import { Avatar } from '@/components/Avatar';
import { Glass } from '@/components/chrome';
import { ItemRow } from '@/components/ItemRow';
import { Screen } from '@/components/Screen';
import { Button, Chip, IconButton, SectionLabel, Txt, success } from '@/components/ui';
import { STAGES, ago, whenLabel } from '@/lib/format';
import { callViaLine } from '@/lib/line';
import { useStore } from '@/lib/store';
import type { Client } from '@/lib/types';
import { cleanPhone, openWhatsAppChat } from '@/lib/whatsapp';
import { color, font } from '@/theme/tokens';

function NewClient() {
  const upsert = useStore((s) => s.upsertClient);
  const [f, setF] = useState<Partial<Client>>({ stage: 'lead' });
  const field = (key: keyof Client, label: string, kb?: 'phone-pad') => (
    <View>
      <Txt v="small" c={color.textMute}>{label}</Txt>
      <TextInput
        value={(f[key] as string) ?? ''}
        onChangeText={(v) => setF({ ...f, [key]: v })}
        keyboardType={kb}
        style={styles.input}
        placeholderTextColor={color.textMute}
      />
    </View>
  );
  return (
    <Screen header={<IconButton name="x" onPress={() => router.back()} />}>
      <Txt v="h1">Новый клиент</Txt>
      <Txt v="small" c={color.textDim}>Быстрее голосом: «Новый клиент Алия, +7 701…, бюджет 50 млн, ищет двушку»</Txt>
      <Glass>
        <View style={{ gap: 14 }}>
          {field('name', 'Имя')}
          {field('phone', 'Телефон', 'phone-pad')}
          {field('budget', 'Бюджет')}
          {field('interest', 'Что ищет')}
        </View>
      </Glass>
      <Button
        title="Сохранить"
        icon="check"
        disabled={!f.name?.trim()}
        onPress={() => {
          const c = upsert({ ...f, name: f.name!.trim() });
          success();
          router.replace({ pathname: '/client/[id]', params: { id: c.id } });
        }}
      />
    </Screen>
  );
}

export default function ClientScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = useStore((s) => s.clients.find((x) => x.id === id));
  const items = useStore(useShallow((s) => s.items.filter((i) => i.clientId === id)));
  const { updateClient, removeClient, profile } = useStore();
  const [calling, setCalling] = useState(false);

  if (id === 'new') return <NewClient />;
  if (!c) return <Screen><Txt v="h2">Клиент не найден</Txt></Screen>;

  const call = async () => {
    if (!c.phone) return;
    if (profile.lineNumber) {
      setCalling(true);
      try {
        await callViaLine(c.phone, c.name);
        Alert.alert('Соединяю', 'Сейчас вам позвонит Линия Zumi — возьмите трубку, и я соединю с клиентом. Разговор запишется, итоги придут в WhatsApp.');
      } catch (e) {
        Alert.alert('Не получилось', String(e));
      } finally {
        setCalling(false);
      }
    } else {
      Linking.openURL(`tel:+${cleanPhone(c.phone)}`);
    }
  };

  return (
    <Screen
      header={
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <IconButton name="chevron-left" onPress={() => router.back()} />
          <IconButton
            name="trash-2"
            tint={color.flare}
            onPress={() =>
              Alert.alert(`Удалить ${c.name}?`, undefined, [
                { text: 'Отмена', style: 'cancel' },
                { text: 'Удалить', style: 'destructive', onPress: () => { removeClient(c.id); router.back(); } },
              ])
            }
          />
        </View>
      }>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Avatar c={c} size={84} />
        <Txt v="h1" style={{ textAlign: 'center' }}>{c.name}</Txt>
        {c.phone ? <Txt v="bodyBold" c={color.textDim}>{c.phone}</Txt> : null}
        <Txt v="small" c={color.textMute}>Последний контакт: {ago(c.lastTouchAt ?? c.createdAt)}</Txt>
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Button title="Позвонить" icon="phone" style={{ flex: 1 }} onPress={call} loading={calling} disabled={!c.phone} />
        <Button title="WhatsApp" icon="message-circle" kind="ink" style={{ flex: 1 }} disabled={!c.phone} onPress={() => openWhatsAppChat(c.phone!, `Здравствуйте, ${c.name.split(' ')[0]}! `)} />
      </View>
      {profile.lineNumber ? (
        <Txt v="small" c={color.volt} style={{ textAlign: 'center', marginTop: -8 }}>● Звонок через Линию Zumi запишется автоматически</Txt>
      ) : null}

      <Button title="Надиктовать итоги разговора" kind="ghost" icon="mic" onPress={() => router.push({ pathname: '/memory', params: { clientId: c.id } })} />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {STAGES.map((s) => (
          <Chip key={s.id} label={s.label} active={c.stage === s.id} onPress={() => updateClient(c.id, { stage: s.id })} />
        ))}
      </ScrollView>

      {c.followUpAt ? (
        <Glass tint={color.sun}>
          <Txt v="label" c={color.sun}>Фоллоу-ап</Txt>
          <Txt v="h3" style={{ marginTop: 4 }}>{whenLabel(c.followUpAt)}</Txt>
        </Glass>
      ) : null}

      <Glass>
        <SectionLabel>Что важно</SectionLabel>
        <View style={{ gap: 6 }}>
          {c.budget ? <Txt v="body">💰 Бюджет: <Txt v="bodyBold">{c.budget}</Txt></Txt> : null}
          {c.interest ? <Txt v="body">🏠 Ищет: <Txt v="bodyBold">{c.interest}</Txt></Txt> : null}
          {c.interests?.length ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
              {c.interests.map((x) => (
                <View key={x} style={styles.tag}><Txt v="small" style={{ fontFamily: font.bodyBold }}>{x}</Txt></View>
              ))}
            </View>
          ) : null}
          {!c.budget && !c.interest && !c.interests?.length ? (
            <Txt v="small" c={color.textMute}>Zumi заполнит это сама после разговора</Txt>
          ) : null}
        </View>
      </Glass>

      {c.agreements?.length ? (
        <Glass>
          <SectionLabel>На чём сошлись</SectionLabel>
          {c.agreements.map((a, i) => <Txt key={i} v="body" style={{ paddingVertical: 3 }}>🤝 {a}</Txt>)}
        </Glass>
      ) : null}

      {items.length ? (
        <Glass>
          <SectionLabel>Задачи и встречи</SectionLabel>
          {items.map((i) => <ItemRow key={i.id} item={i} showDate />)}
        </Glass>
      ) : null}

      {c.touches?.length ? (
        <Glass>
          <SectionLabel>История общения</SectionLabel>
          {c.touches.map((t, i) => (
            <View key={i} style={{ paddingVertical: 8, gap: 2, borderTopWidth: i ? StyleSheet.hairlineWidth : 0, borderTopColor: color.line }}>
              <Txt v="small" c={color.ultra}>
                {t.via === 'meeting' ? '📞 Звонок/встреча' : t.via === 'chat' ? '💬 Переписка' : '🎙 Голос'} · {ago(t.at)}
              </Txt>
              <Txt v="body">{t.summary}</Txt>
            </View>
          ))}
        </Glass>
      ) : null}

      {c.notes ? (
        <Glass>
          <SectionLabel>Заметки</SectionLabel>
          <Txt v="body" c={color.textDim}>{c.notes}</Txt>
        </Glass>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: { color: color.text, fontFamily: font.bodyBold, fontSize: 17, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: color.lineStrong },
  tag: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: color.glassStrong },
});
