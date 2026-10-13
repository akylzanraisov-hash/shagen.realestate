/**
 * Offline fallback "brain". Works without the backend so the app is usable
 * in a demo / on a plane. Understands typical Russian phrasing:
 *   "встреча с Иваном в пятницу в 15:00 на Абая 10"
 *   "напомни завтра в 9 утра позвонить Марине"
 *   "новый клиент Алия, +7 701 123 45 67, бюджет 50 миллионов, ищет 2-комнатную"
 *   "через 2 часа перезвонить нотариусу"
 *   "разошли всем лидам: новая подборка квартир"
 * The real AI (Claude, via the `assistant` edge function) replaces it when configured.
 */
import type { Action, AssistantResult, ClientStage } from './types';

const WEEKDAYS: [RegExp, number][] = [
  [/понедельник/, 1],
  [/вторник/, 2],
  [/сред[уаы]/, 3],
  [/четверг/, 4],
  [/пятниц[уаы]/, 5],
  [/суббот[уаы]/, 6],
  [/воскресень[ея]/, 0],
];

const NUM_WORDS: Record<string, number> = {
  один: 1, одну: 1, одна: 1, два: 2, две: 2, три: 3, четыре: 4, пять: 5, шесть: 6,
  семь: 7, восемь: 8, девять: 9, десять: 10, одиннадцать: 11, двенадцать: 12,
  полчаса: 0.5, час: 1, пару: 2, несколько: 3,
};

const toNum = (s: string) => (/^\d+([.,]\d+)?$/.test(s) ? parseFloat(s.replace(',', '.')) : NUM_WORDS[s]);

export function parseWhen(input: string, now = new Date()): Date | undefined {
  const t = input.toLowerCase().replace(/ё/g, 'е');
  let d: Date | undefined;
  let timeSet = false;

  // relative: "через 2 часа", "через 15 минут", "через 3 дня", "через полчаса"
  const rel = t.match(/через\s+(\d+[.,]?\d*|[а-я]+)?\s*(минут[уы]?|мин|час[аов]*|дн[яей]+|день|недел[июь]+)?/);
  if (rel && (rel[1] || rel[2])) {
    const n = rel[1] ? toNum(rel[1]) ?? 1 : 1;
    const unit = rel[2] ?? (rel[1] === 'полчаса' ? 'минут' : 'час');
    d = new Date(now);
    if (rel[1] === 'полчаса') d.setMinutes(d.getMinutes() + 30);
    else if (unit.startsWith('мин')) d.setMinutes(d.getMinutes() + n);
    else if (unit.startsWith('час')) d.setMinutes(d.getMinutes() + n * 60);
    else if (unit.startsWith('д')) d.setDate(d.getDate() + n);
    else if (unit.startsWith('недел')) d.setDate(d.getDate() + 7 * n);
    if (unit.startsWith('мин') || unit.startsWith('час')) return d;
  }

  if (!d) {
    if (/послезавтра/.test(t)) {
      d = new Date(now);
      d.setDate(d.getDate() + 2);
    } else if (/завтра/.test(t)) {
      d = new Date(now);
      d.setDate(d.getDate() + 1);
    } else if (/сегодня|вечером|утром|днем/.test(t)) {
      d = new Date(now);
    } else {
      for (const [re, wd] of WEEKDAYS) {
        if (re.test(t)) {
          d = new Date(now);
          const diff = (wd - d.getDay() + 7) % 7 || 7;
          d.setDate(d.getDate() + diff);
          break;
        }
      }
    }
  }

  // explicit date "15.11", "15 ноября"
  const MONTHS = ['январ', 'феврал', 'март', 'апрел', 'ма', 'июн', 'июл', 'август', 'сентябр', 'октябр', 'ноябр', 'декабр'];
  const dm = t.match(/(\d{1,2})[./](\d{1,2})(?:[./](\d{2,4}))?/);
  const dn = t.match(/(\d{1,2})\s+(январ|феврал|март|апрел|ма[яй]|июн|июл|август|сентябр|октябр|ноябр|декабр)/);
  if (dm && !/(?:в|к)\s+\d{1,2}\.\d{2}$/.test(t.slice(0, (dm.index ?? 0) + dm[0].length))) {
    d = new Date(now);
    d.setMonth(parseInt(dm[2], 10) - 1, parseInt(dm[1], 10));
    if (d < now) d.setFullYear(d.getFullYear() + 1);
  } else if (dn) {
    d = new Date(now);
    const mi = MONTHS.findIndex((m) => dn[2].startsWith(m));
    d.setMonth(mi, parseInt(dn[1], 10));
    if (d < now) d.setFullYear(d.getFullYear() + 1);
  }

  // time: "в 15:00", "в 15.30", "к 9", "в 3 часа дня", "в 10 утра", "в полдень"
  let hh: number | undefined;
  let mm = 0;
  const hm = t.match(/(\d{1,2}):(\d{2})/) ?? t.match(/(?:в|к)\s+(\d{1,2})\.(\d{2})/);
  const h = t.match(/(?:в|к)\s+(\d{1,2})(?:\s*(?:час[аов]*|ч))?(?:\s+(утра|дня|вечера|ночи))?/);
  if (hm) {
    hh = parseInt(hm[1], 10);
    mm = parseInt(hm[2], 10);
  } else if (h) {
    hh = parseInt(h[1], 10);
    const part = h[2] ?? (/вечер/.test(t) ? 'вечера' : /дня|днем/.test(t) ? 'дня' : undefined);
    if ((part === 'дня' || part === 'вечера') && hh < 12) hh += 12;
    if (!part && hh >= 1 && hh <= 7) hh += 12; // "в 3" means 15:00 in business context
  } else if (/полдень/.test(t)) hh = 12;
  else if (/утром/.test(t)) hh = 9;
  else if (/днем/.test(t)) hh = 14;
  else if (/вечером/.test(t)) hh = 19;

  if (hh !== undefined && hh < 24) {
    d = d ?? new Date(now);
    d.setHours(hh, mm, 0, 0);
    timeSet = true;
    if (d < now && !/сегодня/.test(t) && d.toDateString() === now.toDateString()) d.setDate(d.getDate() + 1);
  }
  if (d && !timeSet) d.setHours(10, 0, 0, 0);
  return d;
}

const PHONE_RE = /(\+?\d[\d\s\-()]{8,}\d)/;
const NAME_AFTER = /(?:^|\s)(с|со|для|[Кк]лиент[а-я]*|[Лл]ид|позвонить|перезвонить|написать)\s+([А-ЯЁ][а-яё]+(?:\s+[А-ЯЁ][а-яё]+)?)/;

/** "с Иваном" -> "Иван", "с Мариной" -> "Марина". Matching later is prefix-based, so this only needs to be close. */
function extractClientName(s: string) {
  const m = s.match(NAME_AFTER);
  if (!m) return undefined;
  const prep = m[1].toLowerCase();
  if (prep !== 'с' && prep !== 'со') return m[2];
  return m[2]
    .split(' ')
    .map((w) => (w.length > 4 ? w.replace(/(ом|ем)$/, '').replace(/(ой|ей)$/, 'а') : w))
    .join(' ');
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function cleanTitle(s: string) {
  return capitalize(
    s
      .replace(/^(зуми|zumi)[,\s]*/i, '')
      .replace(/^(напомни(?:\s+мне)?|поставь|создай|запиши|добавь|хочу|мне нужно|надо)\s+/i, '')
      .replace(/\s*(в|к)\s+\d{1,2}([:.]\d{2})?(\s*(часов|часа|час|ч)(?![а-я]))?(\s*(утра|дня|вечера|ночи))?/gi, '')
      .replace(/\s*\d{1,2}[./]\d{1,2}([./]\d{2,4})?/g, '')
      .replace(/\s*(сегодня|завтра|послезавтра|в\s+(понедельник|вторник|среду|четверг|пятницу|субботу|воскресенье))\s*/gi, ' ')
      .replace(/через\s+\S+\s+(минут\S*|час\S*|дн\S*|недел\S*)/gi, '')
      .replace(/\s{2,}/g, ' ')
      .trim()
      .replace(/[.,]$/, ''),
  );
}

export function localAssistant(transcript: string, now = new Date()): AssistantResult {
  const text = transcript.trim();
  const t = text.toLowerCase().replace(/ё/g, 'е');
  const actions: Action[] = [];
  const when = parseWhen(text, now);
  const clientName = extractClientName(text);
  const phone = text.match(PHONE_RE)?.[1]?.replace(/[\s\-()]/g, '');

  const isBroadcast = /(разошли|рассылк|отправь всем|напиши всем)/.test(t);
  const isClient = /(нов(ый|ая|ого) (клиент|лид)|добавь клиента|запиши клиента|лид[:\s])/.test(t) || (!!phone && /клиент|лид/.test(t));
  const isEvent = /(встреч|созвон|показ|просмотр|сделк|подписан|зум|zoom|звонок в|приеду|обед с|ужин с)/.test(t);
  const isReminder = /(напомни|не забыть|не забудь|напоминан)/.test(t);
  const isAnswer = /^(что|как|сколько|кто|когда|почему|какие|покажи)(\s|,|$)/.test(t) && !isEvent && !isReminder;

  // «открой камеру», «запусти инстаграм», «позвони Алексею»
  const open = t.match(/^(?:зуми[,\s]*)?(?:открой|запусти|включи|покажи)\s+(.+)$/);
  if (open) {
    actions.push({ type: 'open_app', app: open[1].replace(/[.!]$/, '') });
    return { transcript: text, reply: `Открываю`, actions };
  }
  const call = text.match(/(?:позвони|набери)\s+([А-ЯЁ][а-яё]+)/i);
  if (call) {
    const who = call[1].replace(/(у|ю|е)$/, (e) => (e === 'е' ? 'а' : e === 'ю' ? 'й' : ''));
    actions.push({ type: 'open_app', app: 'позвонить', clientName: who });
    return { transcript: text, reply: `Звоню ${who}`, actions };
  }

  // "отправь сообщение Алексею, скажи ему что показ переносится на 18:00"
  const msg = text.match(/(?:отправь|напиши|передай|скинь)(?:\s+сообщение)?\s+([А-ЯЁ][а-яё]+)[,:]?\s*(?:(?:скажи|напиши|передай)\s+(?:ему|ей)\s*)?(?:,?\s*что\s+)?(.+)/i);
  if (msg && !/всем/.test(t)) {
    const who = msg[1].replace(/(у|ю|е)$/, (e) => (e === 'е' ? 'а' : e === 'ю' ? 'й' : '')); // Алексею→Алексей, Марине→Марина, Ивану→Иван
    const body = capitalize(msg[2].trim().replace(/[.]$/, ''));
    actions.push({ type: 'send_message', clientName: who, text: `Здравствуйте! ${body}.` });
    return { transcript: text, reply: `Отправляю ${who}`, actions };
  }

  if (isBroadcast) {
    const body = text.split(/[:—-]\s*/).slice(1).join(' ').trim() || text;
    const stage: ClientStage | undefined = /лид/.test(t) ? 'lead' : /показ/.test(t) ? 'showing' : undefined;
    let at = /(вечер|завтра|в \d)/.test(t) ? when?.toISOString() : undefined;
    if (!at && /утренн|утром/.test(t)) {
      const m = new Date(now);
      m.setHours(9, 0, 0, 0);
      if (m <= now) m.setDate(m.getDate() + 1);
      at = m.toISOString();
    }
    const repeat = /кажд(ое|ый) (утро|день)|ежедневн/.test(t) ? 'daily' : /по будням/.test(t) ? 'weekdays' : undefined;
    actions.push({ type: 'broadcast', text: capitalize(body), stage, at, repeat });
  }

  if (isClient) {
    const nm = text.match(/(?:клиент[а-я]*|лид)[:\s]+([А-ЯЁ][а-яё]+(?:\s+[А-ЯЁ][а-яё]+)?)/)?.[1] ?? clientName ?? 'Новый клиент';
    const budget = text.match(/бюджет\s+([^,.;]+)/i)?.[1]?.trim();
    const interest = text.match(/(?:ищет|интересует|хочет)\s+([^,.;]+)/i)?.[1]?.trim();
    actions.push({ type: 'upsert_client', name: nm, phone, budget, interest, stage: 'lead' });
  }

  if (!isBroadcast && !isClient) {
    if (isEvent && when) {
      actions.push({ type: 'create_event', title: cleanTitle(text), at: when.toISOString(), durationMin: 60, clientName });
    } else if ((isReminder || when) && when) {
      actions.push({ type: 'create_reminder', title: cleanTitle(text), at: when.toISOString(), clientName });
    } else if (isAnswer) {
      actions.push({ type: 'answer', text: 'Чтобы отвечать на вопросы, подключите AI-сервер в настройках. Пока я умею раскладывать задачи, встречи и клиентов.' });
    } else {
      const title = cleanTitle(text).split(/[.!?]/)[0].slice(0, 60);
      actions.push({ type: 'create_note', title: title || 'Заметка', body: text, clientName });
    }
  }

  const reply = actions
    .map((a) => {
      switch (a.type) {
        case 'create_event': return `Встреча «${a.title}» — ${fmt(a.at)}`;
        case 'create_reminder': return `Напомню ${fmt(a.at)}`;
        case 'create_task': return `Задача: ${a.title}`;
        case 'create_note': return 'Сохранила заметку';
        case 'upsert_client': return `Клиент ${a.name} в базе`;
        case 'broadcast': return 'Подготовила рассылку';
        case 'send_message': return `Отправляю ${a.clientName}`;
        case 'open_app': return 'Открываю';
        case 'answer': return a.text;
      }
    })
    .join('. ');

  return { transcript: text, reply, actions };
}

const fmt = (iso: string) =>
  new Date(iso).toLocaleString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
