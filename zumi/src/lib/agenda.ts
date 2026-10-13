/**
 * «Зуми, какие у меня встречи на сегодня / завтра / в пятницу?»
 * Answered locally from the store — instant and works offline — then spoken.
 */
import { hhmm, isSameDay } from './format';
import { parseWhen } from './localParser';
import { useStore } from './store';
import type { AssistantResult } from './types';

const ASK_RE = /(какие|что|сколько|есть ли|расскажи|напомни)[\s,].*(встреч|планы|план|задач|дела|показ|звонк|расписани|у меня)/i;

const KIND_WORD = { event: 'встреча', reminder: 'напоминание', task: 'задача', note: 'заметка' } as const;

const plural = (n: number, one: string, few: string, many: string) => {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
};

/** Speakable time: "15:00" → "в 15:00", "09:30" → "в 9:30" */
const sayTime = (iso: string) => `в ${hhmm(iso).replace(/^0/, '')}`;

export function isAgendaQuestion(text: string) {
  return ASK_RE.test(text) && !/(напомни\s+(мне\s+)?(позвонить|написать|сделать|про))/i.test(text);
}

export function answerAgenda(text: string, now = new Date()): AssistantResult {
  const t = text.toLowerCase();
  const day = /недел/.test(t) ? null : (parseWhen(text, now) ?? now);
  const onlyMeetings = /встреч|показ/.test(t);
  const { items, clients } = useStore.getState();

  const weekEnd = new Date(now.getTime() + 7 * 86400000);
  const list = items
    .filter((i) => i.at && !i.done && i.kind !== 'note')
    .filter((i) => (onlyMeetings ? i.kind === 'event' : true))
    .filter((i) => {
      const d = new Date(i.at!);
      return day ? isSameDay(d, day) : d >= now && d <= weekEnd;
    })
    .sort((a, b) => a.at!.localeCompare(b.at!));

  const dayName = !day
    ? 'на этой неделе'
    : isSameDay(day, now)
      ? 'сегодня'
      : isSameDay(day, new Date(now.getTime() + 86400000))
        ? 'завтра'
        : day.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });

  if (!list.length) {
    return {
      transcript: text,
      reply: `${dayName[0].toUpperCase()}${dayName.slice(1)} ${onlyMeetings ? 'встреч' : 'планов'} нет. Свободный день!`,
      actions: [],
    };
  }

  const lines = list.slice(0, 8).map((i) => {
    const client = i.clientId ? clients.find((c) => c.id === i.clientId) : undefined;
    const when = day ? sayTime(i.at!) : `${new Date(i.at!).toLocaleDateString('ru-RU', { weekday: 'long' })} ${sayTime(i.at!)}`;
    return `${when} — ${onlyMeetings ? '' : `${KIND_WORD[i.kind]}: `}${i.title}${client && !i.title.includes(client.name) ? `, с ${client.name}` : ''}`;
  });
  const n = list.length;
  const what = onlyMeetings ? plural(n, 'встреча', 'встречи', 'встреч') : plural(n, 'дело', 'дела', 'дел');
  const reply = `${dayName[0].toUpperCase()}${dayName.slice(1)} у вас ${n} ${what}. ${lines.join('. ')}.${n > 8 ? ' И ещё несколько — смотрите в приложении.' : ''}`;
  return { transcript: text, reply, actions: [{ type: 'answer', text: reply }] };
}
