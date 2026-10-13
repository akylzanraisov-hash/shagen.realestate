// Twilio recording callback → transcript → digest → calls row → WhatsApp summary + follow-up reminders.
// Runs in the background (EdgeRuntime.waitUntil) so Twilio gets its 200 immediately.
import { askJson, clean, localClock } from '../_shared/claude.ts';
import { admin } from '../_shared/http.ts';
import { normalizeDigest } from '../_shared/normalize.ts';
import { DIGEST_SCHEMA, digestSystem } from '../_shared/prompts.ts';
import { deleteRecording, downloadRecording, verifyTwilio } from '../_shared/twilio.ts';
import { speechToText } from '../_shared/voice.ts';
import { digestText, senderFor, sendWhatsApp } from '../_shared/whatsapp.ts';

declare const EdgeRuntime: { waitUntil(p: Promise<unknown>): void };

const TZ_OFFSET_MIN = Number(Deno.env.get('DEFAULT_TZ_OFFSET_MIN') ?? 300); // Almaty / Astana, UTC+5
const TZ_NAME = Deno.env.get('DEFAULT_TZ') ?? 'Asia/Almaty';
const MIN_SECONDS = 15; // skip missed calls / voicemail beeps

async function process(q: URLSearchParams, p: URLSearchParams) {
  const sb = admin();
  const uid = q.get('uid')!;
  const sid = p.get('RecordingSid')!;
  const duration = Number(p.get('RecordingDuration') ?? 0);
  const peer = q.get('peer') ?? '';
  const direction = q.get('dir') === 'outbound' ? 'outbound' : 'inbound';

  const { data: dup } = await sb.from('calls').select('id').eq('recording_sid', sid).maybeSingle();
  if (dup) return;
  if (duration < MIN_SECONDS) {
    await deleteRecording(sid);
    return;
  }

  const audio = await downloadRecording(p.get('RecordingUrl')!);
  const transcript = await speechToText(audio, 'audio/mpeg', true);
  await deleteRecording(sid); // privacy: keep only the transcript

  const clock = localClock(new Date().toISOString(), TZ_OFFSET_MIN);
  const name = q.get('name');
  // deno-lint-ignore no-explicit-any
  const digest = normalizeDigest(clean(await askJson<any>({
    system: digestSystem({ clock, mode: 'call' }),
    content: `Телефон собеседника: ${peer}${name ? ` (в базе: ${name})` : ''}. Направление: ${direction === 'inbound' ? 'клиент позвонил' : 'пользователь позвонил клиенту'}.\n<transcript>\n${transcript}\n</transcript>`,
    schema: DIGEST_SCHEMA,
    effort: 'medium',
  })));
  if (digest.contact && name && !digest.contact.name) digest.contact.name = name;

  await sb.from('calls').insert({ user_id: uid, direction, counterpart: peer, duration_sec: duration, recording_sid: sid, transcript, digest });

  // WhatsApp: short summary now + reminders for dated to-dos / follow-up
  const { data: line } = await sb.from('lines').select('owner_phone').eq('user_id', uid).single();
  const sender = await senderFor(sb, uid);
  if (!sender || !line) return;
  const who = digest.contact?.name ?? peer;
  await sendWhatsApp(sender, line.owner_phone, digestText(digest, `📞 Звонок · ${who}`, TZ_NAME), 'self');

  const reminders = [
    ...digest.todos.filter((t: { dueAt?: string }) => t.dueAt).map((t: { text: string; dueAt: string }) => ({ text: `⏰ ${t.text} (${who})`, at: t.dueAt })),
    ...(digest.contact?.followUpAt ? [{ text: `🔁 Фоллоу-ап: ${who}${digest.contact.followUpWhat ? ` — ${digest.contact.followUpWhat}` : ''}`, at: digest.contact.followUpAt }] : []),
  ].filter((r) => new Date(r.at).getTime() > Date.now());
  if (reminders.length) {
    await sb.from('wa_jobs').insert(reminders.map((r) => ({ user_id: uid, to_phone: line.owner_phone.replace(/\D/g, ''), text: r.text, kind: 'self', send_at: new Date(new Date(r.at).getTime() - 30 * 60000).toISOString() })));
  }
}

Deno.serve(async (req) => {
  const p = new URLSearchParams(await req.text());
  if (!(await verifyTwilio(req, p))) return new Response('forbidden', { status: 403 });
  if (p.get('RecordingStatus') !== 'completed') return new Response('ok');
  const q = new URL(req.url).searchParams;
  EdgeRuntime.waitUntil(process(q, p).catch((e) => console.error('call processing failed', e)));
  return new Response('ok');
});
