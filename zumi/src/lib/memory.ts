import { executeAction } from './execute';
import { findClientByName, useStore } from './store';
import type { ClientTouch, Digest, DigestResult } from './types';

/**
 * Persist a digest and fan it out:
 *  - Memory Box: create / update the contact card (interests, agreements, history)
 *  - follow-up → reminder (calendar push + WhatsApp)
 *  - optionally every dated to-do → reminder
 */
export async function applyDigest(
  r: DigestResult,
  transcript: string,
  source: Digest['source'],
  opts: { via?: ClientTouch['via']; scheduleTodos?: boolean } = {},
): Promise<Digest> {
  const s = useStore.getState();
  let clientId: string | undefined;

  if (r.contact?.name) {
    const existing = findClientByName(r.contact.name);
    const client = s.upsertClient({
      id: existing?.id,
      name: existing?.name ?? r.contact.name,
      phone: r.contact.phone,
      stage: r.contact.stage,
      budget: r.contact.budget,
      interests: r.contact.interests,
      agreements: r.contact.agreements,
      touches: [{ at: new Date().toISOString(), summary: r.contact.summary, via: opts.via ?? 'voice' }],
    });
    clientId = client.id;

    if (r.contact.followUpAt && new Date(r.contact.followUpAt) > new Date()) {
      const res = await executeAction(
        {
          type: 'create_reminder',
          title: `Фоллоу-ап: ${client.name}${r.contact.followUpWhat ? ` — ${r.contact.followUpWhat}` : ''}`,
          at: r.contact.followUpAt,
          clientName: client.name,
        },
        transcript,
      );
      useStore.getState().updateClient(client.id, { followUpAt: r.contact.followUpAt, followUpItemId: res.itemId });
    }
  }

  const todos = await Promise.all(
    r.todos.map(async (t) => {
      if (opts.scheduleTodos && t.dueAt && new Date(t.dueAt) > new Date()) {
        const res = await executeAction({ type: 'create_reminder', title: t.text, at: t.dueAt }, transcript);
        return { ...t, itemId: res.itemId };
      }
      return { ...t };
    }),
  );

  return useStore.getState().addDigest({
    title: r.title,
    summary: r.summary,
    todos,
    agreements: r.agreements,
    clientId,
    transcript,
    source,
  });
}
