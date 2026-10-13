// Voice command → structured actions + short spoken reply.
import { askJson, clean, localClock } from '../_shared/claude.ts';
import { json, requireUser, serve } from '../_shared/http.ts';
import { normalizeAction } from '../_shared/normalize.ts';
import { ASSISTANT_SCHEMA, assistantSystem } from '../_shared/prompts.ts';

interface Body {
  transcript: string;
  now: string;
  tzOffsetMin: number;
  profile?: { name?: string; role?: string };
  clients?: { name: string; stage: string; phone?: string; interest?: string }[];
  upcoming?: { kind: string; title: string; at: string }[];
  history?: { role: string; text: string }[];
}

serve(async (req, body: Body) => {
  await requireUser(req);
  if (!body.transcript?.trim()) return json({ transcript: '', reply: '', actions: [] });

  const clock = localClock(body.now, body.tzOffsetMin);
  const context = [
    body.clients?.length ? `Клиенты:\n${body.clients.map((c) => `- ${c.name} (${c.stage}${c.phone ? `, ${c.phone}` : ''}${c.interest ? `, ищет: ${c.interest}` : ''})`).join('\n')}` : 'Клиентов пока нет.',
    body.upcoming?.length ? `Ближайшие дела:\n${body.upcoming.map((u) => `- ${u.at} ${u.kind}: ${u.title}`).join('\n')}` : 'Ближайших дел нет.',
    body.history?.length ? `Недавний диалог:\n${body.history.map((h) => `${h.role === 'user' ? 'Пользователь' : 'Zumi'}: ${h.text}`).join('\n')}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  const out = await askJson<{ reply: string; actions: Record<string, unknown>[] }>({
    system: assistantSystem({ clock, userName: body.profile?.name, role: body.profile?.role }),
    content: `<context>\n${context}\n</context>\n\n<speech>\n${body.transcript}\n</speech>`,
    schema: ASSISTANT_SCHEMA,
    effort: 'low',
  });

  const actions = clean(out.actions).map(normalizeAction);
  return json({ transcript: body.transcript, reply: out.reply, actions });
});
