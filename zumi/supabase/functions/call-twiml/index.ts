// Twilio voice webhook. Deployed with verify_jwt = false; authenticated by X-Twilio-Signature.
//  inbound : a client calls the Zumi line → announce recording → ring the broker → record both sides
//  outbound: the broker picked up our callback → announce → dial the client → record both sides
import { admin } from '../_shared/http.ts';
import { esc, fnUrl, verifyTwilio, xml } from '../_shared/twilio.ts';

const NOTICE = Deno.env.get('CALL_RECORDING_NOTICE') ?? 'Разговор записывается для качества обслуживания.';

Deno.serve(async (req) => {
  const params = new URLSearchParams(await req.text());
  if (!(await verifyTwilio(req, params))) return new Response('forbidden', { status: 403 });

  const q = new URL(req.url).searchParams;
  const sb = admin();

  if (q.get('mode') === 'outbound') {
    const uid = q.get('uid')!;
    const to = q.get('to')!;
    const { data: line } = await sb.from('lines').select('number').eq('user_id', uid).single();
    const cb = fnUrl('call-recording', { uid, dir: 'outbound', peer: to, name: q.get('name') ?? '' });
    return xml(
      `<Say language="ru-RU">Соединяю.</Say>` +
        `<Dial callerId="${esc(line!.number)}" record="record-from-answer-dual" recordingStatusCallback="${esc(cb)}" recordingStatusCallbackEvent="completed">` +
        `<Number url="${esc(fnUrl('call-twiml', { mode: 'notice' }))}">${esc(to)}</Number></Dial>`,
    );
  }

  if (q.get('mode') === 'notice') {
    // played to the client when they answer an outbound call
    return xml(`<Say language="ru-RU">${esc(NOTICE)}</Say>`);
  }

  // inbound
  const calledLine = params.get('To') ?? '';
  const caller = params.get('From') ?? '';
  const { data: line } = await sb.from('lines').select('user_id, owner_phone').eq('number', calledLine).maybeSingle();
  if (!line) return xml(`<Say language="ru-RU">Номер не обслуживается.</Say><Hangup/>`);
  const cb = fnUrl('call-recording', { uid: line.user_id, dir: 'inbound', peer: caller });
  return xml(
    `<Say language="ru-RU">${esc(NOTICE)}</Say>` +
      `<Dial callerId="${esc(caller)}" timeout="25" record="record-from-answer-dual" recordingStatusCallback="${esc(cb)}" recordingStatusCallbackEvent="completed">` +
      `<Number>${esc(line.owner_phone)}</Number></Dial>`,
  );
});
