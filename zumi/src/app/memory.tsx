import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';

import { Glass } from '@/components/chrome';
import { Screen } from '@/components/Screen';
import { Button, Chip, IconButton, Txt, success } from '@/components/ui';
import { Wave } from '@/components/Wave';
import { transcribe } from '@/lib/ai';
import { hasBackend } from '@/lib/config';
import { processText } from '@/lib/pipeline';
import { useStore } from '@/lib/store';
import { useVoice } from '@/lib/useVoice';
import { color, font } from '@/theme/tokens';

/**
 * Memory Box: dictate a meeting recap or paste a chat — Zumi updates the
 * client card (who, interests, agreements, follow-up) on its own.
 */
export default function Memory() {
  const { clientId } = useLocalSearchParams<{ clientId?: string }>();
  const client = useStore((s) => (clientId ? s.clients.find((c) => c.id === clientId) : undefined));
  const { width } = useWindowDimensions();
  const voice = useVoice();
  const [text, setText] = useState('');
  const [kind, setKind] = useState<'meeting' | 'chat'>('meeting');
  const [busy, setBusy] = useState(false);

  const toggleMic = async () => {
    if (voice.isRecording) {
      const uri = await voice.stop();
      if (!uri || !hasBackend()) return;
      setBusy(true);
      try {
        const t = await transcribe(uri);
        setText((prev) => (prev ? `${prev}\n${t}` : t));
      } finally {
        setBusy(false);
      }
    } else {
      await voice.start();
    }
  };

  const run = async () => {
    setBusy(true);
    try {
      const input = client ? `Клиент: ${client.name}${client.phone ? ` (${client.phone})` : ''}.\n${text}` : text;
      const { digest, sentToWhatsApp } = await processText(input, { kind, source: kind === 'chat' ? 'shared-text' : 'dictation' });
      success();
      router.replace({ pathname: '/digest/[id]', params: { id: digest.id } });
      if (sentToWhatsApp) Alert.alert('Готово', 'Карточка обновлена, выжимка отправлена вам в WhatsApp');
    } catch (e) {
      Alert.alert('Не получилось', String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen header={<IconButton name="x" onPress={() => router.back()} />}>
      <Txt v="h1">{client ? client.name : 'Memory Box'}</Txt>
      <Txt v="body" c={color.textDim} style={{ marginTop: -8 }}>
        Расскажите, как прошла встреча, или вставьте переписку. Zumi сама обновит карточку: о чём говорили, что интересно, на чём сошлись и когда напомнить.
      </Txt>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Chip label="🎙 Итоги встречи" active={kind === 'meeting'} onPress={() => setKind('meeting')} />
        <Chip label="💬 Переписка" active={kind === 'chat'} onPress={() => setKind('chat')} />
      </View>

      {voice.isRecording ? (
        <Glass tint={color.ultra}>
          <View style={{ alignItems: 'center', gap: 8 }}>
            <Wave width={width - 80} height={80} level={voice.level} calm={0.1} />
            <Txt v="label" c={color.flare}>● Запись — нажмите микрофон, чтобы закончить</Txt>
          </View>
        </Glass>
      ) : (
        <Glass pad={4}>
          <TextInput
            multiline
            value={text}
            onChangeText={setText}
            placeholder={kind === 'chat' ? 'Вставьте сюда переписку из WhatsApp/Telegram…' : 'Например: Встретился с Ерланом, смотрели 3-комнатную на Аль-Фараби. Понравилось, но дорого. Договорились, что я найду варианты до 80 млн и напишу в четверг…'}
            placeholderTextColor={color.textMute}
            style={styles.input}
          />
        </Glass>
      )}

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <IconButton name={voice.isRecording ? 'square' : 'mic'} size={56} bg={voice.isRecording ? color.flare : color.glassStrong} onPress={toggleMic} />
        <Button
          title="Вставить из буфера"
          kind="ink"
          icon="clipboard"
          style={{ flex: 1 }}
          onPress={async () => {
            const clip = await Clipboard.getStringAsync();
            if (clip) {
              setKind('chat');
              setText((p) => (p ? `${p}\n${clip}` : clip));
            }
          }}
        />
      </View>
      <Button title="Разобрать и обновить карточку" icon="zap" onPress={run} loading={busy} disabled={!text.trim() || voice.isRecording} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: { color: color.text, fontFamily: font.body, fontSize: 16, minHeight: 200, padding: 14, textAlignVertical: 'top' },
});
