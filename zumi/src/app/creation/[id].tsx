import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Share, StyleSheet, TextInput, View } from 'react-native';

import { Glass } from '@/components/chrome';
import { Markdown } from '@/components/Markdown';
import { Screen } from '@/components/Screen';
import { Button, IconButton, Txt, success } from '@/components/ui';
import { publish } from '@/lib/ai';
import { hasBackend } from '@/lib/config';
import { FORMATS } from '@/lib/formats';
import { useStore } from '@/lib/store';
import { color, font } from '@/theme/tokens';

const plain = (md: string) => md.replace(/^#+\s/gm, '').replace(/\*\*/g, '');

export default function CreationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = useStore((s) => s.creations.find((x) => x.id === id));
  const { updateCreation, removeCreation, addBroadcast } = useStore();
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!c) return <Screen><Txt v="h2">Не найдено</Txt></Screen>;
  const fmt = FORMATS.find((f) => f.id === c.format);

  const makeLink = async () => {
    if (!hasBackend()) return Alert.alert('Нужен сервер', 'Короткие ссылки работают после подключения сервера');
    setBusy(true);
    try {
      const url = await publish(c.title, c.body);
      if (url) {
        updateCreation(c.id, { shareUrl: url });
        await Clipboard.setStringAsync(url);
        success();
        Alert.alert('Ссылка скопирована', url);
      }
    } catch (e) {
      Alert.alert('Не получилось', String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen
      header={
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <IconButton name="chevron-left" onPress={() => router.back()} />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <IconButton name={editing ? 'check' : 'edit-2'} onPress={() => setEditing(!editing)} />
            <IconButton name="trash-2" tint={color.flare} onPress={() => { removeCreation(c.id); router.back(); }} />
          </View>
        </View>
      }>
      <Txt v="label" c={color.ultra}>{fmt?.emoji} {fmt?.title}</Txt>
      <Glass>
        {editing ? (
          <TextInput multiline value={c.body} onChangeText={(body) => updateCreation(c.id, { body })} style={styles.edit} />
        ) : (
          <Markdown body={c.body} />
        )}
      </Glass>

      <View style={{ gap: 10 }}>
        {c.format === 'brief' || c.format === 'landing' ? (
          <Button title={c.shareUrl ? 'Скопировать ссылку' : 'Сделать короткую ссылку'} icon="link" loading={busy} onPress={c.shareUrl ? async () => { await Clipboard.setStringAsync(c.shareUrl!); success(); } : makeLink} />
        ) : null}
        {c.format === 'newsletter' ? (
          <Button
            title="Разослать клиентам"
            icon="send"
            onPress={() => {
              const b = addBroadcast({ text: plain(c.body), clientIds: [] });
              router.push({ pathname: '/broadcast/[id]', params: { id: b.id } });
            }}
          />
        ) : null}
        <Button title="Скопировать текст" kind="ink" icon="copy" onPress={async () => { await Clipboard.setStringAsync(plain(c.body)); success(); }} />
        <Button title="Поделиться" kind="ghost" icon="share" onPress={() => Share.share({ message: c.shareUrl ? `${c.title}\n${c.shareUrl}` : plain(c.body) })} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  edit: { color: color.text, fontFamily: font.body, fontSize: 15, lineHeight: 22, minHeight: 300, textAlignVertical: 'top' },
});
