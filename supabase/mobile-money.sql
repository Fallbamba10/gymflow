-- Table pour tracker les demandes de paiement mobile money en attente
-- Agrégateur : PayDunya (Wave, Orange Money, Free Money, carte)

create table if not exists mobile_money_requests (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid references gyms(id) on delete cascade,

  -- Qui paye quoi
  kind text not null check (kind in ('member_subscription', 'gymflow_billing')),
  provider text not null check (provider in ('paydunya', 'wave', 'orange_money')),
  status text not null default 'pending' check (status in ('pending', 'complete', 'failed', 'expired')),

  -- Pour member_subscription
  member_id uuid references members(id) on delete set null,
  subscription_type_id uuid references subscription_types(id) on delete set null,

  -- Montant
  amount integer not null, -- en centimes XOF ou valeur brute
  currency text not null default 'XOF',

  -- Référence fournisseur
  provider_session_id text,    -- Wave: checkout session id / Orange: payToken
  provider_payment_url text,   -- URL de paiement à envoyer au client
  provider_txn_id text,        -- ID transaction final après confirmation

  -- Webhook result
  webhook_received_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index pour lookups rapides par provider_session_id (webhook)
create index if not exists idx_mmr_provider_session
  on mobile_money_requests(provider_session_id)
  where provider_session_id is not null;

-- Index pour lookups par gym
create index if not exists idx_mmr_gym
  on mobile_money_requests(gym_id, created_at desc);

-- RLS
alter table mobile_money_requests enable row level security;

create policy "gym admins can manage mobile money requests"
  on mobile_money_requests
  for all
  using (
    gym_id in (
      select gym_id from gym_users
      where user_id = auth.uid() and active = true
    )
  );
