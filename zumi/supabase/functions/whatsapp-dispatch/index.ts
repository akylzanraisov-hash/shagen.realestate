// Cron (every minute): deliver due WhatsApp jobs, reschedule repeating ones.
import { admin, env, json } from '../_shared/http.ts';
import { senderFor, sendWhatsApp } from '../_shared/whatsapp.ts';

const nextRun = (from: Date, repeat: string) => {
  const d = new Date(from);
  d.setUTCDate(d.getUTCDate() + (repeat === 'weekly' ? 7 : 1));
  if (repeat === 'weekdays') while ([0, 6].includes(d.getUTCDay())) d.setUTCDate(d.getUTCDate() + 1);
  return d;
};

Deno.serve(async (req) => {
  // only the cron job (service role key) may call this
  if (req.headers.get('Authorization') !== `Bearer ${env('SUPABASE_SERVICE_ROLE_KEY')}`) return json({ error: 'forbidden' }, 403);
  const sb = admin();
  const { data: jobs } = await sb
    .from('wa_jobs')
    .select('*')
    .eq('status', 'pending')
    .lte('send_at', new Date().toISOString())
    .order('send_at')
    .limit(80);

  let sent = 0;
  for (const j of jobs ?? []) {
    const sender = await senderFor(sb, j.user_id);
    if (!sender) {
      await sb.from('wa_jobs').update({ status: 'failed', error: 'no sender' }).eq('id', j.id);
      continue;
    }
    try {
      await sendWhatsApp(sender, j.to_phone, j.text, j.kind);
      await sb.from('wa_jobs').update(j.repeat ? { send_at: nextRun(new Date(j.send_at), j.repeat).toISOString() } : { status: 'sent' }).eq('id', j.id);
      sent++;
    } catch (e) {
      await sb.from('wa_jobs').update({ status: 'failed', error: String(e).slice(0, 500) }).eq('id', j.id);
    }
  }
  return json({ sent });
});
