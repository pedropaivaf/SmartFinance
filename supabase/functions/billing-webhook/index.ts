// Supabase Edge Function: billing-webhook
// Unified webhook endpoint that accepts events from BOTH RevenueCat and Stripe
// and writes them to user_preferences. This is the source of truth for the
// premium plan state; the client's optimistic updates are only a fallback.
//
// Required secrets (set via `supabase functions secrets set`):
//   STRIPE_SECRET_KEY          — sk_test_… or sk_live_…
//   STRIPE_WEBHOOK_SECRET      — whsec_… from Stripe Dashboard → Webhooks
//   REVENUECAT_WEBHOOK_SECRET  — shared secret you set in RevenueCat
//   SUPABASE_URL               — auto-provided
//   SUPABASE_SERVICE_ROLE_KEY  — auto-provided; used to bypass RLS on writes
//
// Deploy with: supabase functions deploy billing-webhook --no-verify-jwt
//
// Configure in Stripe:   Developers → Webhooks → Add endpoint
//   URL: https://<project>.functions.supabase.co/billing-webhook
//   Events: checkout.session.completed,
//           customer.subscription.updated,
//           customer.subscription.deleted,
//           invoice.payment_failed
//
// Configure in RevenueCat: Integrations → Webhooks
//   URL: same as above
//   Authorization header: Bearer <REVENUECAT_WEBHOOK_SECRET>

import Stripe from 'https://esm.sh/stripe@14?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, stripe-signature, content-type',
};

function text(body: string, status = 200) {
  return new Response(body, { status, headers: CORS_HEADERS });
}

type PlanUpdate = {
  userId: string;
  plan: 'free' | 'premium';
  premiumExpiresAt: string | null;
  planSource: 'web' | 'ios' | 'android' | 'manual';
  planProviderId: string | null;
};

function getServiceClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

async function upsertUserPlan(update: PlanUpdate) {
  const supabase = getServiceClient();
  const row = {
    user_id: update.userId,
    plan: update.plan,
    premium_expires_at: update.premiumExpiresAt,
    plan_source: update.planSource,
    plan_provider_id: update.planProviderId,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from('user_preferences').upsert(row, { onConflict: 'user_id' });
  if (error) {
    console.error('[billing-webhook] db upsert failed', error);
    throw error;
  }
}

// ── Stripe handling ──────────────────────────────────────────────────────

async function handleStripe(req: Request, rawBody: string): Promise<Response> {
  const sig = req.headers.get('stripe-signature');
  const secret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!sig || !secret || !stripeKey) return text('stripe-misconfigured', 500);

  const stripe = new Stripe(stripeKey, { apiVersion: '2024-11-20.acacia' });
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, sig, secret);
  } catch (err) {
    console.error('[billing-webhook] stripe signature verify failed', err);
    return text('invalid-signature', 400);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = (session.client_reference_id as string | null) ?? session.metadata?.supabase_user_id;
        if (!userId || !session.subscription) break;
        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        await upsertUserPlan({
          userId,
          plan: 'premium',
          premiumExpiresAt: new Date(sub.current_period_end * 1000).toISOString(),
          planSource: 'web',
          planProviderId: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
        });
        break;
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const userId = (sub.metadata?.supabase_user_id as string | undefined) ?? null;
        if (!userId) break;
        const active = sub.status === 'active' || sub.status === 'trialing';
        await upsertUserPlan({
          userId,
          plan: active ? 'premium' : 'free',
          premiumExpiresAt: active ? new Date(sub.current_period_end * 1000).toISOString() : null,
          planSource: 'web',
          planProviderId: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
        });
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const userId = (sub.metadata?.supabase_user_id as string | undefined) ?? null;
        if (!userId) break;
        await upsertUserPlan({
          userId,
          plan: 'free',
          premiumExpiresAt: null,
          planSource: 'web',
          planProviderId: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
        });
        break;
      }
      case 'invoice.payment_failed': {
        // Leave plan as premium until subscription.deleted fires; just log.
        console.warn('[billing-webhook] stripe payment failed', (event.data.object as Stripe.Invoice).id);
        break;
      }
      default:
        // Ignore other events.
        break;
    }
    return text('ok');
  } catch (err) {
    console.error('[billing-webhook] stripe handler error', err);
    return text('handler-error', 500);
  }
}

// ── RevenueCat handling ──────────────────────────────────────────────────

type RevenueCatEvent = {
  api_version?: string;
  event: {
    type: string;
    app_user_id: string;
    original_app_user_id?: string;
    expiration_at_ms?: number;
    store?: 'APP_STORE' | 'PLAY_STORE' | 'MAC_APP_STORE' | 'AMAZON' | 'STRIPE';
    environment?: 'SANDBOX' | 'PRODUCTION';
    product_id?: string;
  };
};

function rcStoreToSource(store: string | undefined): PlanUpdate['planSource'] {
  if (store === 'APP_STORE' || store === 'MAC_APP_STORE') return 'ios';
  if (store === 'PLAY_STORE' || store === 'AMAZON') return 'android';
  return 'manual';
}

async function handleRevenueCat(req: Request, rawBody: string): Promise<Response> {
  const secret = Deno.env.get('REVENUECAT_WEBHOOK_SECRET');
  if (!secret) return text('rc-misconfigured', 500);
  const auth = req.headers.get('authorization') ?? '';
  if (auth !== `Bearer ${secret}`) return text('invalid-auth', 401);

  let payload: RevenueCatEvent;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return text('invalid-body', 400);
  }
  const ev = payload?.event;
  if (!ev?.type || !ev.app_user_id) return text('invalid-event', 400);

  try {
    const activeTypes = new Set([
      'INITIAL_PURCHASE',
      'RENEWAL',
      'PRODUCT_CHANGE',
      'UNCANCELLATION',
      'NON_RENEWING_PURCHASE',
      'SUBSCRIPTION_EXTENDED',
    ]);
    const inactiveTypes = new Set(['EXPIRATION', 'CANCELLATION', 'SUBSCRIPTION_PAUSED']);

    if (activeTypes.has(ev.type)) {
      await upsertUserPlan({
        userId: ev.app_user_id,
        plan: 'premium',
        premiumExpiresAt: ev.expiration_at_ms ? new Date(ev.expiration_at_ms).toISOString() : null,
        planSource: rcStoreToSource(ev.store),
        planProviderId: ev.original_app_user_id ?? ev.app_user_id,
      });
    } else if (inactiveTypes.has(ev.type)) {
      await upsertUserPlan({
        userId: ev.app_user_id,
        plan: 'free',
        premiumExpiresAt: null,
        planSource: rcStoreToSource(ev.store),
        planProviderId: ev.original_app_user_id ?? ev.app_user_id,
      });
    } else if (ev.type === 'BILLING_ISSUE') {
      // Log but do not downgrade yet — RevenueCat will fire EXPIRATION if it doesn't resolve.
      console.warn('[billing-webhook] revenuecat billing issue for', ev.app_user_id);
    }
    return text('ok');
  } catch (err) {
    console.error('[billing-webhook] revenuecat handler error', err);
    return text('handler-error', 500);
  }
}

// ── Router ───────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });
  if (req.method !== 'POST') return text('method-not-allowed', 405);

  const raw = await req.text();

  if (req.headers.get('stripe-signature')) {
    return handleStripe(req, raw);
  }
  if (req.headers.get('authorization')?.startsWith('Bearer ')) {
    return handleRevenueCat(req, raw);
  }
  return text('unknown-provider', 400);
});
