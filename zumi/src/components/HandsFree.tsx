import type { PorcupineManager } from '@picovoice/porcupine-react-native';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { speak, think, transcribe } from '@/lib/ai';
import { executeAction } from '@/lib/execute';
import { useStore } from '@/lib/store';
import { useVoice } from '@/lib/useVoice';
import { createWakeWord } from '@/lib/wakeword';
import { color } from '@/theme/tokens';

import { Glass } from './chrome';
import { Txt, success, thud } from './ui';
import { Wave } from './Wave';

type Phase = 'sleep' | 'listening' | 'thinking' | 'said';

const SILENCE_DB = -38;
const SILENCE_MS = 1400;
const MAX_MS = 20000;

/**
 * Always-on «Привет, Зуми». Wake word → record until the user stops talking →
 * understand → apply → answer out loud («Записала задачу на пятницу, 10:00»).
 * Mounted at the root while profile.handsFree is on; keeps working with the
 * screen locked on iOS (background audio mode).
 */
export function HandsFree() {
  const insets = useSafeAreaInsets();
  const voice = useVoice();
  const [phase, setPhase] = useState<Phase>('sleep');
  const [said, setSaid] = useState('');
  const porcupine = useRef<PorcupineManager | null>(null);
  const heardSpeech = useRef(false);
  const lastLoud = useRef(0);
  const startedAt = useRef(0);

  const sleep = async () => {
    setPhase('sleep');
    try {
      await porcupine.current?.start();
    } catch (e) {
      console.warn('wake restart', e);
    }
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const pm = await createWakeWord(
          async () => {
            thud();
            await porcupine.current?.stop(); // free the microphone for the recorder
            heardSpeech.current = false;
            lastLoud.current = Date.now();
            startedAt.current = Date.now();
            setPhase('listening');
            const ok = await voice.start();
            if (!ok) sleep();
          },
          (e) => console.warn('wake error', e),
        );
        if (!alive || !pm) return pm?.delete();
        porcupine.current = pm;
        await pm.start();
        activateKeepAwakeAsync('zumi-handsfree').catch(() => undefined);
      } catch (e) {
        console.warn('hands-free init failed', e);
      }
    })();
    return () => {
      alive = false;
      porcupine.current?.stop().finally(() => porcupine.current?.delete());
      porcupine.current = null;
      deactivateKeepAwake('zumi-handsfree');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finish = async () => {
    setPhase('thinking');
    const uri = await voice.stop();
    try {
      if (!uri || !heardSpeech.current) return sleep();
      const text = await transcribe(uri);
      if (!text.trim()) return sleep();
      useStore.getState().bumpUsage();
      const r = await think(text);
      for (const a of r.actions) await executeAction(a, text);
      success();
      setSaid(r.reply);
      setPhase('said');
      await speak(r.reply || 'Готово');
      setTimeout(sleep, 2500);
    } catch (e) {
      console.warn('hands-free command failed', e);
      speak('Не расслышала, повторите, пожалуйста');
      sleep();
    }
  };

  // end-of-speech detection
  useEffect(() => {
    if (phase !== 'listening' || !voice.isRecording) return;
    const now = Date.now();
    const db = voice.metering ?? -60;
    if (db > SILENCE_DB) {
      heardSpeech.current = true;
      lastLoud.current = now;
    }
    const silentFor = now - lastLoud.current;
    if ((heardSpeech.current && silentFor > SILENCE_MS) || now - startedAt.current > MAX_MS || (!heardSpeech.current && silentFor > 5000)) {
      finish();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voice.metering, phase, voice.isRecording]);

  if (phase === 'sleep') return null;

  return (
    <Animated.View entering={FadeInUp} exiting={FadeOutUp} style={[styles.wrap, { top: insets.top + 6 }]} pointerEvents="none">
      <Glass tint={color.ultra} pad={12}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Wave width={70} height={34} level={voice.level} calm={phase === 'thinking' ? 0.6 : 0.2} speed={phase === 'thinking' ? 2 : 1} />
          <View style={{ flex: 1 }}>
            <Txt v="label" c={color.volt}>
              {phase === 'listening' ? 'Слушаю' : phase === 'thinking' ? 'Записываю…' : 'Готово'}
            </Txt>
            <Txt v="small" numberOfLines={2}>
              {phase === 'said' ? said : 'Говорите — я сама пойму, когда вы закончите'}
            </Txt>
          </View>
        </View>
      </Glass>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 12, right: 12, zIndex: 100 },
});
