import { encodeBase64, decodeBase64 } from 'jsr:@std/encoding@1/base64';

import { env } from './http.ts';

const EL = 'https://api.elevenlabs.io/v1';

interface ScribeWord {
  text: string;
  type?: 'word' | 'spacing' | 'audio_event';
  speaker_id?: string;
}

/**
 * ElevenLabs Scribe speech-to-text. With `speakers` the transcript is split
 * into «Спикер 1: … / Спикер 2: …» turns (calls, meetings).
 */
export async function speechToText(audio: Uint8Array, mime: string, speakers = false): Promise<string> {
  const form = new FormData();
  form.append('file', new Blob([new Uint8Array(audio)], { type: mime }), `audio.${mime.split('/')[1] ?? 'm4a'}`);
  form.append('model_id', Deno.env.get('ELEVENLABS_STT_MODEL') ?? 'scribe_v1');
  form.append('language_code', 'rus');
  form.append('tag_audio_events', 'false');
  if (speakers) form.append('diarize', 'true');

  const res = await fetch(`${EL}/speech-to-text`, {
    method: 'POST',
    headers: { 'xi-api-key': env('ELEVENLABS_API_KEY') },
    body: form,
  });
  if (!res.ok) throw new Error(`STT ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { text: string; words?: ScribeWord[] };
  if (!speakers || !data.words?.length) return data.text;

  const ids: string[] = [];
  const turns: { speaker: string; text: string }[] = [];
  for (const w of data.words) {
    if (w.type === 'audio_event') continue;
    const sp = w.speaker_id ?? 'speaker_0';
    if (!ids.includes(sp)) ids.push(sp);
    const last = turns[turns.length - 1];
    if (last && last.speaker === sp) last.text += w.text;
    else if (w.type !== 'spacing') turns.push({ speaker: sp, text: w.text });
  }
  return turns.map((t) => `Спикер ${ids.indexOf(t.speaker) + 1}: ${t.text.trim()}`).join('\n');
}

/** ElevenLabs text-to-speech → mp3 bytes. */
export async function textToSpeech(text: string): Promise<Uint8Array> {
  const voice = Deno.env.get('ELEVENLABS_VOICE_ID') ?? 'EXAVITQu4vr4xnSDxMaL';
  const res = await fetch(`${EL}/text-to-speech/${voice}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': env('ELEVENLABS_API_KEY'), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      model_id: Deno.env.get('ELEVENLABS_TTS_MODEL') ?? 'eleven_multilingual_v2',
      voice_settings: { stability: 0.45, similarity_boost: 0.8 },
    }),
  });
  if (!res.ok) throw new Error(`TTS ${res.status}: ${await res.text()}`);
  return new Uint8Array(await res.arrayBuffer());
}

export { encodeBase64, decodeBase64 };
