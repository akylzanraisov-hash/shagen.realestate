/**
 * «Зуми, открой камеру / Инстаграм / WhatsApp…» — voice launcher.
 * Third-party apps open through their URL schemes (declared in app.json →
 * LSApplicationQueriesSchemes on iOS, <queries> on Android), with a web fallback.
 */
import * as ImagePicker from 'expo-image-picker';
import { AppState, Linking, Platform } from 'react-native';

import { scheduleLocal } from './notify';
import { useStore } from './store';
import { cleanPhone } from './whatsapp';

interface AppTarget {
  label: string;
  /** spoken aliases, lowercase, без ё */
  match: RegExp;
  urls: string[];
  web?: string;
}

const APPS: AppTarget[] = [
  { label: 'Instagram', match: /инст|instagram|инсту/, urls: ['instagram://app'], web: 'https://instagram.com' },
  { label: 'WhatsApp', match: /ватсап|вотсап|whatsapp|ватс/, urls: ['whatsapp://send'], web: 'https://web.whatsapp.com' },
  { label: 'Telegram', match: /телеграм|telegram|телегу|тг(\s|$)/, urls: ['tg://'], web: 'https://t.me' },
  { label: 'YouTube', match: /ютуб|youtube/, urls: ['youtube://'], web: 'https://youtube.com' },
  { label: 'TikTok', match: /тикток|tiktok|тик ток/, urls: ['snssdk1233://'], web: 'https://tiktok.com' },
  { label: '2ГИС', match: /2\s?гис|два гис|дубль ?гис/, urls: ['dgis://'], web: 'https://2gis.kz' },
  {
    label: 'Карты',
    match: /карт|навигатор/,
    urls: Platform.OS === 'ios' ? ['maps://'] : ['geo:0,0?q='],
    web: 'https://maps.google.com',
  },
  { label: 'Яндекс Навигатор', match: /яндекс/, urls: ['yandexnavi://', 'yandexmaps://'], web: 'https://yandex.kz/maps' },
  { label: 'Krisha.kz', match: /криш|krisha/, urls: ['krisha://'], web: 'https://krisha.kz' },
  { label: 'Kaspi', match: /каспи|kaspi/, urls: ['kaspi://'], web: 'https://kaspi.kz' },
  {
    label: 'Календарь',
    match: /календар/,
    urls: Platform.OS === 'ios' ? ['calshow://'] : ['content://com.android.calendar/time/'],
  },
  { label: 'Почта', match: /почт|mail|gmail/, urls: Platform.OS === 'ios' ? ['message://'] : ['mailto:'], web: 'https://mail.google.com' },
  { label: 'Заметки', match: /заметк/, urls: Platform.OS === 'ios' ? ['mobilenotes://'] : [] },
];

export const SPEAKABLE_APPS = ['камеру', ...APPS.map((a) => a.label)];

async function tryOpen(urls: string[], web?: string) {
  for (const u of urls) {
    try {
      await Linking.openURL(u);
      return true;
    } catch {
      // not installed / not allowed — try next
    }
  }
  if (web) {
    await Linking.openURL(web);
    return true;
  }
  return false;
}

/** Returns a human result line for the "Сделано" screen / voice reply. */
export async function openApp(spoken: string, phone?: string): Promise<{ ok: boolean; label: string }> {
  const s = spoken.toLowerCase().replace(/ё/g, 'е');

  // iOS/Android won't let an app jump to another app from the background:
  // leave a one-tap notification instead.
  if (AppState.currentState !== 'active') {
    await scheduleLocal('Zumi', `Открыть: ${spoken}? Нажмите`, new Date(Date.now() + 1000), { open: spoken });
    return { ok: true, label: `${spoken} — нажмите на уведомление` };
  }

  if (/камер|фото|сфотограф|снять/.test(s)) {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return { ok: false, label: 'Нет доступа к камере' };
    const res = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!res.canceled && res.assets[0]) {
      // photos land in the Studio pile — ready for a listing post or a client brief
      useStore.getState().addMaterial({ kind: 'image', uri: res.assets[0].uri, mime: res.assets[0].mimeType ?? 'image/jpeg' });
      return { ok: true, label: 'Фото добавлено в Студию' };
    }
    return { ok: true, label: 'Камера' };
  }

  if (/позвони|набери|звонок/.test(s) && phone) {
    await Linking.openURL(`tel:+${cleanPhone(phone)}`);
    return { ok: true, label: 'Звоню' };
  }

  if (/настройк/.test(s)) {
    await Linking.openSettings();
    return { ok: true, label: 'Настройки' };
  }

  const target = APPS.find((a) => a.match.test(s));
  if (!target) return { ok: false, label: `Не знаю приложение «${spoken}»` };
  const ok = await tryOpen(target.urls, target.web);
  return { ok, label: target.label };
}

/** URL schemes to declare so canOpen/open works (used by app.json). */
export const QUERY_SCHEMES = ['instagram', 'whatsapp', 'tg', 'youtube', 'snssdk1233', 'dgis', 'yandexnavi', 'yandexmaps', 'krisha', 'kaspi', 'calshow', 'mobilenotes', 'message'];
