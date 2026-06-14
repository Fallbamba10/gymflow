import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY ?? "sk_placeholder";

export const stripe = new Stripe(key, {
  apiVersion: "2026-05-27.dahlia",
});

export const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID ?? "";
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Statuts considérés comme "accès actif"
export function isActiveSubscription(status: string | null | undefined): boolean {
  return status === "active" || status === "trialing";
}

// Durée trial par défaut : 14 jours
export const TRIAL_DAYS = 14;
