// Supabase Edge Function: create-checkout-session
// Creates a Stripe Checkout Session for a Syros Premium subscription.
//
// Required environment variables (set via `supabase functions secrets set`):
//   STRIPE_SECRET_KEY          — sk_test_… or sk_live_…
//   STRIPE_PRICE_MONTHLY       — Stripe Price ID for the monthly plan (R$ 12,90)
//   STRIPE_PRICE_ANNUAL        — Stripe Price ID for the annual plan  (R$ 99,90)
//   PUBLIC_APP_URL             — e.g. https://syrosfinance.netlify.app
//
// Deploy with: supabase functions deploy create-checkout-session

import Stripe from 'https://esm.sh/stripe@14?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }
  if (req.method !== 'POST') {
    return json({ error: 'method-not-allowed' }, 405);
  }

  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  const publicAppUrl = Deno.env.get('PUBLIC_APP_URL');
  const priceMonthly = Deno.env.get('STRIPE_PRICE_MONTHLY');
  const priceAnnual = Deno.env.get('STRIPE_PRICE_ANNUAL');
  if (!stripeKey || !publicAppUrl || !priceMonthly || !priceAnnual) {
    return json({ error: 'server-misconfigured' }, 500);
  }

  // Authenticate the caller — reuses the anon key client so RLS applies.
  const authHeader = req.headers.get('Authorization') ?? '';
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) {
    return json({ error: 'unauthorized' }, 401);
  }
  const user = userData.user;

  let body: { packageId?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'invalid-body' }, 400);
  }

  const priceMap: Record<string, string> = {
    monthly: priceMonthly,
    annual: priceAnnual,
  };
  const price = body.packageId ? priceMap[body.packageId] : null;
  if (!price) {
    return json({ error: 'unknown-package' }, 400);
  }

  const stripe = new Stripe(stripeKey, { apiVersion: '2024-11-20.acacia' });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price, quantity: 1 }],
      success_url: `${publicAppUrl}/?checkout=success`,
      cancel_url: `${publicAppUrl}/?checkout=cancel`,
      client_reference_id: user.id,
      customer_email: user.email ?? undefined,
      subscription_data: {
        trial_period_days: 7,
        metadata: { supabase_user_id: user.id, package_id: body.packageId! },
      },
      metadata: { supabase_user_id: user.id, package_id: body.packageId! },
      allow_promotion_codes: true,
    });

    return json({ url: session.url });
  } catch (err) {
    console.error('[create-checkout-session] stripe error', err);
    return json({ error: 'stripe-error' }, 500);
  }
});
