/**
 * «Привет, Зуми» — hands-free wake word (Picovoice Porcupine, on-device, works offline).
 *
 * The keyword (.ppn) and Russian model (.pv) are trained once in Picovoice Console
 * and hosted anywhere (e.g. Supabase Storage). They are downloaded on first use,
 * so the wake phrase can be changed without an app release.
 */
import { PorcupineManager } from '@picovoice/porcupine-react-native';
import { File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

const env = {
  accessKey: process.env.EXPO_PUBLIC_PICOVOICE_ACCESS_KEY ?? '',
  keywordUrl:
    Platform.OS === 'ios'
      ? (process.env.EXPO_PUBLIC_WAKEWORD_IOS_URL ?? '')
      : (process.env.EXPO_PUBLIC_WAKEWORD_ANDROID_URL ?? ''),
  modelUrl: process.env.EXPO_PUBLIC_WAKEWORD_MODEL_URL ?? '',
};

export const wakeWordAvailable = () =>
  Platform.OS !== 'web' && !!env.accessKey && !!env.keywordUrl && !!env.modelUrl;

async function cached(url: string, name: string) {
  const f = new File(Paths.document, name);
  if (!f.exists) await File.downloadFileAsync(url, f, { idempotent: true });
  return f.uri.replace('file://', '');
}

export async function createWakeWord(onWake: () => void, onError: (e: unknown) => void) {
  if (!wakeWordAvailable()) return null;
  const keyword = await cached(env.keywordUrl, `zumi-wake-${Platform.OS}.ppn`);
  const model = await cached(env.modelUrl, 'porcupine_params_ru.pv');
  return PorcupineManager.fromKeywordPaths(env.accessKey, [keyword], () => onWake(), onError, model, undefined, [0.6]);
}
