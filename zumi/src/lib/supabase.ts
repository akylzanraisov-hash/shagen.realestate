import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { config, hasBackend } from './config';

let client: SupabaseClient | null = null;

export function supabase(): SupabaseClient | null {
  if (!hasBackend()) return null;
  if (!client) {
    client = createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: { storage: AsyncStorage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
    });
  }
  return client;
}

/** Every device gets an anonymous Supabase user so Edge Functions can verify the JWT and rate-limit. */
export async function ensureSession(): Promise<string | null> {
  const sb = supabase();
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  if (data.session) return data.session.access_token;
  const { data: signed, error } = await sb.auth.signInAnonymously();
  if (error) throw error;
  return signed.session?.access_token ?? null;
}

export async function callFunction<T>(name: string, body: unknown): Promise<T> {
  const token = await ensureSession();
  if (!token) throw new Error('backend-not-configured');
  const res = await fetch(`${config.supabaseUrl}/functions/v1/${name}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: config.supabaseAnonKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${name} ${res.status}: ${await res.text()}`);
  return (await res.json()) as T;
}
