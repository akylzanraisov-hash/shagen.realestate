import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Backdrop, Glass } from '@/components/chrome';
import { Button, Chip, Icon, IconButton, Txt, success, thud } from '@/components/ui';
import { Wave } from '@/components/Wave';
import { speak, think, transcribe } from '@/lib/ai';
import { hasBackend } from '@/lib/config';
import { executeAction, undoResult, type ExecResult } from '@/lib/execute';
import { whenLabel } from '@/lib/format';
import { processText } from '@/lib/pipeline';
import { FREE_MONTHLY_COMMANDS, useStore } from '@/lib/store';
import type { Action } from '@/lib/types';
import { useVoice } from '@/lib/useVoice';
import { color, font, kindColor } from '@/theme/tokens';

type Mode = 'command' | 'digest' | 'meeting';
type Phase = 'listening' | 'typing' | 'thinking' | 'done' | 'error';

const MODE_META: Record<Mode, { title: string; hint: string }> = {
  command: { title: 'Слушаю', hint: '«Встреча с Иваном в пятницу в 15:00», «напомни завтра в 9 позвонить нотариусу»' },
  digest: { title: 'Выжимка', hint: 'Говорите свободно — я соберу summary, задачи с дедлайнами и договорённости' },
  meeting: { title: 'Запись звонка', hint: 'Включите громкую связь и положите телефон рядом. Итоги прилетят в WhatsApp' },
};

function actionView(a: Action): { tint: string; kind: string; title: string; meta?: string } {
  switch (a.type) {
    case 'create_event':
      return { tint: kindColor.event, kind: 'Встреча → календарь', title: a.title, meta: whenLabel(a.at) + (a.clientName ? ` · ${a.clientName}` : '') };
    case 'create_reminder':
      return { tint: kindColor.reminder, kind: 'Напоминание', title: a.title, meta: whenLabel(a.at) };
    case 'create_task':
      return { tint: kindColor.task, kind: 'Задача', title: a.title, meta: a.at ? whenLabel(a.at) : undefined };
    case 'create_note':
      return { tint: kindColor.note, kind: 'Заметка', title: a.title, meta: a.clientName ? `в карточку: ${a.clientName}` : undefined };
    case 'upsert_client':
      return { tint: kindColor.client, kind: 'Клиент → CRM', title: a.name, meta: [a.phone, a.budget, a.interest].filter(Boolean).join(' · ') };
    case 'send_message':
      return { tint: color.aqua, kind: `Сообщение → ${a.clientName}`, title: a.text, meta: a.at ? whenLabel(a.at) : undefined };
    case 'broadcast':
      return {
        tint: kindColor.broadcast,
        kind: 'Рассылка',
        title: a.text,
        meta: a.at ? `${whenLabel(a.at)}${a.repeat ? (a.repeat === 'daily' ? ' · каждый день' : a.repeat === 'weekdays' ? ' · по будням' : ' · каждую неделю') : ''}` : undefined,
      };
    case 'open_app':
      return { tint: color.aqua, kind: 'Открыть', title: a.clientName ? `Позвонить: ${a.clientName}` : a.app };
    case 'answer':
      return { tint: color.ultra, kind: 'Ответ', title: a.text };
  }
}

export default function Capture() {
  const params = useLocalSearchParams<{ mode?: Mode }>();
  const mode: Mode = params.mode ?? 'command';
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const voice = useVoice();
  const [phase, setPhase] = useState<Phase>(Platform.OS === 'web' ? 'typing' : 'listening');
  const [text, setText] = useState('');
  const [reply, setReply] = useState('');
  const [, setActions] = useState<Action[]>([]);
  const [results, setResults] = useState<ExecResult[]>([]);
  const [undoneIdx, setUndoneIdx] = useState<number[]>([]);
  const [error, setError] = useState('');

  const { isPro, usage, bumpUsage, profile } = useStore();
  const overLimit = !isPro && usage.month === new Date().toISOString().slice(0, 7) && usage.count >= FREE_MONTHLY_COMMANDS;

  useEffect(() => {
    if (overLimit) {
      router.replace('/paywall');
      return;
    }
    if (mode === 'meeting' && !isPro) {
      router.replace({ pathname: '/paywall', params: { reason: 'calls' } });
      return;
    }
    if (phase === 'listening') {
      voice.start().then((ok) => {
        if (!ok) setPhase('typing');
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handle = async (transcript: string) => {
    if (!transcript.trim()) {
      setPhase('typing');
      return;
    }
    setText(transcript);
    setPhase('thinking');
    bumpUsage();
    try {
      if (mode === 'digest' || mode === 'meeting') {
        const { digest } = await processText(transcript, {
          kind: mode === 'meeting' ? 'call' : 'voice',
          source: 'dictation',
          whatsapp: mode === 'meeting',
        });
        success();
        router.replace({ pathname: '/digest/[id]', params: { id: digest.id } });
        return;
      }
      // Full automation: everything Zumi understood is applied right away;
      // the user can undo a single line on the result screen.
      const r = await think(transcript);
      setReply(r.reply);
      setActions(r.actions);
      const out: ExecResult[] = [];
      for (const a of r.actions) out.push(await executeAction(a, transcript));
      setResults(out);
      setPhase('done');
      success();
      const isAnswer = r.actions.every((a) => a.type === 'answer');
      if (profile.voiceReplies || isAnswer) speak(r.reply);
      if (r.actions.length && r.actions.every((a) => a.type === 'open_app')) {
        router.back();
        return;
      }
      const br = out.find((x) => x.broadcastId && !x.autoSent);
      if (br) router.replace({ pathname: '/broadcast/[id]', params: { id: br.broadcastId! } });
    } catch (e) {
      setError(String(e));
      setPhase('error');
    }
  };

  const stopAndProcess = async () => {
    thud();
    const uri = await voice.stop();
    if (!uri) return setPhase('typing');
    if (!hasBackend()) {
      // Offline: no STT — ask to type what was said.
      setPhase('typing');
      return;
    }
    setPhase('thinking');
    try {
      const t = await transcribe(uri, undefined, mode === 'meeting');
      await handle(t);
    } catch (e) {
      setError(String(e));
      setPhase('error');
    }
  };

  const undo = async (i: number) => {
    await undoResult(results[i]);
    setUndoneIdx([...undoneIdx, i]);
  };

  const meta = MODE_META[mode];
  const mm = Math.floor(voice.durationMs / 60000);
  const ss = Math.floor((voice.durationMs % 60000) / 1000);

  return (
    <View style={{ flex: 1 }}>
      <Backdrop />
      <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
        <IconButton name="x" onPress={async () => { await voice.stop(); router.back(); }} />
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {(['command', 'digest', 'meeting'] as Mode[]).map((m) => (
            <Chip
              key={m}
              label={m === 'command' ? 'Команда' : m === 'digest' ? 'Выжимка' : 'Звонок'}
              active={m === mode}
              onPress={() => router.setParams({ mode: m })}
            />
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40, gap: 18, flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        {(phase === 'listening' || phase === 'thinking') && (
          <View style={styles.center}>
            <Txt v="label" c={phase === 'listening' ? color.volt : color.ultra}>
              {phase === 'listening' ? `● ${meta.title} · ${mm}:${String(ss).padStart(2, '0')}` : 'Думаю…'}
            </Txt>
            <Wave width={width - 40} height={180} level={voice.level} calm={phase === 'thinking' ? 0.5 : 0.12} speed={phase === 'thinking' ? 2.2 : 1} />
            {phase === 'listening' ? (
              <>
                <Txt v="body" c={color.textDim} style={{ textAlign: 'center', maxWidth: 320 }}>
                  {meta.hint}
                </Txt>
                <Pressable onPress={stopAndProcess} style={({ pressed }) => [styles.stop, { transform: [{ scale: pressed ? 0.94 : 1 }] }]}>
                  <View style={styles.stopInner} />
                </Pressable>
                <Pressable onPress={async () => { await voice.stop(); setPhase('typing'); }}>
                  <Txt v="small" c={color.textMute}>Написать текстом</Txt>
                </Pressable>
              </>
            ) : (
              <>
                {text ? <Txt v="body" c={color.textDim} style={{ textAlign: 'center' }}>«{text}»</Txt> : null}
                <ActivityIndicator color={color.ultra} />
              </>
            )}
          </View>
        )}

        {phase === 'typing' && (
          <View style={{ gap: 14, marginTop: 20 }}>
            <Txt v="h1">{mode === 'command' ? 'Что сделать?' : 'Что обсудили?'}</Txt>
            {!hasBackend() ? (
              <Txt v="small" c={color.sun}>
                Офлайн-режим: распознавание речи включится после подключения сервера. Пока можно написать текстом.
              </Txt>
            ) : null}
            <Glass pad={4}>
              <TextInput
                autoFocus
                multiline
                value={text}
                onChangeText={setText}
                placeholder={meta.hint}
                placeholderTextColor={color.textMute}
                style={styles.input}
              />
            </Glass>
            <Button title="Готово" icon="arrow-right" onPress={() => handle(text)} disabled={!text.trim()} />
          </View>
        )}

        {phase === 'done' && (
          <View style={[styles.center, { gap: 16 }]}>
            <View style={styles.doneBadge}>
              <Icon name="check" size={34} tint={color.ink} />
            </View>
            <Txt v="h1" style={{ textAlign: 'center' }}>Сделано</Txt>
            {reply ? (
              <Txt v="body" c={color.textDim} style={{ textAlign: 'center' }}>
                {reply}
              </Txt>
            ) : null}
            <View style={{ gap: 10, alignSelf: 'stretch' }}>
              {results.map((r, i) => {
                const v = actionView(r.action);
                const undone = undoneIdx.includes(i);
                return (
                  <Animated.View key={i} entering={FadeInDown.delay(80 * i).duration(300)}>
                    <Glass style={{ opacity: undone ? 0.4 : 1 }}>
                      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                        <View style={{ width: 3, alignSelf: 'stretch', borderRadius: 2, backgroundColor: v.tint }} />
                        <View style={{ flex: 1, gap: 3 }}>
                          <Txt v="label" c={v.tint}>{v.kind}</Txt>
                          <Txt v="h3">{v.title}</Txt>
                          {v.meta ? <Txt v="small" c={color.textDim}>{v.meta}</Txt> : null}
                          {r.error ? <Txt v="small" c={color.flare}>⚠ {r.error}</Txt> : null}
                          {r.wired.length ? (
                            <Txt v="small" c={color.volt} style={{ fontFamily: font.bodyBold }}>✓ {r.wired.join(' · ')}</Txt>
                          ) : null}
                        </View>
                        {r.action.type !== 'answer' && !undone ? (
                          <Pressable onPress={() => undo(i)} hitSlop={10}>
                            <Txt v="small" c={color.textMute}>Отменить</Txt>
                          </Pressable>
                        ) : null}
                      </View>
                    </Glass>
                  </Animated.View>
                );
              })}
            </View>
            <Button title="Ещё команда" icon="mic" onPress={() => { setText(''); setPhase('listening'); voice.start(); }} style={{ alignSelf: 'stretch' }} />
            <Button title="Закрыть" kind="ghost" onPress={() => router.back()} style={{ alignSelf: 'stretch' }} />
          </View>
        )}

        {phase === 'error' && (
          <View style={[styles.center, { gap: 14 }]}>
            <Txt v="h2">Не получилось</Txt>
            <Txt v="small" c={color.textDim} style={{ textAlign: 'center' }}>{error}</Txt>
            <Button title="Написать текстом" kind="ink" onPress={() => setPhase('typing')} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 22 },
  stop: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    borderColor: color.flare,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopInner: { width: 30, height: 30, borderRadius: 8, backgroundColor: color.flare },
  input: { color: color.text, fontFamily: font.body, fontSize: 18, minHeight: 140, padding: 14, textAlignVertical: 'top' },
  doneBadge: { width: 76, height: 76, borderRadius: 38, backgroundColor: color.volt, alignItems: 'center', justifyContent: 'center' },
});
