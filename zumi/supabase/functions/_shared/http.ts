import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';

export const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

export const env = (k: string, fallback?: string) => {
  const v = Deno.env.get(k) ?? fallback;
  if (v === undefined) throw new Error(`Missing secret ${k}`);
  return v;
};

/** Service-role client: bypasses RLS, server only. */
export const admin = (): SupabaseClient =>
  createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false } });

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** Resolve the calling user from the JWT and enforce a daily request budget. */
export async function requireUser(req: Request, dailyLimit = Number(Deno.env.get('DAILY_LIMIT') ?? 600)) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) throw new HttpError(401, 'no token');
  const sb = admin();
  const { data, error } = await sb.auth.getUser(token);
  if (error || !data.user) throw new HttpError(401, 'bad token');
  const { data: ok } = await sb.rpc('bump_usage', { p_user: data.user.id, p_limit: dailyLimit });
  if (ok === false) throw new HttpError(429, 'daily limit reached');
  return { user: data.user, sb };
}

/** Wraps a handler with CORS, JSON body parsing and error mapping. */
export function serve(handler: (req: Request, body: any) => Promise<Response>) {
  Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
    try {
      const body = req.headers.get('content-type')?.includes('application/json') ? await req.json() : {};
      return await handler(req, body);
    } catch (e) {
      if (e instanceof HttpError) return json({ error: e.message }, e.status);
      console.error(e);
      return json({ error: e instanceof Error ? e.message : String(e) }, 500);
    }
  });
}
