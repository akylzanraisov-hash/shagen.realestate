import { requestRecordingPermissionsAsync } from 'expo-audio';
import { useState } from 'react';
import { StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Glass, Logo, Mascot } from '@/components/chrome';
import { Screen } from '@/components/Screen';
import { Button, Txt } from '@/components/ui';
import { Wave } from '@/components/Wave';
import { initNotifications } from '@/lib/notify';
import { useStore } from '@/lib/store';
import { color, font } from '@/theme/tokens';

/** Three calm steps, big type, one field per step — made for people who hate setup. */
export default function Onboarding() {
  const { width } = useWindowDimensions();
  const { profile, setProfile, setOnboarded } = useStore();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.whatsapp ?? '');

  const finish = async () => {
    setProfile({ name: name.trim(), whatsapp: phone.trim() || undefined });
    await requestRecordingPermissionsAsync().catch(() => undefined);
    await initNotifications().catch(() => undefined);
    setOnboarded(true);
  };

  return (
    <Screen>
      <View style={{ marginTop: 8 }}>
        <Logo />
      </View>

      {step === 0 && (
        <Animated.View entering={FadeInDown.duration(400)} style={{ gap: 18 }}>
          <View style={{ alignItems: 'center', marginTop: 20 }}>
            <Mascot size={110} />
          </View>
          <Txt v="h1">Я Zumi — ваш{'\n'}голосовой ассистент</Txt>
          <Glass tint={color.ultra}>
            <View style={{ alignItems: 'center' }}>
              <Wave width={width - 80} height={80} calm={0.5} />
            </View>
            <View style={{ gap: 10, marginTop: 8 }}>
              <Txt v="body">🗣 Скажите: <Txt v="bodyBold">«Привет, Зуми, встреча с Айгерим в пятницу в 15:00»</Txt></Txt>
              <Txt v="body">📅 Я поставлю её в календарь и напомню в WhatsApp</Txt>
              <Txt v="body">📞 Запишу звонок и пришлю короткую выжимку</Txt>
              <Txt v="body">💼 Сама заполню карточку клиента</Txt>
            </View>
          </Glass>
          <Button title="Начать" icon="arrow-right" onPress={() => setStep(1)} />
        </Animated.View>
      )}

      {step === 1 && (
        <Animated.View entering={FadeInDown.duration(400)} style={{ gap: 18, marginTop: 30 }}>
          <Txt v="h1">Как к вам{'\n'}обращаться?</Txt>
          <Glass pad={4}>
            <TextInput autoFocus value={name} onChangeText={setName} placeholder="Имя" placeholderTextColor={color.textMute} style={styles.input} returnKeyType="next" onSubmitEditing={() => name.trim() && setStep(2)} />
          </Glass>
          <Button title="Дальше" icon="arrow-right" disabled={!name.trim()} onPress={() => setStep(2)} />
        </Animated.View>
      )}

      {step === 2 && (
        <Animated.View entering={FadeInDown.duration(400)} style={{ gap: 18, marginTop: 30 }}>
          <Txt v="h1">Ваш WhatsApp</Txt>
          <Txt v="body" c={color.textDim}>Сюда я буду присылать напоминания и итоги звонков.</Txt>
          <Glass pad={4}>
            <TextInput autoFocus value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+7 7__ ___ __ __" placeholderTextColor={color.textMute} style={styles.input} />
          </Glass>
          <Button title="Готово" icon="check" onPress={finish} />
          <Button title="Пропустить" kind="ghost" onPress={finish} />
        </Animated.View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: { color: color.text, fontFamily: font.display, fontSize: 24, padding: 16 },
});
