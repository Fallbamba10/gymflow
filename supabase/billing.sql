-- GymFlow billing schema
-- Run this after schema.sql

-- Colonnes billing sur la table gyms
alter table public.gyms
  add column if not exists stripe_customer_id    text,
  add column if not exists stripe_subscription_id text,
  add column if not exists billing_status         text not null default 'trialing',
  -- trialing | active | past_due | canceled | incomplete
  add column if not exists trial_ends_at          timestamptz,
  add column if not exists billing_period_end     timestamptz;

-- Index pour le lookup webhook Stripe → gym
create unique index if not exists gyms_stripe_customer_id_idx
  on public.gyms (stripe_customer_id)
  where stripe_customer_id is not null;

-- RLS : les admins peuvent lire leur propre statut billing
-- (gyms est déjà protégé par les policies existantes)
