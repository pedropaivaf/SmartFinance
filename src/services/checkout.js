import { supabase } from './supabaseClient.js';

/**
 * Calls the Supabase Edge Function that creates a Stripe Checkout Session
 * and returns the redirect URL. Caller should navigate the browser there.
 *
 * @param {'monthly'|'annual'} packageId
 */
export async function createCheckoutSession(packageId) {
  const { data, error } = await supabase.functions.invoke('create-checkout-session', {
    body: { packageId },
  });
  if (error) {
    console.error('[checkout] invoke failed', error);
    return { ok: false, error };
  }
  if (!data?.url) {
    return { ok: false, error: new Error('no-url') };
  }
  return { ok: true, url: data.url };
}

export function isReturningFromCheckout() {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('checkout') === 'success';
}

export function clearCheckoutQueryParam() {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  url.searchParams.delete('checkout');
  window.history.replaceState({}, '', url.toString());
}
