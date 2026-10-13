import { File } from 'expo-file-system';

import { supabase } from './supabase';

/**
 * Long recordings (calls, meetings) go to Supabase Storage first; Edge Functions
 * then pull them by path. Keeps request bodies small and works for 1h+ audio.
 */
export async function uploadAudio(uri: string, mime: string): Promise<string | null> {
  const sb = supabase();
  if (!sb) return null;
  const { data: user } = await sb.auth.getUser();
  if (!user.user) return null;
  const ext = uri.split('?')[0].split('.').pop() ?? 'm4a';
  const path = `${user.user.id}/${Date.now()}.${ext}`;
  const body = await new File(uri).arrayBuffer();
  const { error } = await sb.storage.from('audio').upload(path, body, { contentType: mime, upsert: false });
  if (error) throw error;
  return path;
}
