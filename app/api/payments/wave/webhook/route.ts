// POST /api/payments/wave/webhook
// Reçoit les événements Wave checkout.session.completed
// → crée subscription + paiement + envoie WhatsApp

import { NextRequest, NextResponse } from "next/server";
import { verifyWaveWebhookSignature, type WaveWebhookEvent } from "@/lib/wave";
import { createServiceClient } from "@/lib/supabase/service";
import { notifySubscriptionConfirmed } from "@/lib/whatsapp";

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}
function toDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("wave-signature") ?? "";

  if (!verifyWaveWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Signature invalide" }, { status: 401 });
  }

  let event: WaveWebhookEvent;
  try {
    event = JSON.parse(rawBody) as WaveWebhookEvent;
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  // On ne traite que les paiements réussis
  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data;
  if (session.checkout_status !== "complete") {
    return NextResponse.json({ received: true });
  }

  const supabase = createServiceClient();

  // Trouver la demande via client_reference (= mobile_money_request.id)
  const { data: mmRequest, error: fetchError } = await supabase
    .from("mobile_money_requests")
    .select("*, subscription_types(id, name, duration_days, sessions, price), members(id, full_name, phone), gyms(id, name, whatsapp_phone, phone)")
    .eq("id", session.client_reference)
    .eq("status", "pending")
    .single();

  if (fetchError || !mmRequest) {
    // Déjà traité ou introuvable — idempotent
    return NextResponse.json({ received: true });
  }

  const type = mmRequest.subscription_types as { id: string; name: string; duration_days: number; sessions: number | null; price: number } | null;
  const member = mmRequest.members as { id: string; full_name: string; phone: string | null } | null;
  const gymData = mmRequest.gyms as { id: string; name: string; whatsapp_phone: string | null; phone: string | null } | null;

  if (!type || !member || !gymData) {
    return NextResponse.json({ error: "Données incomplètes" }, { status: 422 });
  }

  const now = new Date();
  const expiresAt = addDays(now, type.duration_days);

  // Expirer l'ancien abonnement actif
  await supabase
    .from("subscriptions")
    .update({ status: "expired" })
    .eq("gym_id", mmRequest.gym_id)
    .eq("member_id", member.id)
    .eq("status", "active");

  // Créer le nouvel abonnement
  const { data: subscription, error: subError } = await supabase
    .from("subscriptions")
    .insert({
      gym_id: mmRequest.gym_id,
      member_id: member.id,
      subscription_type_id: type.id,
      starts_at: toDateString(now),
      expires_at: toDateString(expiresAt),
      sessions_left: type.sessions,
      price_paid: type.price,
    })
    .select("id")
    .single();

  if (subError || !subscription) {
    console.error("[Wave webhook] subscription insert error:", subError?.message);
    return NextResponse.json({ error: "Erreur création abonnement" }, { status: 500 });
  }

  // Créer le paiement
  await supabase.from("payments").insert({
    gym_id: mmRequest.gym_id,
    member_id: member.id,
    subscription_id: subscription.id,
    kind: "subscription",
    method: "wave",
    amount: type.price,
  });

  // Marquer la demande comme complète
  await supabase
    .from("mobile_money_requests")
    .update({
      status: "complete",
      provider_session_id: session.id,
      provider_txn_id: session.id,
      webhook_received_at: now.toISOString(),
    })
    .eq("id", mmRequest.id);

  // Notifier le membre par WhatsApp
  if (member.phone) {
    const gymContact = gymData.whatsapp_phone || gymData.phone || "";
    await notifySubscriptionConfirmed({
      phone: member.phone,
      memberName: member.full_name,
      gymName: gymData.name,
      planName: type.name,
      expiresAt: toDateString(expiresAt),
      gymContact,
    });
  }

  return NextResponse.json({ received: true });
}
