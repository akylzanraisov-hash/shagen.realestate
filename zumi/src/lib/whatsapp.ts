import { Linking } from 'react-native';

import { hasBackend } from './config';
import { callFunction } from './supabase';

export const cleanPhone = (p: string) => p.replace(/[^\d]/g, '');

/**
 * Schedule a WhatsApp message to the user's own number (server-side job,
 * delivered by the `whatsapp-dispatch` cron via WhatsApp Cloud API).
 */
export async function scheduleWhatsAppReminder(opts: {
  to: string;
  text: string;
  sendAt: Date;
}): Promise<string | undefined> {
  if (!hasBackend() || !opts.to) return undefined;
  try {
    const { id } = await callFunction<{ id: string }>('whatsapp-schedule', {
      to: cleanPhone(opts.to),
      text: opts.text,
      sendAt: opts.sendAt.toISOString(),
    });
    return id;
  } catch (e) {
    console.warn('whatsapp schedule failed', e);
    return undefined;
  }
}

/**
 * Message a client from the broker's connected WhatsApp Business number.
 * kind=client lets the server wrap it into an approved template when the
 * 24-hour customer-service window is closed.
 */
export async function sendToClient(opts: { to: string; text: string; sendAt?: Date; name?: string }) {
  if (!hasBackend()) return undefined;
  const { id } = await callFunction<{ id: string }>('whatsapp-schedule', {
    to: cleanPhone(opts.to),
    text: opts.text,
    sendAt: (opts.sendAt ?? new Date()).toISOString(),
    kind: 'client',
    name: opts.name,
  });
  return id;
}

/** Server-side automatic broadcast (optionally repeating, e.g. every morning). */
export async function scheduleBroadcast(opts: {
  recipients: { phone: string; name: string }[];
  text: string;
  sendAt?: Date;
  repeat?: 'daily' | 'weekdays' | 'weekly';
}) {
  const { id } = await callFunction<{ id: string }>('whatsapp-schedule', {
    batch: opts.recipients.map((r) => ({ to: cleanPhone(r.phone), name: r.name })),
    text: opts.text,
    sendAt: (opts.sendAt ?? new Date()).toISOString(),
    repeat: opts.repeat,
    kind: 'client',
  });
  return id;
}

export async function cancelWhatsAppReminder(id?: string) {
  if (!id || !hasBackend()) return;
  await callFunction('whatsapp-schedule', { cancelId: id }).catch(() => undefined);
}

/**
 * Open the user's own WhatsApp with a prefilled message to a client.
 * Works without a WhatsApp Business account — used for broadcasts one by one,
 * which also keeps the broker's number safe from spam bans.
 */
export async function openWhatsAppChat(phone: string, text: string) {
  const url = `https://wa.me/${cleanPhone(phone)}?text=${encodeURIComponent(text)}`;
  await Linking.openURL(url);
}

/** Personalise a template: {имя} → client's first name. */
export const personalise = (template: string, name: string) =>
  template.replace(/\{(имя|name)\}/gi, name.split(' ')[0]);

/** Send right away (server delivers immediately when sendAt is now). */
export const sendWhatsAppNow = (to: string, text: string) =>
  scheduleWhatsAppReminder({ to, text, sendAt: new Date() });

/** Compact WhatsApp-friendly digest: title, 2–3 lines of summary, to-dos, agreements. */
export function digestToWhatsApp(d: {
  title: string;
  summary: string;
  todos: { text: string; dueAt?: string }[];
  agreements: string[];
}, header = '📞 Итоги звонка') {
  const due = (iso?: string) =>
    iso ? ` — до ${new Date(iso).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}` : '';
  return [
    `${header}: *${d.title}*`,
    '',
    d.summary,
    d.todos.length ? `\n✅ *Задачи*\n${d.todos.map((t) => `• ${t.text}${due(t.dueAt)}`).join('\n')}` : '',
    d.agreements.length ? `\n🤝 *Договорились*\n${d.agreements.map((a) => `• ${a}`).join('\n')}` : '',
  ]
    .filter(Boolean)
    .join('\n')
    .slice(0, 3800);
}
