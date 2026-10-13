import * as Clipboard from 'expo-clipboard';
import * as DocumentPicker from 'expo-document-picker';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Glass } from '@/components/chrome';
import { Screen } from '@/components/Screen';
import { Button, Chip, Icon, IconButton, SectionLabel, Txt, success } from '@/components/ui';
import { compose, transcribe } from '@/lib/ai';
import { hasBackend } from '@/lib/config';
import { FORMATS } from '@/lib/formats';
import { useStore } from '@/lib/store';
import type { CreationFormat, Material } from '@/lib/types';
import { color, font } from '@/theme/tokens';

function MaterialTile({ m, onRemove }: { m: Material; onRemove: () => void }) {
  return (
    <View style={styles.tile}>
      {m.kind === 'image' && m.uri ? (
        <Image source={{ uri: m.uri }} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : (
        <View style={{ padding: 10, gap: 4 }}>
          <Icon name={m.kind === 'link' ? 'link' : m.kind === 'audio' ? 'mic' : 'type'} size={16} tint={color.ultra} />
          <Txt v="small" numberOfLines={4}>{m.text}</Txt>
        </View>
      )}
      <Pressable onPress={onRemove} style={styles.remove} hitSlop={8}>
        <Icon name="x" size={12} tint={color.text} />
      </Pressable>
    </View>
  );
}

/** Генератор контента из «мусора». */
export default function Compose() {
  const params = useLocalSearchParams<{ format?: CreationFormat }>();
  const { materials, addMaterial, removeMaterial, addCreation } = useStore();
  const [format, setFormat] = useState<CreationFormat>(params.format ?? 'newsletter');
  const [brief, setBrief] = useState('');
  const [snippet, setSnippet] = useState('');
  const [busy, setBusy] = useState(false);

  const addPhotos = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: true, quality: 0.6, selectionLimit: 6 });
    if (r.canceled) return;
    r.assets.forEach((a) => addMaterial({ kind: 'image', uri: a.uri, mime: a.mimeType ?? 'image/jpeg' }));
  };
  const addAudio = async () => {
    const r = await DocumentPicker.getDocumentAsync({ type: 'audio/*', copyToCacheDirectory: true });
    if (r.canceled || !r.assets[0]) return;
    if (!hasBackend()) return Alert.alert('Нужен сервер', 'Расшифровка аудио работает после подключения сервера');
    setBusy(true);
    try {
      const t = await transcribe(r.assets[0].uri, r.assets[0].mimeType ?? undefined);
      addMaterial({ kind: 'audio', text: t });
    } finally {
      setBusy(false);
    }
  };
  const addSnippet = (raw: string) => {
    const t = raw.trim();
    if (!t) return;
    addMaterial({ kind: /^https?:\/\/\S+$/.test(t) ? 'link' : 'text', text: t });
    setSnippet('');
  };

  const run = async () => {
    setBusy(true);
    try {
      const out = await compose(format, materials, brief);
      const c = addCreation({ format, title: out.title, body: out.body, materialIds: materials.map((m) => m.id) });
      success();
      router.replace({ pathname: '/creation/[id]', params: { id: c.id } });
    } catch (e) {
      Alert.alert('Не получилось', String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen header={<IconButton name="x" onPress={() => router.back()} />}>
      <Txt v="h1">Собрать текст</Txt>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {FORMATS.map((f) => (
          <Chip key={f.id} label={`${f.emoji} ${f.title}`} active={format === f.id} onPress={() => setFormat(f.id)} />
        ))}
      </ScrollView>

      <View>
        <SectionLabel right={materials.length ? <Txt v="small" c={color.textMute}>{materials.length}</Txt> : undefined}>Материалы</SectionLabel>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {materials.map((m) => (
            <MaterialTile key={m.id} m={m} onRemove={() => removeMaterial(m.id)} />
          ))}
          <Pressable onPress={addPhotos} style={[styles.tile, styles.add]}>
            <Icon name="image" tint={color.volt} />
            <Txt v="small" c={color.textDim}>Скрины</Txt>
          </Pressable>
          <Pressable onPress={addAudio} style={[styles.tile, styles.add]}>
            <Icon name="mic" tint={color.volt} />
            <Txt v="small" c={color.textDim}>Аудио</Txt>
          </Pressable>
          <Pressable
            onPress={async () => addSnippet(await Clipboard.getStringAsync())}
            style={[styles.tile, styles.add]}>
            <Icon name="clipboard" tint={color.volt} />
            <Txt v="small" c={color.textDim}>Из буфера</Txt>
          </Pressable>
        </View>
      </View>

      <Glass pad={4}>
        <TextInput
          value={snippet}
          onChangeText={setSnippet}
          onSubmitEditing={() => addSnippet(snippet)}
          placeholder="Ссылка или обрывок текста → Enter"
          placeholderTextColor={color.textMute}
          style={styles.input}
          returnKeyType="done"
        />
      </Glass>

      <Glass pad={4}>
        <TextInput
          value={brief}
          onChangeText={setBrief}
          placeholder="Задача (необязательно): «для семей с детьми, акцент на школу рядом»"
          placeholderTextColor={color.textMute}
          style={[styles.input, { minHeight: 70 }]}
          multiline
        />
      </Glass>

      <Button title="Собрать" icon="zap" onPress={run} loading={busy} disabled={!materials.length && !brief.trim()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  tile: { width: 100, height: 100, borderRadius: 16, overflow: 'hidden', backgroundColor: color.glass, borderWidth: 1, borderColor: color.glassBorder },
  add: { alignItems: 'center', justifyContent: 'center', gap: 6, borderStyle: 'dashed' },
  remove: { position: 'absolute', top: 6, right: 6, width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  input: { color: color.text, fontFamily: font.body, fontSize: 15, padding: 12 },
});
