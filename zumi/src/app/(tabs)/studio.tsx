import { router } from 'expo-router';
import { View } from 'react-native';

import { Glass } from '@/components/chrome';
import { Screen } from '@/components/Screen';
import { Empty, Icon, SectionLabel, Txt } from '@/components/ui';
import { ago } from '@/lib/format';
import { useStore } from '@/lib/store';
import { FORMATS } from '@/lib/formats';
import { color } from '@/theme/tokens';


/** Студия: генератор контента из «мусора» — скринов, ссылок, заметок, аудио. */
export default function Studio() {
  const materials = useStore((s) => s.materials);
  const creations = useStore((s) => s.creations);

  return (
    <Screen tabbed>
      <Txt v="h1">Студия</Txt>
      <Txt v="body" c={color.textDim} style={{ marginTop: -10 }}>
        Скидывайте скриншоты, ссылки, обрывки текста и голосовые — Zumi соберёт из них готовый текст.
      </Txt>

      <Glass tint={color.ultra} onPress={() => router.push('/compose')}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: color.volt, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="plus" size={24} tint={color.ink} />
          </View>
          <View style={{ flex: 1 }}>
            <Txt v="h3">Собрать из материалов</Txt>
            <Txt v="small" c={color.textDim}>
              {materials.length ? `В корзине: ${materials.length}` : 'Добавьте фото, ссылки или текст'}
            </Txt>
          </View>
          <Icon name="chevron-right" tint={color.textMute} />
        </View>
      </Glass>

      <View>
        <SectionLabel>Форматы</SectionLabel>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {FORMATS.map((f) => (
            <Glass key={f.id} pad={14} style={{ width: '48%' }} onPress={() => router.push({ pathname: '/compose', params: { format: f.id } })}>
              <Txt style={{ fontSize: 22 }}>{f.emoji}</Txt>
              <Txt v="h3" style={{ marginTop: 6 }}>{f.title}</Txt>
              <Txt v="small" c={color.textDim}>{f.hint}</Txt>
            </Glass>
          ))}
        </View>
      </View>

      <View>
        <SectionLabel>Готовые тексты</SectionLabel>
        {creations.length === 0 ? (
          <Empty icon="feather" title="Здесь появятся ваши тексты" />
        ) : (
          <View style={{ gap: 8 }}>
            {creations.map((c) => (
              <Glass key={c.id} pad={14} onPress={() => router.push({ pathname: '/creation/[id]', params: { id: c.id } })}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Txt style={{ fontSize: 20 }}>{FORMATS.find((f) => f.id === c.format)?.emoji}</Txt>
                  <View style={{ flex: 1 }}>
                    <Txt v="h3" numberOfLines={1}>{c.title}</Txt>
                    <Txt v="small" c={c.shareUrl ? color.volt : color.textMute}>
                      {c.shareUrl ? `🔗 ${c.shareUrl.replace(/^https?:\/\//, '')}` : ago(c.createdAt)}
                    </Txt>
                  </View>
                  <Icon name="chevron-right" size={18} tint={color.textMute} />
                </View>
              </Glass>
            ))}
          </View>
        )}
      </View>
    </Screen>
  );
}
