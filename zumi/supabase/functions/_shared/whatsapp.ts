import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';

/**
 * WhatsApp Business Cloud API (Meta).
 *
 * Free-form text is only allowed inside the 24h customer-service window.
 * Outside it Meta requires an approved template, so every send tries text
 * first and falls back to a template:
 *   WA_TEMPLATE_SELF   (to the broker, e.g. "zumi_note":   "{{1}}")
 *   WA_TEMPLATE_CLIENT (to clients,    e.g. "zumi_message": "Здравствуйте! {{1}}")
 */
const GRAPH = 'https://graph.facebook.com/v21.0';

interface Sender {
  phoneNumberId: string;
  token: string;
}

export async function senderFor(sb: SupabaseClient, userId: string | null): Promise<Sender | null> {
  if (userId) {
    const { data } = await sb.from('wa_accounts').select('phone_number_id, access_token').eq('user_id', userId).maybeSingle();
    if (data) return { phoneNumberId: data.phone_number_id, token: data.access_token };
  }
  const id = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
  const token = Deno.env.get('WHATSAPP_TOKEN');
  return id && token ? { phoneNumberId: id, token } : null;
}

async function post(s: Sender, payload: unknown) {
  const res = await fetch(`${GRAPH}/${s.phoneNumberId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${s.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

/** Template params can't contain newlines/tabs or 4+ spaces. */
const flatten = (t: string) => t.replace(/[\n\t]+/g, ' · ').replace(/ {4,}/g, ' ').slice(0, 1000);

export async function sendWhatsApp(s: Sender, to: string, text: string, kind: 'self' | 'client' = 'self') {
  const digits = to.replace(/\D/g, '');
  const first = await post(s, {
    messaging_product: 'whatsapp',
    to: digits,
    type: 'text',
    text: { body: text.slice(0, 4096), preview_url: true },
  });
  if (first.ok) return first.data;

  const template = Deno.env.get(kind === 'self' ? 'WA_TEMPLATE_SELF' : 'WA_TEMPLATE_CLIENT');
  if (!template) throw new Error(`WhatsApp: ${JSON.stringify(first.data)}`);
  const second = await post(s, {
    messaging_product: 'whatsapp',
    to: digits,
    type: 'template',
    template: {
      name: template,
      language: { code: Deno.env.get('WA_TEMPLATE_LANG') ?? 'ru' },
      components: [{ type: 'body', parameters: [{ type: 'text', text: flatten(text) }] }],
    },
  });
  if (!second.ok) throw new Error(`WhatsApp template: ${JSON.stringify(second.data)}`);
  return second.data;
}

export const personalise = (template: string, name?: string | null) =>
  template.replace(/\{(имя|name)\}/gi, name ? name.split(' ')[0] : '').replace(/,\s*!/, '!');

export function digestText(
  d: { title: string; summary: string; todos: { text: string; dueAt?: string | null }[]; agreements: string[] },
  header: string,
  tz?: string,
) {
  const due = (iso?: string | null) =>
    iso ? ` — до ${new Date(iso).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: tz })}` : '';
  return [
    `${header}: *${d.title}*`,
    d.summary,
    d.todos.length ? `✅ *Задачи*\n${d.todos.map((t) => `• ${t.text}${due(t.dueAt)}`).join('\n')}` : '',
    d.agreements.length ? `🤝 *Договорились*\n${d.agreements.map((a) => `• ${a}`).join('\n')}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');
}
