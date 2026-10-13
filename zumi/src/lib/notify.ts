import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { color } from '@/theme/tokens';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function initNotifications() {
  if (Platform.OS === 'web') return false;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('zumi', {
      name: 'Напоминания Zumi',
      importance: Notifications.AndroidImportance.HIGH,
      lightColor: color.volt,
      vibrationPattern: [0, 180, 120, 180],
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

export async function scheduleLocal(title: string, body: string, at: Date, data?: Record<string, string>) {
  if (Platform.OS === 'web' || at.getTime() <= Date.now()) return undefined;
  try {
    return await Notifications.scheduleNotificationAsync({
      content: { title, body, data, sound: 'default' },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: at,
        channelId: 'zumi',
      },
    });
  } catch (e) {
    console.warn('notification failed', e);
    return undefined;
  }
}

export async function cancelLocal(id?: string) {
  if (!id || Platform.OS === 'web') return;
  await Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined);
}

/** Tapping a "Открыть: Инстаграм?" notification (sent from background) finishes the job. */
export function listenNotificationTaps(onOpen: (spoken: string) => void) {
  if (Platform.OS === 'web') return () => undefined;
  const sub = Notifications.addNotificationResponseReceivedListener((r) => {
    const open = r.notification.request.content.data?.open;
    if (typeof open === 'string') onOpen(open);
  });
  return () => sub.remove();
}
