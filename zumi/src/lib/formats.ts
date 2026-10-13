import type { CreationFormat } from './types';

export const FORMATS: { id: CreationFormat; emoji: string; title: string; hint: string }[] = [
  { id: 'newsletter', emoji: '📣', title: 'Рассылка', hint: 'Сообщение клиентам' },
  { id: 'video', emoji: '🎬', title: 'Сценарий видео', hint: 'Reels / Shorts' },
  { id: 'landing', emoji: '🖥', title: 'Лендинг', hint: 'Текст для сайта' },
  { id: 'brief', emoji: '📄', title: 'Справка клиенту', hint: 'Отправить ссылкой' },
  { id: 'post', emoji: '🚀', title: 'Пост / ответ', hint: 'Деловой тон' },
];
