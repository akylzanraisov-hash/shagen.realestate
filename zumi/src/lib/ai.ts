import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { File, Paths } from 'expo-file-system';
import * as Speech from 'expo-speech';

import { answerAgenda, isAgendaQuestion } from './agenda';
import { config, hasBackend } from './config';
import { localCompose, localDigest } from './localDigest';
import { localAssistant } from './localParser';
import { useStore } from './store';
import type { AssistantResult, CreationFormat, DigestResult, Material } from './types';
import { callFunction } from './supabase';
import { uploadAudio } from './upload';

const guessMime = (uri: string, mime?: string) => {
  if (mime) return mime;
  const ext = uri.split('?')[0].split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'webm': return 'audio/webm';
    case 'ogg':
    case 'opus': return 'audio/ogg'; // WhatsApp / Telegram voice notes
    case 'mp3': return 'audio/mpeg';
    case 'wav': return 'audio/wav';
    case 'aac': return 'audio/aac';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'png': return 'image/png';
    case 'heic': return 'image/heic';
    default: return 'audio/mp4';
  }
};

const INLINE_LIMIT = 4 * 1024 * 1024; // bigger files go through Storage

/**
 * Speech-to-text (ElevenLabs Scribe on the server). Accepts any local audio file:
 * dictation, WhatsApp/Telegram voice notes, call and meeting recordings.
 * `speakers` turns on diarization ("Спикер 1: …") for calls.
 */
export async function transcribe(audioUri: string, mime?: string, speakers = false): Promise<string> {
  if (!hasBackend()) throw new Error('backend-not-configured');
  const file = new File(audioUri);
  const type = guessMime(audioUri, mime);
  const size = file.size ?? 0;
  if (size > INLINE_LIMIT) {
    const path = await uploadAudio(audioUri, type);
    const { text } = await callFunction<{ text: string }>('transcribe', { path, mime: type, speakers });
    return text;
  }
  const audio = await file.base64();
  const { text } = await callFunction<{ text: string }>('transcribe', { audio, mime: type, speakers });
  return text;
}

const tzContext = () => {
  const now = new Date();
  return { now: now.toISOString(), tzOffsetMin: -now.getTimezoneOffset() };
};

/**
 * "Выжимка смыслов" + Memory Box in one call: summary, to-dos with deadlines,
 * agreements and (if a person is involved) the contact-card update.
 * mode=memory biases the model towards updating the contact card.
 */
export async function digest(text: string, mode: 'digest' | 'memory' = 'digest'): Promise<DigestResult> {
  if (!hasBackend()) return localDigest(text);
  const s = useStore.getState();
  try {
    return await callFunction<DigestResult>('digest', {
      text,
      mode,
      ...tzContext(),
      clients: s.clients.slice(0, 120).map((c) => ({ name: c.name, phone: c.phone, stage: c.stage })),
    });
  } catch (e) {
    console.warn('digest failed, local fallback', e);
    return localDigest(text);
  }
}

/** Studio: turn a pile of screenshots / links / snippets into a finished piece. */
export async function compose(
  format: CreationFormat,
  materials: Material[],
  brief?: string,
): Promise<{ title: string; body: string }> {
  if (!hasBackend()) return localCompose(format, materials, brief);
  const images = await Promise.all(
    materials
      .filter((m) => m.kind === 'image' && m.uri)
      .slice(0, 6)
      .map(async (m) => ({ data: await new File(m.uri!).base64(), mime: guessMime(m.uri!, m.mime) })),
  );
  try {
    return await callFunction('compose', {
      format,
      brief,
      profile: { name: useStore.getState().profile.name },
      texts: materials.filter((m) => m.kind === 'text' || m.kind === 'audio').map((m) => m.text).filter(Boolean),
      links: materials.filter((m) => m.kind === 'link').map((m) => m.text).filter(Boolean),
      images,
    });
  } catch (e) {
    console.warn('compose failed, local fallback', e);
    return localCompose(format, materials, brief);
  }
}

/** Publish a creation as a public page and get a short link to send to a client. */
export async function publish(title: string, body: string): Promise<string | undefined> {
  if (!hasBackend()) return undefined;
  const { slug } = await callFunction<{ slug: string }>('publish', {
    title,
    body,
    author: useStore.getState().profile.name,
  });
  return `${config.shareBaseUrl}/${slug}`;
}

/** Turn an utterance into structured actions + a short spoken reply. */
export async function think(raw: string): Promise<AssistantResult> {
  // "Привет, Зуми, …" / "Зуми, …" — the name is an address, not content
  const transcript = raw.replace(/^\s*(привет|эй|хей)?[,\s]*(зуми|zumi|зумми)[,!.\s]*/i, '').trim() || raw;
  // schedule questions are answered from local data: instant, exact, offline
  if (isAgendaQuestion(transcript)) return answerAgenda(transcript);
  if (!hasBackend()) return localAssistant(transcript);
  const s = useStore.getState();
  const now = new Date();
  try {
    return await callFunction<AssistantResult>('assistant', {
      transcript,
      now: now.toISOString(),
      tzOffsetMin: -now.getTimezoneOffset(),
      locale: 'ru',
      profile: { name: s.profile.name, role: s.profile.role },
      // compact context so the model can resolve "Ивану", "встреча в пятницу" etc.
      clients: s.clients.slice(0, 80).map((c) => ({
        name: c.name,
        stage: c.stage,
        phone: c.phone,
        interest: c.interest,
      })),
      upcoming: s.items
        .filter((i) => i.at && !i.done && new Date(i.at) > now)
        .slice(0, 30)
        .map((i) => ({ kind: i.kind, title: i.title, at: i.at })),
      history: s.chat.slice(-8).map((m) => ({ role: m.role, text: m.text })),
    });
  } catch (e) {
    console.warn('assistant failed, falling back to local parser', e);
    return localAssistant(transcript);
  }
}

let currentPlayer: ReturnType<typeof createAudioPlayer> | null = null;

/** Speak a reply with the ElevenLabs voice; falls back to the phone's built-in Russian voice. */
export async function speak(text: string) {
  if (!text) return;
  const fallback = () => Speech.speak(text, { language: 'ru-RU', rate: 1.0 });
  if (!hasBackend()) return fallback();
  try {
    const { audio } = await callFunction<{ audio: string }>('speak', { text });
    const out = new File(Paths.cache, `zumi-${Date.now()}.mp3`);
    out.create({ overwrite: true });
    out.write(audio, { encoding: 'base64' });
    await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false });
    currentPlayer?.remove();
    currentPlayer = createAudioPlayer(out.uri);
    currentPlayer.play();
  } catch (e) {
    console.warn('tts failed, using device voice', e);
    fallback();
  }
}

export function stopSpeaking() {
  currentPlayer?.pause();
  Speech.stop();
}
