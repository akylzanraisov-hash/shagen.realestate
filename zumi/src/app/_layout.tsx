import {
  Manrope_500Medium,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import { Unbounded_700Bold } from '@expo-google-fonts/unbounded';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useFonts } from 'expo-font';
import { DarkTheme, router, Stack, ThemeProvider } from 'expo-router';
import { ShareIntentProvider, useShareIntentContext } from 'expo-share-intent';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { HandsFree } from '@/components/HandsFree';
import { syncCalls } from '@/lib/line';
import { openApp } from '@/lib/apps';
import { initNotifications, listenNotificationTaps } from '@/lib/notify';
import { initPurchases } from '@/lib/purchases';
import { setPendingShare } from '@/lib/shareInbox';
import { useHydrated, useStore } from '@/lib/store';
import { ensureSession, supabase } from '@/lib/supabase';
import { wakeWordAvailable } from '@/lib/wakeword';
import { color } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync();

const theme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: color.ink, card: color.ink, primary: color.volt, text: color.text, border: color.line },
};

/** Expo Go has no Share Extension native module. */
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

function ShareWatcher() {
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntentContext();
  useEffect(() => {
    if (!hasShareIntent) return;
    setPendingShare(shareIntent);
    resetShareIntent();
    router.push('/incoming');
  }, [hasShareIntent, shareIntent, resetShareIntent]);
  return null;
}

export default function RootLayout() {
  const [loaded] = useFonts({
    Unbounded_700Bold,
    Manrope_500Medium,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });
  const onboarded = useStore((s) => s.onboarded);
  const handsFree = useStore((s) => s.profile.handsFree);
  const hydrated = useHydrated();

  useEffect(() => listenNotificationTaps((spoken) => openApp(spoken)), []);

  useEffect(() => {
    if (loaded && hydrated) SplashScreen.hideAsync();
  }, [loaded, hydrated]);

  useEffect(() => {
    (async () => {
      let userId: string | undefined;
      try {
        await ensureSession();
        userId = (await supabase()?.auth.getUser())?.data.user?.id;
      } catch (e) {
        console.warn('session', e);
      }
      await initPurchases(userId);
      if (onboarded) {
        await initNotifications();
        syncCalls().catch(() => undefined);
      }
    })();
  }, [onboarded]);

  if (!loaded || !hydrated) return null;

  return (
    <ShareIntentProvider options={{ disabled: isExpoGo, resetOnBackground: true }}>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: color.ink }}>
        <ThemeProvider value={theme}>
          <StatusBar style="light" />
          {!isExpoGo && <ShareWatcher />}
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color.ink }, animation: 'fade_from_bottom' }}>
            <Stack.Protected guard={!onboarded}>
              <Stack.Screen name="onboarding" />
            </Stack.Protected>
            <Stack.Protected guard={onboarded}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="capture" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
              <Stack.Screen name="incoming" options={{ presentation: 'modal' }} />
              <Stack.Screen name="paywall" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
              <Stack.Screen name="memory" options={{ presentation: 'modal' }} />
              <Stack.Screen name="compose" options={{ presentation: 'modal' }} />
              <Stack.Screen name="broadcast/[id]" options={{ presentation: 'modal' }} />
            </Stack.Protected>
          </Stack>
          {onboarded && handsFree && wakeWordAvailable() ? <HandsFree /> : null}
        </ThemeProvider>
      </GestureHandlerRootView>
    </ShareIntentProvider>
  );
}
