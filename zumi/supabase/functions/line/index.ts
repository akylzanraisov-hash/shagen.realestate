// «Линия Zumi»: provision a personal recorded number, or start a click-to-call.
import { HttpError, json, requireUser, serve } from '../_shared/http.ts';
import { fnUrl, twilio, twilioGet } from '../_shared/twilio.ts';

interface Body {
  action: 'provision' | 'call';
  ownerPhone: string;
  ownerName?: string;
  to?: string;
  clientName?: string;
}

serve(async (req, body: Body) => {
  const { user, sb } = await requireUser(req);
  const owner = `+${(body.ownerPhone ?? '').replace(/\D/g, '')}`;
  if (owner.length < 9) throw new HttpError(400, 'owner phone required');

  const { data: existing } = await sb.from('lines').select('*').eq('user_id', user.id).maybeSingle();

  if (body.action === 'provision') {
    if (existing) {
      await sb.from('lines').update({ owner_phone: owner, owner_name: body.ownerName }).eq('user_id', user.id);
      return json({ number: existing.number });
    }
    const country = Deno.env.get('TWILIO_NUMBER_COUNTRY') ?? 'US';
    const avail = await twilioGet(`/AvailablePhoneNumbers/${country}/Local.json?VoiceEnabled=true&PageSize=1`);
    const candidate = avail.available_phone_numbers?.[0]?.phone_number;
    if (!candidate) throw new HttpError(503, `no numbers available in ${country}`);
    const bought = await twilio('/IncomingPhoneNumbers.json', {
      PhoneNumber: candidate,
      FriendlyName: `Zumi ${body.ownerName ?? user.id}`.slice(0, 64),
      VoiceUrl: fnUrl('call-twiml', { mode: 'inbound' }),
      VoiceMethod: 'POST',
    });
    await sb.from('lines').insert({ user_id: user.id, number: bought.phone_number, twilio_sid: bought.sid, owner_phone: owner, owner_name: body.ownerName });
    return json({ number: bought.phone_number });
  }

  if (body.action === 'call') {
    if (!existing) throw new HttpError(412, 'line not provisioned');
    const to = `+${(body.to ?? '').replace(/\D/g, '')}`;
    if (to.length < 9) throw new HttpError(400, 'client phone required');
    // Ring the broker first; when they pick up, call-twiml bridges to the client and records.
    const call = await twilio('/Calls.json', {
      To: owner,
      From: existing.number,
      Url: fnUrl('call-twiml', { mode: 'outbound', uid: user.id, to, name: body.clientName ?? '' }),
      Method: 'POST',
    });
    return json({ sid: call.sid });
  }

  throw new HttpError(400, 'unknown action');
});
