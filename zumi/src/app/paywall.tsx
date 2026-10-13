import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Platform, Pressable, StyleSheet, View } from 'react-native';

import { Glass, Mascot } from '@/components/chrome';
import { Screen } from '@/components/Screen';
import { Button, IconButton, Txt, success } from '@/components/ui';
import { buy, loadPlans, restore, type Plan } from '@/lib/purchases';
import { FREE_MONTHLY_COMMANDS } from '@/lib/store';
import { color, font } from '@/theme/tokens';

const PERKS = [
  ['📞', 'Запись звонков', 'Линия Zumi: каждый разговор — в выжимку и в карточку клиента'],
  ['💬', 'WhatsApp на автопилоте', 'Напоминания, итоги звонков и сообщения клиентам уходят сами'],
  ['🎙', '«Привет, Зуми»', 'Без рук, даже когда телефон в кармане'],
  ['♾️', 'Без лимитов', `Бесплатно — ${FREE_MONTHLY_COMMANDS} команд в месяц`],
  ['🔊', 'Живой голос', 'Ответы голосом ElevenLabs'],
] as const;

const REASONS: Record<string, string> = {
  calls: 'Запись звонков доступна в Pro',
};

export default function Paywall() {
  const { reason } = useLocalSearchParams<{ reason?: string }>();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [sel, setSel] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    loadPlans().then(setPlans);
  }, []);

  const purchase = async () => {
    const plan = plans[sel];
    if (!plan) return;
    setBusy(true);
    const r = await buy(plan);
    setBusy(false);
    if (r === 'ok') {
      success();
      router.back();
    } else if (r === 'unavailable') {
      Alert.alert('Магазин недоступен', 'Попробуйте позже');
    } else if (r === 'error') {
      Alert.alert('Оплата не прошла', 'Попробуйте ещё раз');
    }
  };

  return (
    <Screen header={<IconButton name="x" onPress={() => router.back()} />}>
      <View style={{ alignItems: 'center', gap: 10 }}>
        <Mascot size={86} />
        <Txt v="h1" style={{ textAlign: 'center' }}>
          Zumi <Txt v="h1" c={color.volt}>Pro</Txt>
        </Txt>
        <Txt v="body" c={color.textDim} style={{ textAlign: 'center' }}>
          {reason && REASONS[reason] ? REASONS[reason] : 'Полный ассистент, который забирает рутину'}
        </Txt>
      </View>

      <Glass>
        {PERKS.map(([e, t, h]) => (
          <View key={t} style={styles.perk}>
            <Txt style={{ fontSize: 22 }}>{e}</Txt>
            <View style={{ flex: 1 }}>
              <Txt v="bodyBold">{t}</Txt>
              <Txt v="small" c={color.textDim}>{h}</Txt>
            </View>
          </View>
        ))}
      </Glass>

      {plans.length === 0 ? (
        <ActivityIndicator color={color.volt} />
      ) : (
        <View style={{ gap: 10 }}>
          {plans.map((p, i) => (
            <Pressable key={p.id} onPress={() => setSel(i)}>
              <Glass tint={sel === i ? color.volt : undefined} style={[sel === i && { borderColor: color.volt, borderWidth: 1.5 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={[styles.radio, sel === i && { borderColor: color.volt }]}>{sel === i ? <View style={styles.radioDot} /> : null}</View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Txt v="h3">{p.title}</Txt>
                      {p.period === 'year' ? (
                        <View style={styles.badge}>
                          <Txt v="label" c={color.ink} style={{ fontSize: 10 }}>Выгодно</Txt>
                        </View>
                      ) : null}
                    </View>
                    {p.perMonth ? <Txt v="small" c={color.textDim}>{p.perMonth} в месяц</Txt> : null}
                  </View>
                  <Txt v="h3" style={{ fontFamily: font.display }}>{p.price}</Txt>
                </View>
              </Glass>
            </Pressable>
          ))}
        </View>
      )}

      <Button title="Подключить Pro" icon="arrow-right" onPress={purchase} loading={busy} disabled={!plans.length} />

      <Txt v="small" c={color.textMute} style={{ textAlign: 'center' }}>
        Подписка продлевается автоматически, пока вы не отмените её минимум за 24 часа до конца периода в настройках{' '}
        {Platform.OS === 'ios' ? 'Apple ID' : 'Google Play'}. Оплата списывается с вашего аккаунта при подтверждении покупки.
      </Txt>
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 18 }}>
        <Pressable onPress={async () => Alert.alert((await restore()) ? 'Pro восстановлен' : 'Покупок не найдено')}>
          <Txt v="small" c={color.textDim}>Восстановить</Txt>
        </Pressable>
        <Pressable onPress={() => Linking.openURL('https://zumi.app/terms')}>
          <Txt v="small" c={color.textDim}>Условия</Txt>
        </Pressable>
        <Pressable onPress={() => Linking.openURL('https://zumi.app/privacy')}>
          <Txt v="small" c={color.textDim}>Конфиденциальность</Txt>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  perk: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 8 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: color.lineStrong, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: color.volt },
  badge: { backgroundColor: color.volt, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
});
