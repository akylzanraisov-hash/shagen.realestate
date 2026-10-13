import { encodeBase64 } from 'jsr:@std/encoding@1/base64';

import { env } from './http.ts';

const API = () => `https://api.twilio.com/2010-04-01/Accounts/${env('TWILIO_ACCOUNT_SID')}`;
const auth = () => `Basic ${btoa(`${env('TWILIO_ACCOUNT_SID')}:${env('TWILIO_AUTH_TOKEN')}`)}`;

export const fnUrl = (name: string, params: Record<string, string> = {}) => {
  const u = new URL(`${env('SUPABASE_URL')}/functions/v1/${name}`);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  return u.toString();
};

export async function twilio(path: string, form: Record<string, string>, method = 'POST') {
  const res = await fetch(`${API()}${path}`, {
    method,
    headers: { Authorization: auth(), 'Content-Type': 'application/x-www-form-urlencoded' },
    body: method === 'GET' ? undefined : new URLSearchParams(form),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Twilio ${res.status}: ${data.message ?? JSON.stringify(data)}`);
  return data;
}

export async function twilioGet(path: string) {
  const res = await fetch(`${API()}${path}`, { headers: { Authorization: auth() } });
  const data = await res.json();
  if (!res.ok) throw new Error(`Twilio ${res.status}: ${data.message ?? JSON.stringify(data)}`);
  return data;
}

/** Download a call recording (mp3) — needs the account credentials. */
export async function downloadRecording(recordingUrl: string): Promise<Uint8Array> {
  const res = await fetch(`${recordingUrl}.mp3`, { headers: { Authorization: auth() } });
  if (!res.ok) throw new Error(`recording ${res.status}`);
  return new Uint8Array(await res.arrayBuffer());
}

export async function deleteRecording(sid: string) {
  await fetch(`${API()}/Recordings/${sid}.json`, { method: 'DELETE', headers: { Authorization: auth() } });
}

/**
 * Verify X-Twilio-Signature: base64(HMAC-SHA1(authToken, url + sorted(key+value)...)).
 * The public URL is what Twilio called — behind Supabase's proxy we rebuild it from SUPABASE_URL.
 */
export async function verifyTwilio(req: Request, params: URLSearchParams): Promise<boolean> {
  const sig = req.headers.get('X-Twilio-Signature');
  if (!sig) return false;
  const incoming = new URL(req.url);
  const name = incoming.pathname.split('/').filter(Boolean).pop();
  const url = `${env('SUPABASE_URL')}/functions/v1/${name}${incoming.search}`;
  const data = url + [...params.keys()].sort().map((k) => k + params.get(k)).join('');
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(env('TWILIO_AUTH_TOKEN')), { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data)));
  return encodeBase64(mac) === sig;
}

export const xml = (body: string) =>
  new Response(`<?xml version="1.0" encoding="UTF-8"?><Response>${body}</Response>`, { headers: { 'Content-Type': 'text/xml' } });

export const esc = (s: string) => s.replace(/[<>&"']/g, (c) => `&#${c.charCodeAt(0)};`);
