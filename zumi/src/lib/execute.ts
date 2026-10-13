import { openApp } from './apps';
import { addToCalendar, removeFromCalendar } from './calendar';
import { nowIso } from './id';
import { cancelLocal, scheduleLocal } from './notify';
import { findClientByName, useStore } from './store';
import type { Action, Item } from './types';
import {
  cancelWhatsAppReminder,
  openWhatsAppChat,
  scheduleBroadcast,
  scheduleWhatsAppReminder,
  sendToClient,
} from './whatsapp';

const timeFmt = (d: Date) =>
  d.toLocaleString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });

export interface ExecResult {
  action: Action;
  itemId?: string;
  clientId?: string;
  broadcastId?: string;
  /** true when upsert_client created a brand-new card (so undo may delete it) */
  createdClient?: boolean;
  /** broadcast went out (or is scheduled) on the server — no manual queue needed */
  autoSent?: boolean;
  /** something prevented the action (e.g. no phone number) */
  error?: string;
  /** human readable list of what was wired up: "календарь", "push", "WhatsApp" */
  wired: string[];
}

/**
 * Applies one confirmed action: writes to the store and fans out to the
 * device calendar, local push and the WhatsApp reminder queue.
 */
export async function executeAction(action: Action, transcript?: string): Promise<ExecResult> {
  const s = useStore.getState();
  const { profile } = s;
  const wired: string[] = [];
  const pro = s.isPro;

  const resolveClient = (name?: string) => {
    if (!name) return undefined;
    return findClientByName(name) ?? s.upsertClient({ name });
  };

  switch (action.type) {
    case 'create_event':
    case 'create_reminder':
    case 'create_task': {
      const client = resolveClient(action.clientName);
      const at = action.at ? new Date(action.at) : undefined;
      const kind: Item['kind'] =
        action.type === 'create_event' ? 'event' : action.type === 'create_reminder' ? 'reminder' : 'task';
      const item = s.addItem({
        kind,
        title: action.title,
        at: action.at,
        durationMin: action.type === 'create_event' ? (action.durationMin ?? 60) : undefined,
        location: action.type === 'create_event' ? action.location : undefined,
        clientId: client?.id,
        source: transcript,
      });
      const patch: Partial<Item> = {};
      const before = action.type === 'create_event' ? (action.remindBeforeMin ?? profile.remindBeforeMin) : 0;

      if (at && kind === 'event' && profile.calendarSync) {
        patch.calendarEventId = await addToCalendar({
          title: action.title,
          start: at,
          durationMin: action.type === 'create_event' ? action.durationMin : undefined,
          location: action.type === 'create_event' ? action.location : undefined,
          notes: transcript ? `Из голосовой заметки: «${transcript}»` : undefined,
          alarmMinBefore: before || undefined,
        });
        if (patch.calendarEventId) wired.push('календарь');
      }
      if (at) {
        const fireAt = new Date(at.getTime() - before * 60_000);
        patch.notificationId = await scheduleLocal(
          kind === 'event' ? `Через ${before} мин: ${action.title}` : action.title,
          kind === 'event' ? timeFmt(at) : 'Zumi напоминает',
          fireAt,
          { itemId: item.id },
        );
        if (patch.notificationId) wired.push('push');

        if (pro && profile.whatsappReminders && profile.whatsapp) {
          patch.whatsappJobId = await scheduleWhatsAppReminder({
            to: profile.whatsapp,
            sendAt: fireAt,
            text:
              kind === 'event'
                ? `⏰ ${action.title}\n${timeFmt(at)}${client ? `\nКлиент: ${client.name}${client.phone ? ` (${client.phone})` : ''}` : ''}`
                : `⏰ Напоминание: ${action.title}`,
          });
          if (patch.whatsappJobId) wired.push('WhatsApp');
        }
      }
      s.updateItem(item.id, patch);
      return { action, itemId: item.id, clientId: client?.id, wired };
    }

    case 'create_note': {
      const client = resolveClient(action.clientName);
      const item = s.addItem({ kind: 'note', title: action.title, details: action.body, clientId: client?.id, source: transcript });
      if (client) s.updateClient(client.id, { notes: [client.notes, action.body].filter(Boolean).join('\n') });
      return { action, itemId: item.id, clientId: client?.id, wired: client ? ['карточка клиента'] : [] };
    }

    case 'upsert_client': {
      const existed = !!findClientByName(action.name);
      const c = s.upsertClient({
        name: action.name,
        phone: action.phone,
        stage: action.stage,
        budget: action.budget,
        interest: action.interest,
        notes: action.note,
      });
      return { action, clientId: c.id, createdClient: !existed, wired: ['CRM'] };
    }

    case 'send_message': {
      const client = findClientByName(action.clientName);
      const phone = action.phone ?? client?.phone;
      if (!phone) {
        return { action, clientId: client?.id, wired: [], error: `Нет номера для «${action.clientName}» — добавьте его в карточку` };
      }
      const auto = pro && profile.waConnected;
      if (auto) {
        const id = await sendToClient({ to: phone, text: action.text, sendAt: action.at ? new Date(action.at) : undefined, name: client?.name });
        if (client) s.updateClient(client.id, { touches: [{ at: nowIso(), summary: `Отправлено: ${action.text}`, via: 'chat' }] });
        return { action, clientId: client?.id, wired: id ? [action.at ? 'WhatsApp по расписанию' : 'отправлено в WhatsApp'] : [], error: id ? undefined : 'Не удалось отправить' };
      }
      // Not connected to WhatsApp Business: open the chat with the text ready — one tap to send.
      await openWhatsAppChat(phone, action.text);
      return { action, clientId: client?.id, wired: ['открыт WhatsApp'] };
    }

    case 'broadcast': {
      const targets = s.clients.filter(
        (c) => c.phone && (!action.stage || c.stage === action.stage) && (!action.tag || c.tags.includes(action.tag)),
      );
      const auto = !!(pro && profile.waConnected && targets.length);
      const b = s.addBroadcast({ text: action.text, clientIds: targets.map((c) => c.id), auto, at: action.at, repeat: action.repeat });
      if (auto) {
        const serverId = await scheduleBroadcast({
          recipients: targets.map((c) => ({ phone: c.phone!, name: c.name })),
          text: action.text,
          sendAt: action.at ? new Date(action.at) : undefined,
          repeat: action.repeat,
        }).catch(() => undefined);
        useStore.getState().updateBroadcast(b.id, { serverId, sentIds: action.at ? [] : targets.map((c) => c.id) });
        return { action, broadcastId: b.id, autoSent: !!serverId, wired: [serverId ? `${targets.length} получателей · автоматически` : 'ошибка отправки'] };
      }
      return { action, broadcastId: b.id, wired: [`${targets.length} получателей`] };
    }

    case 'open_app': {
      const client = action.clientName ? findClientByName(action.clientName) : undefined;
      const r = await openApp(action.app, client?.phone);
      return { action, clientId: client?.id, wired: r.ok ? [r.label] : [], error: r.ok ? undefined : r.label };
    }

    case 'answer':
      return { action, wired: [] };
  }
}

/** Undo every side-effect of an item and delete it. */
export async function deleteItem(item: Item) {
  await Promise.all([
    removeFromCalendar(item.calendarEventId),
    cancelLocal(item.notificationId),
    cancelWhatsAppReminder(item.whatsappJobId),
  ]);
  useStore.getState().removeItem(item.id);
}

export async function completeItem(item: Item) {
  await Promise.all([cancelLocal(item.notificationId), cancelWhatsAppReminder(item.whatsappJobId)]);
  useStore.getState().updateItem(item.id, { done: !item.done });
}

/** Undo an auto-applied action (used by the "Отменить" link after a voice command). */
export async function undoResult(r: ExecResult) {
  const s = useStore.getState();
  if (r.itemId) {
    const item = s.items.find((i) => i.id === r.itemId);
    if (item) await deleteItem(item);
  }
  if (r.createdClient && r.clientId) s.removeClient(r.clientId);
  if (r.broadcastId) useStore.setState({ broadcasts: s.broadcasts.filter((b) => b.id !== r.broadcastId) });
}
