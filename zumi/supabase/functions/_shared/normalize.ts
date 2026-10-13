const STAGES = ['lead', 'contact', 'showing', 'offer', 'deal', 'lost'];
const REPEATS = ['daily', 'weekdays', 'weekly'];

const validDate = (v: unknown) => typeof v === 'string' && !Number.isNaN(Date.parse(v));

/** Drop invalid enum values / dates the model might produce; keep the rest. */
export function normalizeAction(a: Record<string, unknown>) {
  if (a.stage && !STAGES.includes(a.stage as string)) delete a.stage;
  if (a.repeat && !REPEATS.includes(a.repeat as string)) delete a.repeat;
  if (a.at && !validDate(a.at)) delete a.at;
  return a;
}

export function normalizeDigest<T extends { todos: { dueAt?: string | null }[]; contact?: Record<string, unknown> | null }>(d: T): T {
  for (const t of d.todos) if (t.dueAt && !validDate(t.dueAt)) t.dueAt = null;
  if (d.contact) {
    if (d.contact.stage && !STAGES.includes(d.contact.stage as string)) delete d.contact.stage;
    if (d.contact.followUpAt && !validDate(d.contact.followUpAt)) delete d.contact.followUpAt;
  }
  return d;
}
