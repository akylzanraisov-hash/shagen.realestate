import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Glass } from '@/components/chrome';
import { Screen } from '@/components/Screen';
import { Button, Chip, Icon, IconButton, SectionLabel, Txt, success } from '@/components/ui';
import { STAGES } from '@/lib/format';
import { useStore } from '@/lib/store';
import type { ClientStage } from '@/lib/types';
import { openWhatsAppChat, personalise, scheduleBroadcast } from '@/lib/whatsapp';
import { color, font } from '@/theme/tokens';

/**
 * Рассылка по своим контактам.
 *  • WhatsApp Business подключён → уходит автоматически (можно по расписанию / каждое утро).
 *  • Не подключён → «конвейер»: Zumi открывает чат с каждым клиентом с готовым текстом.
 */
export default function BroadcastScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { clients, broadcasts, addBroadcast, updateBroadcast, markBroadcastSent, profile, isPro } = useStore();
  const existing = broadcasts.find((b) => b.id === id);
  const [text, setText] = useState(existing?.text ?? 'Здравствуйте, {имя}! ');
  const [stage, setStage] = useState<ClientStage | 'all'>('all');
  const [picked, setPicked] = useState<string[]>(() =>
    existing?.clientIds.length ? existing.clientIds : clients.filter((c) => c.phone).map((c) => c.id),
  );
  const [busy, setBusy] = useState(false);

  const withPhone = useMemo(() => clients.filter((c) => c.phone), [clients]);
  const visible = withPhone.filter((c) => stage === 'all' || c.stage === stage);

  const recipients = withPhone.filter((c) => picked.includes(c.id));
  const sent = existing?.sentIds ?? [];
  const nextUp = recipients.find((c) => !sent.includes(c.id));
  const auto = isPro && profile.waConnected;

  const ensure = () => {
    if (existing) {
      updateBroadcast(existing.id, { text, clientIds: picked });
      return existing.id;
    }
    const b = addBroadcast({ text, clientIds: picked });
    router.setParams({ id: b.id });
    return b.id;
  };

  const sendAuto = async () => {
    setBusy(true);
    try {
      const bid = ensure();
      const serverId = await scheduleBroadcast({ recipients: recipients.map((c) => ({ phone: c.phone!, name: c.name })), text });
      updateBroadcast(bid, { auto: true, serverId, sentIds: recipients.map((c) => c.id) });
      success();
      Alert.alert('Рассылка отправлена', `Получателей: ${recipients.length}`);
      router.back();
    } catch (e) {
      Alert.alert('Не получилось', String(e));
    } finally {
      setBusy(false);
    }
  };

  const sendNext = async () => {
    if (!nextUp) return;
    const bid = ensure();
    await openWhatsAppChat(nextUp.phone!, personalise(text, nextUp.name));
    markBroadcastSent(bid, nextUp.id);
  };

  return (
    <Screen header={<IconButton name="x" onPress={() => router.back()} />}>
      <Txt v="h1">Рассылка</Txt>

      <Glass pad={4}>
        <TextInput multiline value={text} onChangeText={setText} style={styles.input} placeholderTextColor={color.textMute} />
      </Glass>
      <Txt v="small" c={color.textMute} style={{ marginTop: -10 }}>
        {'{имя}'} заменится на имя клиента
      </Txt>

      <View>
        <SectionLabel right={<Txt v="small" c={color.volt}>{recipients.length} из {withPhone.length}</Txt>}>Кому</SectionLabel>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 10 }}>
          <Chip label="Все" active={stage === 'all'} onPress={() => { setStage('all'); setPicked(withPhone.map((c) => c.id)); }} />
          {STAGES.map((s) => (
            <Chip
              key={s.id}
              label={s.label}
              active={stage === s.id}
              onPress={() => {
                setStage(s.id);
                setPicked(withPhone.filter((c) => c.stage === s.id).map((c) => c.id));
              }}
            />
          ))}
        </ScrollView>
        {withPhone.length === 0 ? (
          <Txt v="small" c={color.textDim}>Нет клиентов с телефонами. Добавьте их голосом или импортируйте контакты во вкладке «Люди».</Txt>
        ) : (
          <Glass pad={8}>
            {visible.map((c) => {
              const on = picked.includes(c.id);
              const done = sent.includes(c.id);
              return (
                <Pressable key={c.id} onPress={() => setPicked(on ? picked.filter((x) => x !== c.id) : [...picked, c.id])} style={styles.row}>
                  <Avatar c={c} size={34} />
                  <Txt v="bodyBold" style={{ flex: 1 }}>{c.name}</Txt>
                  {done ? <Txt v="small" c={color.volt}>отправлено</Txt> : null}
                  <View style={[styles.check, on && { backgroundColor: color.volt, borderColor: color.volt }]}>
                    {on ? <Icon name="check" size={13} tint={color.ink} /> : null}
                  </View>
                </Pressable>
              );
            })}
          </Glass>
        )}
      </View>

      {auto ? (
        <Button title={`Отправить всем (${recipients.length})`} icon="send" onPress={sendAuto} loading={busy} disabled={!recipients.length || !text.trim()} />
      ) : (
        <View style={{ gap: 8 }}>
          <Button
            title={nextUp ? `Отправить: ${nextUp.name.split(' ')[0]} (${sent.filter((x) => picked.includes(x)).length + 1}/${recipients.length})` : 'Все отправлено ✓'}
            icon="message-circle"
            onPress={sendNext}
            disabled={!nextUp || !text.trim()}
          />
          <Txt v="small" c={color.textMute} style={{ textAlign: 'center' }}>
            Откроется WhatsApp с готовым текстом — нажмите «Отправить» и вернитесь. Для полной автоматики подключите WhatsApp Business в профиле.
          </Txt>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: { color: color.text, fontFamily: font.body, fontSize: 16, minHeight: 130, padding: 14, textAlignVertical: 'top' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 8 },
  check: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: color.lineStrong, alignItems: 'center', justifyContent: 'center' },
});
