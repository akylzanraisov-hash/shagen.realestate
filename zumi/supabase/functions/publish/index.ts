// Studio → public page with a short link (served by share-viewer/).
import { HttpError, json, requireUser, serve } from '../_shared/http.ts';

const ALPHABET = 'abcdefghijkmnpqrstuvwxyz23456789';
const slug = () => Array.from(crypto.getRandomValues(new Uint8Array(7)), (b) => ALPHABET[b % ALPHABET.length]).join('');

serve(async (req, body: { title: string; body: string; author?: string }) => {
  const { user, sb } = await requireUser(req);
  if (!body.title || !body.body) throw new HttpError(400, 'empty');
  for (let i = 0; i < 5; i++) {
    const s = slug();
    const { error } = await sb.from('pages').insert({ slug: s, user_id: user.id, title: body.title.slice(0, 200), body: body.body.slice(0, 20000), author: body.author?.slice(0, 80) });
    if (!error) return json({ slug: s });
  }
  throw new Error('could not allocate slug');
});
