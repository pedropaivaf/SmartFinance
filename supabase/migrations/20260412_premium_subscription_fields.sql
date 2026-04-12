-- Phase 3: Premium subscription fields on user_preferences
-- Run this in the Supabase SQL Editor (or via `supabase db push`).

alter table public.user_preferences
  add column if not exists premium_expires_at timestamptz;

alter table public.user_preferences
  add column if not exists plan_source text
    check (plan_source in ('web', 'ios', 'android', 'manual'));

alter table public.user_preferences
  add column if not exists plan_provider_id text;

alter table public.user_preferences
  add column if not exists trial_started_at timestamptz;

-- Index to support expiration sweeps (cron job or analytic queries)
create index if not exists user_preferences_premium_expires_at_idx
  on public.user_preferences (premium_expires_at)
  where premium_expires_at is not null;

comment on column public.user_preferences.premium_expires_at is
  'When the current premium period ends. NULL = grandfathered lifetime or legacy.';
comment on column public.user_preferences.plan_source is
  'Which billing rail granted this plan: web (Stripe), ios/android (RevenueCat), manual (admin).';
comment on column public.user_preferences.plan_provider_id is
  'External customer/subscription id — Stripe customer or RevenueCat appUserID.';
comment on column public.user_preferences.trial_started_at is
  'When the free trial began. NULL if user never started a trial.';
