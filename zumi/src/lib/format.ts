const pad = (n: number) => String(n).padStart(2, '0');

export const hhmm = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

export const dayLabel = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  if (isSameDay(d, now)) return 'Сегодня';
  if (isSameDay(d, tomorrow)) return 'Завтра';
  return d.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
};

export const whenLabel = (iso?: string) => (iso ? `${dayLabel(iso)}, ${hhmm(iso)}` : '');

/** "через 42 мин", "через 3 ч", "через 2 дн" */
export const countdown = (iso: string, now = Date.now()) => {
  const diff = new Date(iso).getTime() - now;
  const min = Math.round(diff / 60000);
  if (min < 0) return { value: String(Math.abs(min)), unit: 'мин назад' };
  if (min < 60) return { value: String(min), unit: 'мин' };
  const h = Math.round(min / 60);
  if (h < 24) return { value: String(h), unit: h === 1 ? 'час' : h < 5 ? 'часа' : 'часов' };
  const d = Math.round(h / 24);
  return { value: String(d), unit: d === 1 ? 'день' : d < 5 ? 'дня' : 'дней' };
};

export const greeting = (d = new Date()) => {
  const h = d.getHours();
  if (h < 5) return 'Доброй ночи';
  if (h < 12) return 'Доброе утро';
  if (h < 18) return 'Добрый день';
  return 'Добрый вечер';
};

export const ago = (iso: string) => {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return 'только что';
  if (min < 60) return `${min} мин назад`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} ч назад`;
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
};

export const STAGES = [
  { id: 'lead', label: 'Лид' },
  { id: 'contact', label: 'Контакт' },
  { id: 'showing', label: 'Показ' },
  { id: 'offer', label: 'Оффер' },
  { id: 'deal', label: 'Сделка' },
  { id: 'lost', label: 'Отказ' },
] as const;

export const stageLabel = (id: string) => STAGES.find((s) => s.id === id)?.label ?? id;
