import Anthropic from 'npm:@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') });

/** Default model; override with the CLAUDE_MODEL secret if you want to trade quality for latency/cost. */
const MODEL = Deno.env.get('CLAUDE_MODEL') ?? 'claude-opus-5-5';

type Block = Anthropic.Beta.Messages.BetaContentBlockParam;

/**
 * One structured call: system + user content in, JSON matching `schema` out.
 * - structured outputs (output_config.format) guarantee parseable JSON
 * - effort "low" keeps voice commands snappy; digests/compose pass "medium"
 * - server-side refusal fallback ("default") so a safety decline doesn't break the flow
 */
export async function askJson<T>(opts: {
  system: string;
  content: string | Block[];
  schema: Record<string, unknown>;
  effort?: 'low' | 'medium' | 'high';
  maxTokens?: number;
}): Promise<T> {
  const params = {
    model: MODEL,
    max_tokens: opts.maxTokens ?? 8000,
    system: opts.system,
    messages: [{ role: 'user', content: opts.content }],
    output_config: {
      effort: opts.effort ?? 'low',
      format: { type: 'json_schema', schema: opts.schema },
    },
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
  };
  // The SDK's typings may lag the newest request fields; the API accepts them.
  // deno-lint-ignore no-explicit-any
  const res = await client.beta.messages.create(params as any);

  if (res.stop_reason === 'refusal') throw new Error('Запрос отклонён моделью');
  if (res.stop_reason === 'max_tokens') throw new Error('Ответ слишком длинный');
  const text = res.content
    .filter((b): b is Anthropic.Beta.Messages.BetaTextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('');
  return JSON.parse(text) as T;
}

/** Remove null / empty values the schema allowed, so the app gets clean optional fields. */
export function clean<T>(v: T): T {
  if (Array.isArray(v)) return v.map(clean) as T;
  if (v && typeof v === 'object') {
    return Object.fromEntries(
      Object.entries(v as Record<string, unknown>)
        .filter(([, x]) => x !== null && x !== undefined && x !== '')
        .map(([k, x]) => [k, clean(x)]),
    ) as T;
  }
  return v;
}

/** "2026-10-16T15:00:00+05:00" style local clock for the prompt. */
export function localClock(nowIso: string, tzOffsetMin: number) {
  const local = new Date(new Date(nowIso).getTime() + tzOffsetMin * 60000);
  const sign = tzOffsetMin >= 0 ? '+' : '-';
  const abs = Math.abs(tzOffsetMin);
  const off = `${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`;
  const weekday = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'][local.getUTCDay()];
  return { iso: `${local.toISOString().slice(0, 19)}${off}`, offset: off, weekday };
}
