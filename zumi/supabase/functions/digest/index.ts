// «Выжимка смыслов» + Memory Box: summary, to-dos with deadlines, agreements, contact-card update.
import { askJson, clean, localClock } from '../_shared/claude.ts';
import { json, requireUser, serve } from '../_shared/http.ts';
import { normalizeDigest } from '../_shared/normalize.ts';
import { DIGEST_SCHEMA, digestSystem } from '../_shared/prompts.ts';

serve(async (req, body: { text: string; mode?: 'digest' | 'memory'; now: string; tzOffsetMin: number; clients?: { name: string; phone?: string }[] }) => {
  await requireUser(req);
  const clock = localClock(body.now, body.tzOffsetMin);
  const known = body.clients?.length ? `Известные клиенты (сопоставь имя, если это кто-то из них):\n${body.clients.map((c) => `- ${c.name}${c.phone ? ` ${c.phone}` : ''}`).join('\n')}\n\n` : '';
  // deno-lint-ignore no-explicit-any
  const out = await askJson<any>({
    system: digestSystem({ clock, mode: body.mode ?? 'digest' }),
    content: `${known}<source>\n${body.text}\n</source>`,
    schema: DIGEST_SCHEMA,
    effort: 'medium',
  });
  return json(clean(normalizeDigest(out)));
});
