/**
 * "Линия Zumi" — a personal business number (Twilio).
 *
 *  • Clients call this number (put it in listings / business cards) → it rings
 *    the broker's mobile, the call is recorded automatically.
 *  • The broker taps "Позвонить" in a client card → Zumi calls the broker first,
 *    then connects the client; recorded automatically.
 *
 * After every call the server transcribes it, writes a digest, updates the
 * client and sends a short summary to the broker's WhatsApp. The app only
 * pulls those processed calls into the local Memory Box (syncCalls).
 */
import { hasBackend } from './config';
import { applyDigest } from './memory';
import { useStore } from './store';
import { callFunction, supabase } from './supabase';
import type { DigestResult } from './types';
import { cleanPhone } from './whatsapp';

export async function provisionLine(): Promise<string> {
  const { profile } = useStore.getState();
  if (!profile.whatsapp) throw new Error('Укажите свой номер в профиле');
  const { number } = await callFunction<{ number: string }>('line', {
    action: 'provision',
    ownerPhone: cleanPhone(profile.whatsapp),
    ownerName: profile.name,
  });
  useStore.getState().setProfile({ lineNumber: number });
  return number;
}

/** Click-to-call through the recorded line. Your phone rings first — pick up and Zumi connects the client. */
export async function callViaLine(clientPhone: string, clientName?: string) {
  const { profile } = useStore.getState();
  if (!profile.whatsapp) throw new Error('Укажите свой номер в профиле');
  await callFunction('line', {
    action: 'call',
    ownerPhone: cleanPhone(profile.whatsapp),
    to: cleanPhone(clientPhone),
    clientName,
  });
}

interface CallRow {
  id: string;
  created_at: string;
  direction: 'inbound' | 'outbound';
  counterpart: string | null;
  duration_sec: number | null;
  transcript: string | null;
  digest: DigestResult | null;
}

/** Pull calls processed on the server into local digests + client cards. */
export async function syncCalls(): Promise<number> {
  const sb = supabase();
  if (!hasBackend() || !sb) return 0;
  const { data, error } = await sb
    .from('calls')
    .select('id, created_at, direction, counterpart, duration_sec, transcript, digest')
    .eq('synced', false)
    .not('digest', 'is', null)
    .order('created_at', { ascending: true })
    .limit(50);
  if (error || !data) return 0;
  for (const row of data as CallRow[]) {
    const d = row.digest!;
    if (d.contact && row.counterpart && !d.contact.phone) d.contact.phone = `+${cleanPhone(row.counterpart)}`;
    if (!d.contact && row.counterpart) {
      // unknown caller: still create a card so nothing gets lost
      d.contact = { name: `+${cleanPhone(row.counterpart)}`, phone: `+${cleanPhone(row.counterpart)}`, summary: d.summary };
    }
    // reminders were already scheduled into WhatsApp by the server; only local ones here
    await applyDigest(d, row.transcript ?? '', 'shared-audio', { via: 'meeting', scheduleTodos: true });
    await sb.from('calls').update({ synced: true }).eq('id', row.id);
  }
  return data.length;
}
