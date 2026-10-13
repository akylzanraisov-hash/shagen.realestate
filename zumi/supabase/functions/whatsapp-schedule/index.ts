// Queue WhatsApp messages: reminders to the user, messages and (repeating) broadcasts to clients.
// Messages due now are delivered immediately; the rest by whatsapp-dispatch (cron, every minute).
import { HttpError, json, requireUser, serve } from '../_shared/http.ts';
import { personalise, senderFor, sendWhatsApp } from '../_shared/whatsapp.ts';

interface Body {
  status?: boolean;
  cancelId?: string;
  to?: string;
  name?: string;
  batch?: { to: string; name?: string }[];
  text?: string;
  sendAt?: string;
  kind?: 'self' | 'client';
  repeat?: 'daily' | 'weekdays' | 'weekly';
}

serve(async (req, body: Body) => {
  const { user, sb } = await requireUser(req);
  const sender = await senderFor(sb, user.id);

  if (body.status) return json({ connected: !!sender });

  if (body.cancelId) {
    await sb.from('wa_jobs').update({ status: 'cancelled' }).or(`id.eq.${body.cancelId},batch_id.eq.${body.cancelId}`).eq('user_id', user.id).eq('status', 'pending');
    return json({ ok: true });
  }

  if (!sender) throw new HttpError(412, 'WhatsApp sender is not configured');
  if (!body.text?.trim()) throw new HttpError(400, 'empty text');

  const kind = body.kind ?? 'self';
  const sendAt = body.sendAt ? new Date(body.sendAt) : new Date();
  const recipients = body.batch ?? (body.to ? [{ to: body.to, name: body.name }] : []);
  if (!recipients.length) throw new HttpError(400, 'no recipients');
  if (recipients.length > 500) throw new HttpError(400, 'too many recipients');

  const batchId = recipients.length > 1 ? crypto.randomUUID() : null;
  const rows = recipients.map((r) => ({
    user_id: user.id,
    batch_id: batchId,
    to_phone: r.to.replace(/\D/g, ''),
    name: r.name ?? null,
    text: personalise(body.text!, r.name),
    kind,
    send_at: sendAt.toISOString(),
    repeat: body.repeat ?? null,
  }));
  const { data, error } = await sb.from('wa_jobs').insert(rows).select('id');
  if (error) throw error;

  // due now → send right away (small batches inline, big ones left to the dispatcher)
  if (sendAt.getTime() <= Date.now() + 30_000 && rows.length <= 20) {
    await Promise.all(
      rows.map(async (r, i) => {
        try {
          await sendWhatsApp(sender, r.to_phone, r.text, kind);
          await sb.from('wa_jobs').update(r.repeat ? { send_at: nextRun(new Date(r.send_at), r.repeat).toISOString() } : { status: 'sent' }).eq('id', data![i].id);
        } catch (e) {
          await sb.from('wa_jobs').update({ status: 'failed', error: String(e).slice(0, 500) }).eq('id', data![i].id);
        }
      }),
    );
  }
  return json({ id: batchId ?? data![0].id });
});

function nextRun(from: Date, repeat: 'daily' | 'weekdays' | 'weekly') {
  const d = new Date(from);
  d.setUTCDate(d.getUTCDate() + (repeat === 'weekly' ? 7 : 1));
  if (repeat === 'weekdays') while ([0, 6].includes(d.getUTCDay())) d.setUTCDate(d.getUTCDate() + 1);
  return d;
}
