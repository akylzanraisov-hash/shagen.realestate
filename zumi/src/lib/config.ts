import { Platform } from 'react-native';

/**
 * Public, client-side configuration. Only publishable keys belong here —
 * Anthropic / ElevenLabs / WhatsApp secrets live in Supabase Edge Function secrets.
 */
export const config = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  revenueCatKey:
    Platform.OS === 'ios'
      ? (process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '')
      : (process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? ''),
  entitlement: 'pro',
  /** Static viewer for published pages (see share-viewer/). Short links look like https://zumi.app/p/abc123 */
  shareBaseUrl: (process.env.EXPO_PUBLIC_SHARE_BASE_URL ?? 'https://zumi.app/p').replace(/\/$/, ''),
};

export const hasBackend = () => !!config.supabaseUrl && !!config.supabaseAnonKey;
export const hasPurchases = () => !!config.revenueCatKey && Platform.OS !== 'web';
