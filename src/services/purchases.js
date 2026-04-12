import { isNativeApp, nativePlatform } from '../utils/platform.js';

let sdkCache = null;

async function getSDK() {
  if (sdkCache) return sdkCache;
  const mod = await import('@revenuecat/purchases-capacitor');
  sdkCache = mod;
  return mod;
}

function getApiKey() {
  const platform = nativePlatform();
  if (platform === 'ios') return import.meta.env.VITE_REVENUECAT_IOS_KEY;
  if (platform === 'android') return import.meta.env.VITE_REVENUECAT_ANDROID_KEY;
  return null;
}

let initialized = false;

export async function initPurchases(userId) {
  if (!isNativeApp()) return { skipped: true };
  if (initialized) return { alreadyInitialized: true };

  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn('[purchases] missing RevenueCat API key for platform', nativePlatform());
    return { skipped: true, reason: 'no-key' };
  }

  try {
    const { Purchases, LOG_LEVEL } = await getSDK();
    await Purchases.setLogLevel({ level: LOG_LEVEL.WARN });
    await Purchases.configure({ apiKey, appUserID: userId });
    initialized = true;
    return { ok: true };
  } catch (err) {
    console.error('[purchases] configure failed', err);
    return { ok: false, error: err };
  }
}

export async function getOfferings() {
  if (!isNativeApp()) return null;
  try {
    const { Purchases } = await getSDK();
    const { current } = await Purchases.getOfferings();
    return current;
  } catch (err) {
    console.error('[purchases] getOfferings failed', err);
    return null;
  }
}

export async function getPackageByIdentifier(packageId) {
  const offering = await getOfferings();
  if (!offering?.availablePackages) return null;
  return offering.availablePackages.find((p) => p.identifier === packageId) || null;
}

export async function purchasePackage(pkg) {
  if (!isNativeApp()) return { ok: false, error: 'not-native' };
  try {
    const { Purchases } = await getSDK();
    const result = await Purchases.purchasePackage({ aPackage: pkg });
    return { ok: true, result };
  } catch (err) {
    if (err?.userCancelled) return { ok: false, cancelled: true };
    console.error('[purchases] purchase failed', err);
    return { ok: false, error: err };
  }
}

export async function restorePurchases() {
  if (!isNativeApp()) return { ok: false, error: 'not-native' };
  try {
    const { Purchases } = await getSDK();
    const result = await Purchases.restorePurchases();
    return { ok: true, result };
  } catch (err) {
    console.error('[purchases] restore failed', err);
    return { ok: false, error: err };
  }
}

export async function getCustomerInfo() {
  if (!isNativeApp()) return null;
  try {
    const { Purchases } = await getSDK();
    const { customerInfo } = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (err) {
    console.error('[purchases] getCustomerInfo failed', err);
    return null;
  }
}

/**
 * Checa o entitlement "premium" e devolve um objeto pronto pra gravar
 * em user_preferences (chaves camelCase compatíveis com supabaseService).
 * Retorna null se entitlement não está ativo.
 */
export function extractPremiumPayload(customerInfo) {
  if (!customerInfo) return null;
  const ent = customerInfo.entitlements?.active?.premium;
  if (!ent) return null;
  return {
    plan: 'premium',
    premiumExpiresAt: ent.expirationDate || null,
    planSource: nativePlatform() === 'ios' ? 'ios' : 'android',
    planProviderId: customerInfo.originalAppUserId || null,
  };
}
