import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Switch, TextInput, View } from 'react-native';

import { Glass } from '@/components/chrome';
import { Screen } from '@/components/Screen';
import { Button, Chip, Icon, type IconName, SectionLabel, Txt } from '@/components/ui';
import { hasBackend } from '@/lib/config';
import { provisionLine } from '@/lib/line';
import { restore } from '@/lib/purchases';
import { useStore } from '@/lib/store';
import { callFunction } from '@/lib/supabase';
import { wakeWordAvailable } from '@/lib/wakeword';
import { color, font } from '@/theme/tokens';

function Row({ icon, title, hint, value, onChange }: { icon: IconName; title: string; hint?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.row}>
      <Icon name={icon} size={18} tint={color.textDim} />
      <View style={{ flex: 1 }}>
        <Txt v="bodyBold">{title}</Txt>
        {hint ? <Txt v="small" c={color.textMute}>{hint}</Txt> : null}
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: color.volt, false: color.ink3 }} thumbColor={color.text} />
    </View>
  );
}

export default function Profile() {
  const { profile, setProfile, isPro } = useStore();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Is a WhatsApp Business sender connected for this account?
    if (!hasBackend()) return;
    callFunction<{ connected: boolean }>('whatsapp-schedule', { status: true })
      .then((r) => setProfile({ waConnected: r.connected }))
      .catch(() => undefined);
  }, [setProfile]);

  const getLine = async () => {
    if (!isPro) return router.push({ pathname: '/paywall', params: { reason: 'calls' } });
    setBusy(true);
    try {
      const n = await provisionLine();
      Alert.alert('Линия Zumi готова', `Ваш рабочий номер: ${n}\nВсе звонки через него записываются и разбираются автоматически.`);
    } catch (e) {
      Alert.alert('Не получилось', String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen tabbed>
      <Txt v="h1">Профиль</Txt>

      <Glass onPress={() => router.push('/paywall')} tint={isPro ? color.volt : color.ultra}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Txt style={{ fontSize: 26 }}>{isPro ? '💎' : '✨'}</Txt>
          <View style={{ flex: 1 }}>
            <Txt v="h3">{isPro ? 'Zumi Pro активен' : 'Подключить Zumi Pro'}</Txt>
            <Txt v="small" c={color.textDim}>
              {isPro ? 'Безлимит, звонки, WhatsApp, голос' : 'Запись звонков, автоотправка в WhatsApp, безлимит'}
            </Txt>
          </View>
          <Icon name="chevron-right" tint={color.textMute} />
        </View>
      </Glass>

      <View>
        <SectionLabel>О вас</SectionLabel>
        <Glass>
          <Txt v="small" c={color.textMute}>Имя</Txt>
          <TextInput value={profile.name} onChangeText={(name) => setProfile({ name })} style={styles.input} placeholderTextColor={color.textMute} placeholder="Как к вам обращаться" />
          <Txt v="small" c={color.textMute} style={{ marginTop: 10 }}>Ваш WhatsApp (сюда приходят выжимки и напоминания)</Txt>
          <TextInput
            value={profile.whatsapp ?? ''}
            onChangeText={(whatsapp) => setProfile({ whatsapp })}
            keyboardType="phone-pad"
            style={styles.input}
            placeholder="+7 7__ ___ __ __"
            placeholderTextColor={color.textMute}
          />
        </Glass>
      </View>

      <View>
        <SectionLabel>Автоматизация</SectionLabel>
        <Glass>
          <Row
            icon="radio"
            title="«Привет, Зуми»"
            hint={wakeWordAvailable() ? 'Голосовая активация без нажатий, даже в фоне' : 'Будет доступно после настройки ключа Picovoice'}
            value={profile.handsFree}
            onChange={(v) => setProfile({ handsFree: v && wakeWordAvailable() })}
          />
          <Row icon="volume-2" title="Отвечать голосом" hint="Голос ElevenLabs" value={profile.voiceReplies} onChange={(v) => setProfile({ voiceReplies: v })} />
          <Row icon="message-circle" title="Напоминания в WhatsApp" hint={isPro ? undefined : 'В Pro'} value={profile.whatsappReminders} onChange={(v) => setProfile({ whatsappReminders: v })} />
          <Row icon="calendar" title="Встречи в календарь" value={profile.calendarSync} onChange={(v) => setProfile({ calendarSync: v })} />
          <Txt v="small" c={color.textMute} style={{ marginTop: 10 }}>Напоминать до встречи</Txt>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            {[15, 30, 60, 120].map((m) => (
              <Chip key={m} label={m < 60 ? `${m} мин` : `${m / 60} ч`} active={profile.remindBeforeMin === m} onPress={() => setProfile({ remindBeforeMin: m })} />
            ))}
          </View>
        </Glass>
      </View>

      <View>
        <SectionLabel>Звонки</SectionLabel>
        <Glass tint={color.volt}>
          <Txt v="h3">📞 Линия Zumi</Txt>
          {profile.lineNumber ? (
            <>
              <Txt v="h2" c={color.volt} style={{ marginTop: 6, fontFamily: font.display }}>{profile.lineNumber}</Txt>
              <Txt v="small" c={color.textDim} style={{ marginTop: 6 }}>
                Укажите этот номер в объявлениях и визитках. Входящие звонят на ваш телефон, а исходящие — кнопка «Позвонить» в карточке клиента.
                Каждый разговор записывается, расшифровывается, карточка клиента обновляется, а выжимка приходит вам в WhatsApp. Ничего нажимать не нужно.
              </Txt>
            </>
          ) : (
            <>
              <Txt v="small" c={color.textDim} style={{ marginTop: 6 }}>
                Личный рабочий номер: все звонки через него записываются и разбираются автоматически — итоги сразу в WhatsApp.
              </Txt>
              <Button title="Получить номер" icon="phone" onPress={getLine} loading={busy} style={{ marginTop: 12 }} />
            </>
          )}
        </Glass>
        <Glass style={{ marginTop: 10 }}>
          <Txt v="h3">📱 Звонки с обычного номера</Txt>
          <Txt v="small" c={color.textDim} style={{ marginTop: 6 }}>
            iPhone (iOS 18.1+): во время звонка нажмите встроенную кнопку записи вверху слева. После звонка Zumi предложит забрать запись из «Заметок» → «Поделиться» → Zumi.
            {'\n'}Android: включите запись звонков в настройках «Телефона» — запись так же отправляется в Zumi через «Поделиться».
          </Txt>
        </Glass>
      </View>

      <View>
        <SectionLabel>WhatsApp</SectionLabel>
        <Glass>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: profile.waConnected ? color.volt : color.sun }} />
            <Txt v="bodyBold">{profile.waConnected ? 'Автоотправка подключена' : 'Автоотправка не подключена'}</Txt>
          </View>
          <Txt v="small" c={color.textDim} style={{ marginTop: 6 }}>
            {profile.waConnected
              ? '«Zumi, напиши Алексею…» и рассылки уходят сами с вашего WhatsApp Business.'
              : 'Пока сообщения клиентам открываются в WhatsApp с готовым текстом — остаётся нажать «Отправить». Для полной автоматики подключим ваш WhatsApp Business (делаем за вас).'}
          </Txt>
        </Glass>
      </View>

      <Button title="Восстановить покупки" kind="ghost" onPress={async () => Alert.alert(await restore() ? 'Pro восстановлен' : 'Покупок не найдено')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  input: {
    color: color.text,
    fontFamily: font.bodyBold,
    fontSize: 17,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: color.lineStrong,
  },
});
