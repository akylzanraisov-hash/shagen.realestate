import { digest, transcribe } from './ai';
import { applyDigest } from './memory';
import { useStore } from './store';
import type { ClientTouch, Digest } from './types';
import { digestToWhatsApp, sendWhatsAppNow } from './whatsapp';

export type SourceKind = 'call' | 'meeting' | 'voice' | 'chat';

const HEADERS: Record<SourceKind, string> = {
  call: '📞 Итоги звонка',
  meeting: '🤝 Итоги встречи',
  voice: '🎙 Выжимка',
  chat: '💬 Итоги переписки',
};

/**
 * Text → digest → Memory Box → (optional) short summary to the user's WhatsApp.
 */
export async function processText(
  text: string,
  opts: { kind: SourceKind; source: Digest['source']; whatsapp?: boolean },
): Promise<{ digest: Digest; sentToWhatsApp: boolean }> {
  const mode = opts.kind === 'voice' ? 'digest' : 'memory';
  const result = await digest(text, mode);
  const via: ClientTouch['via'] = opts.kind === 'chat' ? 'chat' : opts.kind === 'voice' ? 'voice' : 'meeting';
  const d = await applyDigest(result, text, opts.source, { via, scheduleTodos: true });

  const { profile, isPro } = useStore.getState();
  let sent = false;
  if (opts.whatsapp !== false && isPro && profile.whatsapp && profile.whatsappReminders) {
    sent = !!(await sendWhatsAppNow(profile.whatsapp, digestToWhatsApp(result, HEADERS[opts.kind])));
  }
  return { digest: d, sentToWhatsApp: sent };
}

/** Audio file (call recording, meeting, voice note) → transcript → processText. */
export async function processAudio(
  uri: string,
  opts: { kind: SourceKind; source: Digest['source']; mime?: string; whatsapp?: boolean },
) {
  const transcript = await transcribe(uri, opts.mime, opts.kind === 'call' || opts.kind === 'meeting');
  if (!transcript.trim()) throw new Error('empty-transcript');
  return processText(transcript, opts);
}
