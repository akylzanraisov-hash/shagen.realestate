import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, useWindowDimensions, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { Button, Txt, success } from '@/components/ui';
import { Wave } from '@/components/Wave';
import { hasBackend } from '@/lib/config';
import { processAudio, processText } from '@/lib/pipeline';
import { takePendingShare } from '@/lib/shareInbox';
import { useStore } from '@/lib/store';
import { color } from '@/theme/tokens';

/**
 * Anything shared to Zumi lands here and is processed with zero questions:
 *  audio (voice notes, call recordings) → transcript → digest → client card → WhatsApp
 *  text (forwarded chat)                → digest → client card
 *  images / links                       → Studio materials
 */
export default function Incoming() {
  const { width } = useWindowDimensions();
  const [status, setStatus] = useState('Разбираю…');
  const [error, setError] = useState('');

  useEffect(() => {
    const share = takePendingShare();
    if (!share) {
      router.back();
      return;
    }
    (async () => {
      try {
        const files = share.files ?? [];
        const audio = files.find((f) => f.mimeType.startsWith('audio/') || /\.(ogg|opus|m4a|mp3|wav|aac|amr)$/i.test(f.fileName));
        const images = files.filter((f) => f.mimeType.startsWith('image/'));

        if (audio) {
          if (!hasBackend()) throw new Error('Расшифровка аудио работает после подключения сервера');
          // short voice notes (WhatsApp/Telegram .ogg/.opus) vs. call recordings
          const isVoiceNote = /ogg|opus/i.test(audio.mimeType + audio.fileName);
          setStatus(isVoiceNote ? 'Слушаю голосовое…' : 'Расшифровываю звонок…');
          const { digest } = await processAudio(audio.path, {
            kind: isVoiceNote ? 'voice' : 'call',
            source: 'shared-audio',
            mime: audio.mimeType,
          });
          success();
          router.replace({ pathname: '/digest/[id]', params: { id: digest.id } });
          return;
        }

        if (images.length) {
          const add = useStore.getState().addMaterial;
          images.forEach((f) => add({ kind: 'image', uri: f.path, mime: f.mimeType }));
          if (share.text) add({ kind: share.webUrl ? 'link' : 'text', text: share.webUrl ?? share.text });
          router.replace('/compose');
          return;
        }

        if (share.webUrl && (share.text ?? '').trim() === share.webUrl) {
          useStore.getState().addMaterial({ kind: 'link', text: share.webUrl });
          router.replace('/compose');
          return;
        }

        if (share.text?.trim()) {
          setStatus('Читаю переписку…');
          const { digest } = await processText(share.text, { kind: 'chat', source: 'shared-text' });
          success();
          router.replace({ pathname: '/digest/[id]', params: { id: digest.id } });
          return;
        }
        throw new Error('Не удалось прочитать файл');
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    })();
  }, []);

  return (
    <Screen scroll={false}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        {error ? (
          <>
            <Txt v="h2">Не получилось</Txt>
            <Txt v="body" c={color.textDim} style={{ textAlign: 'center' }}>{error}</Txt>
            <Button title="Закрыть" kind="ink" onPress={() => router.back()} />
          </>
        ) : (
          <>
            <Wave width={width - 40} height={140} calm={0.5} speed={2} />
            <Txt v="h2">{status}</Txt>
            <Txt v="small" c={color.textDim} style={{ textAlign: 'center' }}>
              Сделаю выжимку, обновлю карточку клиента и пришлю итоги в WhatsApp
            </Txt>
            <ActivityIndicator color={color.ultra} />
          </>
        )}
      </View>
    </Screen>
  );
}
