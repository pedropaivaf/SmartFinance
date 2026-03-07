-- SmartFinance Database Schema
-- Run this in Supabase Dashboard > SQL Editor

-- Transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recurrence TEXT DEFAULT 'single' CHECK (recurrence IN ('single', 'monthly', 'installment')),
  paid BOOLEAN DEFAULT FALSE,
  payment_method TEXT,
  credit_card_name TEXT,
  group_id TEXT,
  source_of TEXT,
  inserted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goals table
CREATE TABLE IF NOT EXISTS public.goals (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  income_goal NUMERIC(12,2),
  expense_goal NUMERIC(12,2),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Envelopes table (premium)
CREATE TABLE IF NOT EXISTS public.envelopes (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  monthly_limit NUMERIC(12,2) NOT NULL,
  color TEXT
);

-- Credit Cards table (premium)
CREATE TABLE IF NOT EXISTS public.credit_cards (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  limit_total NUMERIC(12,2) NOT NULL,
  closing_day INTEGER NOT NULL,
  due_day INTEGER NOT NULL,
  color TEXT
);

-- User Preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'light',
  language TEXT DEFAULT 'pt-BR',
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
  summary_order JSONB DEFAULT '["income","expense","paid","balance"]'::jsonb,
  notification_prefs JSONB DEFAULT '{"enabled":false}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Connected Banks (Open Finance)
CREATE TABLE IF NOT EXISTS public.connected_banks (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  connector_name TEXT,
  connected_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (LGPD compliance - users can only access their own data)
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.envelopes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connected_banks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'own_transactions') THEN
    CREATE POLICY own_transactions ON public.transactions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'own_goals') THEN
    CREATE POLICY own_goals ON public.goals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'own_envelopes') THEN
    CREATE POLICY own_envelopes ON public.envelopes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'own_credit_cards') THEN
    CREATE POLICY own_credit_cards ON public.credit_cards FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'own_user_preferences') THEN
    CREATE POLICY own_user_preferences ON public.user_preferences FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'own_connected_banks') THEN
    CREATE POLICY own_connected_banks ON public.connected_banks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tx_user ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_tx_created ON public.transactions(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_envelopes_user ON public.envelopes(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_cards_user ON public.credit_cards(user_id);
