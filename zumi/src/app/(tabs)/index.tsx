import { router } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { Glass, LivePill, Logo } from '@/components/chrome';
import { DayRibbon } from '@/components/DayRibbon';
import { ItemRow } from '@/components/ItemRow';
import { Screen } from '@/components/Screen';
import { Icon, type IconName, SectionLabel, Txt } from '@/components/ui';
import { Wave } from '@/components/Wave';
import { ago, countdown, isSameDay } from '@/lib/format';
import { useStore } from '@/lib/store';
import { color, font } from '@/theme/tokens';

function Template({ emoji, title, hint, onPress }: { emoji: string; title: string; hint: string; onPress: () => void }) {
  return (
    <Glass onPress={onPress} style={{ flex: 1 }} pad={14}>
      <Txt style={{ fontSize: 22 }}>{emoji}</Txt>
      <Txt v="h3" style={{ marginTop: 8 }}>
        {title}
      </Txt>
      <Txt v="small" c={color.textDim} style={{ marginTop: 2 }}>
        {hint}
      </Txt>
    </Glass>
  );
}

function RecentRow({ icon, title, status, tint, onPress }: { icon: IconName; title: string; status: string; tint: string; onPress?: () => void }) {
  return (
    <Glass onPress={onPress} pad={0} style={{ borderRadius: 18 }}>
      <View style={styles.recent}>
        <View style={[styles.recentIcon, { backgroundColor: `${tint}22` }]}>
          <Icon name={icon} size={18} tint={tint} />
        </View>
        <View style={{ flex: 1 }}>
          <Txt v="bodyBold" numberOfLines={2}>
            {title}
          </Txt>
          <Txt v="small" c={color.volt}>
            {status}
          </Txt>
        </View>
        <Icon name="chevron-right" size={18} tint={color.textMute} />
      </View>
    </Glass>
  );
}

export default function Home() {
  const { width } = useWindowDimensions();
  const name = useStore((s) => s.profile.name);
  const items = useStore((s) => s.items);
  const digests = useStore((s) => s.digests);
  const creations = useStore((s) => s.creations);

  const now = new Date();
  const today = useMemo(
    () =>
      items
        .filter((i) => i.at && isSameDay(new Date(i.at), new Date()))
        .sort((a, b) => a.at!.localeCompare(b.at!)),
    [items],
  );
  const next = useMemo(
    () =>
      items
        .filter((i) => i.at && !i.done && new Date(i.at) > new Date() && i.kind !== 'note')
        .sort((a, b) => a.at!.localeCompare(b.at!))[0],
    [items],
  );

  const recent = useMemo(() => {
    const rows = [
      ...digests.map((d) => ({
        id: d.id,
        at: d.createdAt,
        icon: 'mic' as IconName,
        tint: color.ultra,
        title: `${d.source === 'shared-audio' ? 'Аудио' : 'Аудиозаметка'}: ${d.title}`,
        status: `Обработано ИИ · ${ago(d.createdAt)}`,
        go: () => router.push({ pathname: '/digest/[id]', params: { id: d.id } }),
      })),
      ...creations.map((c) => ({
        id: c.id,
        at: c.createdAt,
        icon: 'message-square' as IconName,
        tint: color.volt,
        title: c.title,
        status: `Готово · ${ago(c.createdAt)}`,
        go: () => router.push({ pathname: '/creation/[id]', params: { id: c.id } }),
      })),
    ];
    return rows.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 4);
  }, [digests, creations]);

  const cd = next?.at ? countdown(next.at) : null;
  const heroW = width - 40 - 32;

  return (
    <Screen tabbed>
      <View style={styles.top}>
        <Logo />
        <LivePill />
      </View>

      <View style={{ gap: 4 }}>
        <Txt v="body" c={color.textDim}>
          Привет{name ? `, ${name}` : ''}!
        </Txt>
        <Txt v="h1">Что доверишь{'\n'}мне сегодня? 😊</Txt>
      </View>

      {/* HERO: voice input / import */}
      <Glass tint={color.ultra} onPress={() => router.push('/capture')} pad={16} style={{ borderColor: 'rgba(177,140,255,0.35)' }}>
        <Txt v="label" c={color.textDim} style={{ textAlign: 'center' }}>
          Голосовой ввод / импорт
        </Txt>
        <View style={{ alignItems: 'center', marginVertical: 6 }}>
          <Wave width={heroW} height={92} calm={0.55} />
        </View>
        <Txt v="h2" style={{ textAlign: 'center' }}>
          Нажми и говори
        </Txt>
        <Txt v="small" c={color.textDim} style={{ textAlign: 'center', marginTop: 2 }}>
          или перешли аудио из Telegram / WhatsApp
        </Txt>
      </Glass>

      <View>
        <SectionLabel>Быстрые шаблоны</SectionLabel>
        <View style={{ gap: 10 }}>
          <View style={styles.grid}>
            <Template emoji="📝" title="Собрать саммари" hint="Выжимка из хаоса мыслей" onPress={() => router.push({ pathname: '/capture', params: { mode: 'digest' } })} />
            <Template emoji="💼" title="Внести в CRM" hint="Контакты, задачи, сделки" onPress={() => router.push('/memory')} />
          </View>
          <View style={styles.grid}>
            <Template emoji="🚀" title="Написать пост / ответ" hint="Из скринов и заметок" onPress={() => router.push('/compose')} />
            <Template emoji="📣" title="Рассылка" hint="По вашим контактам" onPress={() => router.push({ pathname: '/broadcast/[id]', params: { id: 'new' } })} />
          </View>
        </View>
      </View>

      <View>
        <SectionLabel right={<Txt v="small" c={color.textMute}>{now.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}</Txt>}>
          Сегодня
        </SectionLabel>
        <Glass>
          {next && cd ? (
            <View style={styles.next}>
              <View style={{ flex: 1 }}>
                <Txt v="label" c={color.volt}>
                  Следующее
                </Txt>
                <Txt v="h3" numberOfLines={2} style={{ marginTop: 4 }}>
                  {next.title}
                </Txt>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Txt v="num" c={color.volt}>
                  {cd.value}
                </Txt>
                <Txt v="small" c={color.textDim} style={{ fontFamily: font.bodyBold }}>
                  {cd.unit}
                </Txt>
              </View>
            </View>
          ) : (
            <Txt v="bodyBold" c={color.textDim}>
              Планов пока нет — скажите, например: «Встреча с Айгерим в пятницу в 15:00»
            </Txt>
          )}
          <DayRibbon items={today} />
          {today.map((i) => (
            <ItemRow key={i.id} item={i} />
          ))}
        </Glass>
      </View>

      {recent.length ? (
        <View>
          <SectionLabel>Последние задачи</SectionLabel>
          <View style={{ gap: 10 }}>
            {recent.map((r) => (
              <RecentRow key={r.id} icon={r.icon} title={r.title} status={r.status} tint={r.tint} onPress={r.go} />
            ))}
          </View>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  grid: { flexDirection: 'row', gap: 10 },
  next: { flexDirection: 'row', alignItems: 'flex-end', gap: 12, marginBottom: 4 },
  recent: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  recentIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
