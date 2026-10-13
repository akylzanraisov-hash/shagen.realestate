// Studio: screenshots + links + snippets + voice transcripts → one finished text.
import { askJson } from '../_shared/claude.ts';
import { json, requireUser, serve } from '../_shared/http.ts';
import { COMPOSE_SCHEMA, composeSystem } from '../_shared/prompts.ts';

interface Body {
  format: string;
  brief?: string;
  profile?: { name?: string };
  texts?: string[];
  links?: string[];
  images?: { data: string; mime: string }[];
}

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

/** Fetch a page and keep only readable text (titles, paragraphs). */
async function readLink(url: string): Promise<string> {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 ZumiBot' }, signal: AbortSignal.timeout(8000) });
    const html = await res.text();
    const title = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? '';
    const meta = html.match(/<meta[^>]+(?:name|property)=["'](?:og:)?description["'][^>]+content=["']([^"']+)/i)?.[1] ?? '';
    const body = html
      .replace(/<(script|style|noscript|svg)[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ')
      .trim();
    return `${title}\n${meta}\n${body}`.slice(0, 6000);
  } catch {
    return '(страница не открылась)';
  }
}

serve(async (req, body: Body) => {
  await requireUser(req);
  const links = await Promise.all((body.links ?? []).slice(0, 5).map(async (u) => `<link url="${u}">\n${await readLink(u)}\n</link>`));

  // deno-lint-ignore no-explicit-any
  const content: any[] = [];
  for (const img of (body.images ?? []).slice(0, 6)) {
    if (!IMAGE_TYPES.includes(img.mime)) continue; // HEIC etc. are skipped (picker already converts to JPEG)
    content.push({ type: 'image', source: { type: 'base64', media_type: img.mime, data: img.data } });
  }
  content.push({
    type: 'text',
    text: [
      body.profile?.name ? `Автор: ${body.profile.name}` : '',
      body.brief ? `<task>${body.brief}</task>` : '',
      ...(body.texts ?? []).map((t) => `<note>\n${t}\n</note>`),
      ...links,
      content.length ? 'Выше — скриншоты/фото. Извлеки из них факты.' : '',
    ]
      .filter(Boolean)
      .join('\n\n') || 'Материалов нет — сделай шаблон по задаче.',
  });

  const out = await askJson<{ title: string; body: string }>({
    system: composeSystem(body.format),
    content,
    schema: COMPOSE_SCHEMA,
    effort: 'medium',
    maxTokens: 12000,
  });
  return json(out);
});
