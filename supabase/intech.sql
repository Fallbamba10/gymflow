-- GymFlow — Intech API integration
-- Run after supabase/mobile-money.sql

-- Ajoute 'intech' comme provider valide
alter table public.mobile_money_requests
  drop constraint if exists mobile_money_requests_provider_check;

alter table public.mobile_money_requests
  add constraint mobile_money_requests_provider_check
  check (provider in ('paydunya', 'wave', 'orange_money', 'intech'));
