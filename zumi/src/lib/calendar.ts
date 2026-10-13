import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';

let cachedCalendar: Calendar.ExpoCalendar | null = null;

async function writableCalendar(): Promise<Calendar.ExpoCalendar | null> {
  if (Platform.OS === 'web') return null;
  if (cachedCalendar) return cachedCalendar;
  const perm = await Calendar.requestCalendarPermissions();
  if (!perm.granted) return null;

  if (Platform.OS === 'ios') {
    cachedCalendar = Calendar.getDefaultCalendarSync();
    return cachedCalendar;
  }
  // Android has no single default calendar: prefer the primary writable one.
  const calendars = await Calendar.getCalendars(Calendar.EntityTypes.EVENT);
  const writable = calendars.filter((c) => c.allowsModifications);
  cachedCalendar = writable.find((c) => c.isPrimary) ?? writable[0] ?? null;
  return cachedCalendar;
}

export async function addToCalendar(opts: {
  title: string;
  start: Date;
  durationMin?: number;
  notes?: string;
  location?: string;
  alarmMinBefore?: number;
}): Promise<string | undefined> {
  try {
    const cal = await writableCalendar();
    if (!cal) return undefined;
    const end = new Date(opts.start.getTime() + (opts.durationMin ?? 60) * 60_000);
    const ev = await cal.createEvent({
      title: opts.title,
      startDate: opts.start,
      endDate: end,
      notes: opts.notes ?? 'Создано в Zumi',
      location: opts.location ?? null,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      alarms: opts.alarmMinBefore ? [{ relativeOffset: -opts.alarmMinBefore }] : [],
    });
    return ev.id;
  } catch (e) {
    console.warn('calendar failed', e);
    return undefined;
  }
}

export async function removeFromCalendar(eventId?: string) {
  if (!eventId || Platform.OS === 'web') return;
  try {
    const ev = await Calendar.ExpoCalendarEvent.get(eventId);
    await ev.delete();
  } catch {
    // already gone
  }
}
