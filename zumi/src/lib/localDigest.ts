/**
 * Offline fallbacks for "выжимка смыслов" and the content Studio.
 * Deliberately simple heuristics — the real work is done by Claude on the server.
 */
import { parseWhen } from './localParser';
import type { CreationFormat, DigestResult, Material } from './types';

const sentences = (t: string) =>
  t
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);

const TODO_RE = /(надо|нужно|необходимо|сделать|позвонить|перезвонить|отправить|скинуть|прислать|подготовить|написать|встретиться|проверить|забронировать|оплатить|договориться|узнать)/i;
const AGREE_RE = /(договорились|согласовали|решили|сошлись|утвердили|подтвердил|подтвердила|ок,? значит|принято)/i;
const NAME_RE = /(?:с|со|клиент[а-я]*|для)\s+([А-ЯЁ][а-яё]+)/;

export function localDigest(text: string, now = new Date()): DigestResult {
  const ss = sentences(text);
  const todos = ss
    .filter((s) => TODO_RE.test(s))
    .map((s) => ({ text: s.replace(/[.!]$/, ''), dueAt: parseWhen(s, now)?.toISOString() }));
  const agreements = ss.filter((s) => AGREE_RE.test(s)).map((s) => s.replace(/[.!]$/, ''));
  const summary = ss.slice(0, 2).join(' ') || text.slice(0, 200);
  const name = text.match(NAME_RE)?.[1];
  const title = (ss[0] ?? 'Голосовая заметка').split(' ').slice(0, 6).join(' ').replace(/[.,!?]$/, '');
  const follow = todos.find((t) => t.dueAt);
  return {
    title,
    summary,
    todos,
    agreements,
    contact: name
      ? {
          name,
          summary,
          agreements,
          followUpAt: follow?.dueAt,
          followUpWhat: follow?.text,
        }
      : undefined,
  };
}

const FORMAT_TITLES: Record<CreationFormat, string> = {
  newsletter: 'Рассылка',
  video: 'Сценарий видео',
  landing: 'Текст для лендинга',
  brief: 'Справка для клиента',
  post: 'Пост',
};

export function localCompose(format: CreationFormat, materials: Material[], brief?: string) {
  const texts = materials.filter((m) => m.text).map((m) => m.text!.trim());
  const links = materials.filter((m) => m.kind === 'link').map((m) => m.text!);
  const title = brief?.trim() || FORMAT_TITLES[format];
  const bullets = texts.flatMap(sentences).slice(0, 8).map((s) => `- ${s}`);
  let body = '';
  switch (format) {
    case 'video':
      body = `# ${title}\n\n## Хук (0–3 сек)\n${bullets[0]?.slice(2) ?? 'Сильная первая фраза'}\n\n## Основная часть\n${bullets.slice(1, 5).join('\n')}\n\n## Призыв\nНапишите в директ «хочу» — пришлю подборку.`;
      break;
    case 'landing':
      body = `# ${title}\n\n**${bullets[0]?.slice(2) ?? 'Главное предложение'}**\n\n## Почему это выгодно\n${bullets.slice(1, 5).join('\n')}\n\n## Оставьте заявку\nОтветим за 15 минут.`;
      break;
    case 'brief':
      body = `# ${title}\n\n## Коротко\n${bullets.slice(0, 3).join('\n')}\n\n## Детали\n${bullets.slice(3).join('\n')}${links.length ? `\n\n## Ссылки\n${links.map((l) => `- ${l}`).join('\n')}` : ''}`;
      break;
    default:
      body = `# ${title}\n\nЗдравствуйте, {имя}!\n\n${bullets.slice(0, 5).join('\n')}\n\nЕсли интересно — ответьте на это сообщение, пришлю детали.`;
  }
  return { title, body };
}
