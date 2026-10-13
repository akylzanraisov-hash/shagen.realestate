/**
 * Subscriptions via RevenueCat: one SDK on top of Apple In-App Purchase
 * (App Store) and Google Play Billing, so the same code ships on both stores.
 * Entitlement id: "pro". Products: zumi_pro_monthly, zumi_pro_yearly.
 */
import Purchases, { LOG_LEVEL, type CustomerInfo, type PurchasesPackage } from 'react-native-purchases';

import { config, hasPurchases } from './config';
import { useStore } from './store';

let configured = false;

const applyInfo = (info: CustomerInfo) => {
  useStore.getState().setPro(!!info.entitlements.active[config.entitlement]);
};

export async function initPurchases(appUserId?: string) {
  if (!hasPurchases() || configured) return;
  if (__DEV__) await Purchases.setLogLevel(LOG_LEVEL.WARN);
  Purchases.configure({ apiKey: config.revenueCatKey, appUserID: appUserId ?? null });
  configured = true;
  Purchases.addCustomerInfoUpdateListener(applyInfo);
  try {
    applyInfo(await Purchases.getCustomerInfo());
  } catch (e) {
    console.warn('purchases init', e);
  }
}

export interface Plan {
  id: string;
  title: string;
  price: string;
  period: 'month' | 'year';
  perMonth?: string;
  pkg?: PurchasesPackage;
}

/** Fallback prices shown when the store is unreachable (simulator / web / no keys). */
const DEMO_PLANS: Plan[] = [
  { id: 'year', title: 'Год', price: '49 990 ₸', perMonth: '4 166 ₸', period: 'year' },
  { id: 'month', title: 'Месяц', price: '6 990 ₸', period: 'month' },
];

export async function loadPlans(): Promise<Plan[]> {
  if (!hasPurchases()) return DEMO_PLANS;
  try {
    const offerings = await Purchases.getOfferings();
    const current = offerings.current;
    if (!current) return DEMO_PLANS;
    const plans: Plan[] = [];
    if (current.annual) {
      const p = current.annual.product;
      plans.push({
        id: current.annual.identifier,
        title: 'Год',
        price: p.priceString,
        perMonth: p.pricePerMonthString ?? undefined,
        period: 'year',
        pkg: current.annual,
      });
    }
    if (current.monthly) {
      plans.push({
        id: current.monthly.identifier,
        title: 'Месяц',
        price: current.monthly.product.priceString,
        period: 'month',
        pkg: current.monthly,
      });
    }
    return plans.length ? plans : DEMO_PLANS;
  } catch (e) {
    console.warn('offerings', e);
    return DEMO_PLANS;
  }
}

export type BuyResult = 'ok' | 'cancelled' | 'unavailable' | 'error';

export async function buy(plan: Plan): Promise<BuyResult> {
  if (!plan.pkg) {
    // No store connection: in dev builds let the team test Pro features.
    if (__DEV__) {
      useStore.getState().setPro(true);
      return 'ok';
    }
    return 'unavailable';
  }
  try {
    const { customerInfo } = await Purchases.purchasePackage(plan.pkg);
    applyInfo(customerInfo);
    return customerInfo.entitlements.active[config.entitlement] ? 'ok' : 'error';
  } catch (e) {
    if ((e as { userCancelled?: boolean }).userCancelled) return 'cancelled';
    console.warn('purchase', e);
    return 'error';
  }
}

export async function restore(): Promise<boolean> {
  if (!hasPurchases()) return useStore.getState().isPro;
  try {
    const info = await Purchases.restorePurchases();
    applyInfo(info);
    return !!info.entitlements.active[config.entitlement];
  } catch {
    return false;
  }
}
