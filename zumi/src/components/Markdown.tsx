import { View } from 'react-native';

import { color, font } from '@/theme/tokens';

import { Txt } from './ui';

/** Renders the light markdown the AI produces: #, ##, -, **bold**. */
function Inline({ text, c = color.text }: { text: string; c?: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <Txt v="body" c={c}>
      {parts.map((p, i) =>
        p.startsWith('**') && p.endsWith('**') ? (
          <Txt key={i} v="bodyBold" c={c} style={{ fontFamily: font.bodyHeavy }}>
            {p.slice(2, -2)}
          </Txt>
        ) : (
          p
        ),
      )}
    </Txt>
  );
}

export function Markdown({ body }: { body: string }) {
  const lines = body.split('\n');
  return (
    <View style={{ gap: 8 }}>
      {lines.map((raw, i) => {
        const l = raw.trimEnd();
        if (!l.trim()) return <View key={i} style={{ height: 4 }} />;
        if (l.startsWith('# ')) return <Txt key={i} v="h1">{l.slice(2)}</Txt>;
        if (l.startsWith('## ')) return <Txt key={i} v="h3" c={color.volt} style={{ marginTop: 8 }}>{l.slice(3)}</Txt>;
        if (/^[-•]\s/.test(l))
          return (
            <View key={i} style={{ flexDirection: 'row', gap: 10, paddingRight: 8 }}>
              <Txt v="body" c={color.ultra}>•</Txt>
              <View style={{ flex: 1 }}>
                <Inline text={l.replace(/^[-•]\s/, '')} />
              </View>
            </View>
          );
        return <Inline key={i} text={l} />;
      })}
    </View>
  );
}
