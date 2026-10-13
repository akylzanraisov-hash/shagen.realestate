import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Share, View } from 'react-native';

import { Glass } from '@/components/chrome';
import { Screen } from '@/components/Screen';
import { Button, Icon, IconButton, SectionLabel, Txt, success } from '@/components/ui';
import { executeAction } from '@/lib/execute';
import { ago, whenLabel } from '@/lib/format';
import { useStore } from '@/lib/store';
import { digestToWhatsApp, openWhatsAppChat, sendWhatsAppNow } from '@/lib/whatsapp';
import { color } from '@/theme/tokens';

export default function DigestScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const d = useStore((s) => s.digests.find((x) => x.id === id));
  const client = useStore((s) => (d?.clientId ? s.clients.find((c) => c.id === d.clientId) : undefined));
  const { updateDigest, removeDigest, profile, isPro } = useStore();
  const [showRaw, setShowRaw] = useState(false);

  if (!d) return <Screen><Txt v="h2">Не найдено</Txt></Screen>;

  const toggleTodo = (i: number) => updateDigest(d.id, { todos: d.todos.map((t, j) => (j === i ? { ...t, done: !t.done } : t)) });
  const scheduleTodo = async (i: number) => {
    const t = d.todos[i];
    if (!t.dueAt) return;
    const r = await executeAction({ type: 'create_reminder', title: t.text, at: t.dueAt, clientName: client?.name });
    updateDigest(d.id, { todos: d.todos.map((x, j) => (j === i ? { ...x, itemId: r.itemId } : x)) });
    success();
  };

  const wa = digestToWhatsApp(d, '🎙 Выжимка');

  return (
    <Screen
      header={
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <IconButton name="chevron-left" onPress={() => router.back()} />
          <IconButton
            name="trash-2"
            tint={color.flare}
            onPress={() =>
              Alert.alert('Удалить выжимку?', undefined, [
                { text: 'Отмена', style: 'cancel' },
                { text: 'Удалить', style: 'destructive', onPress: () => { removeDigest(d.id); router.back(); } },
              ])
            }
          />
        </View>
      }>
      <View style={{ gap: 6 }}>
        <Txt v="label" c={color.ultra}>Выжимка · {ago(d.createdAt)}</Txt>
        <Txt v="h1">{d.title}</Txt>
        {client ? (
          <Pressable onPress={() => router.push({ pathname: '/client/[id]', params: { id: client.id } })}>
            <Txt v="bodyBold" c={color.rose}>👤 {client.name} → карточка обновлена</Txt>
          </Pressable>
        ) : null}
      </View>

      <Glass tint={color.ultra}>
        <SectionLabel>Summary</SectionLabel>
        <Txt v="body">{d.summary}</Txt>
      </Glass>

      {d.todos.length ? (
        <Glass>
          <SectionLabel>To-Do</SectionLabel>
          {d.todos.map((t, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 }}>
              <Pressable onPress={() => toggleTodo(i)} hitSlop={8} style={{ width: 24, height: 24, borderRadius: 7, borderWidth: 1.5, borderColor: t.done ? color.volt : color.lineStrong, backgroundColor: t.done ? color.volt : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                {t.done ? <Icon name="check" size={14} tint={color.ink} /> : null}
              </Pressable>
              <View style={{ flex: 1 }}>
                <Txt v="bodyBold" style={t.done ? { textDecorationLine: 'line-through', opacity: 0.5 } : undefined}>{t.text}</Txt>
                {t.dueAt ? <Txt v="small" c={color.sun}>до {whenLabel(t.dueAt)}</Txt> : null}
              </View>
              {t.dueAt && !t.itemId ? (
                <IconButton name="bell" size={34} onPress={() => scheduleTodo(i)} />
              ) : t.itemId ? (
                <Icon name="bell" size={16} tint={color.volt} />
              ) : null}
            </View>
          ))}
        </Glass>
      ) : null}

      {d.agreements.length ? (
        <Glass>
          <SectionLabel>Договорённости</SectionLabel>
          {d.agreements.map((a, i) => (
            <Txt key={i} v="body" style={{ paddingVertical: 4 }}>🤝 {a}</Txt>
          ))}
        </Glass>
      ) : null}

      <View style={{ gap: 10 }}>
        {isPro && profile.whatsapp ? (
          <Button title="Прислать мне в WhatsApp" icon="message-circle" onPress={async () => { await sendWhatsAppNow(profile.whatsapp!, wa); success(); }} />
        ) : null}
        {client?.phone ? (
          <Button
            title="Отправить итоги клиенту"
            kind="ink"
            icon="send"
            onPress={() =>
              openWhatsAppChat(
                client.phone!,
                `Здравствуйте, ${client.name.split(' ')[0]}! Коротко по нашему разговору:\n\n${d.summary}${d.agreements.length ? `\n\nДоговорились:\n${d.agreements.map((a) => `• ${a}`).join('\n')}` : ''}`,
              )
            }
          />
        ) : null}
        <Button title="Поделиться" kind="ghost" icon="share" onPress={() => Share.share({ message: wa })} />
      </View>

      <Pressable onPress={() => setShowRaw(!showRaw)}>
        <Txt v="small" c={color.textMute}>{showRaw ? 'Скрыть расшифровку ▲' : 'Показать полную расшифровку ▼'}</Txt>
      </Pressable>
      {showRaw ? (
        <Glass>
          <Txt v="small" c={color.textDim} selectable>{d.transcript}</Txt>
        </Glass>
      ) : null}
    </Screen>
  );
}
