import { supabase } from './supabaseClient.js';

/**
 * Calls the Supabase Edge Function that creates a Stripe Checkout Session
 * and returns the redirect URL. Caller should navigate the browser there.
 *
 * @param {'monthly'|'annual'} packageId
 */
export async function createCheckoutSession(packageId) {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;
  if (!accessToken) {
    console.error('[checkout] no active session');
    return { ok: false, error: new Error('no-session') };
  }
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: anonKey,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ packageId }),
    });
    const text = await res.text();
    let data = null;
    try { data = JSON.parse(text); } catch { /* non-JSON */ }
    if (!res.ok) {
      console.error('[checkout] http error', res.status, text);
      return { ok: false, error: new Error(`http-${res.status}`) };
    }
    if (!data?.url) {
      return { ok: false, error: new Error('no-url') };
    }
    return { ok: true, url: data.url };
  } catch (err) {
    console.error('[checkout] fetch failed', err);
    return { ok: false, error: err };
  }
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
