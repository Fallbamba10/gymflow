// POST /api/payments/paydunya/webhook
// Reçoit les notifications PayDunya (callback_url)
// PayDunya envoie un POST avec le payload JSON quand le statut change.
// → si completed : crée subscription + paiement + envoie WhatsApp

import { NextRequest, NextResponse } from "next/server";
import { type PayDunyaWebhookPayload } from "@/lib/paydunya";
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
  let payload: PayDunyaWebhookPayload;
  try {
    payload = (await req.json()) as PayDunyaWebhookPayload;
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  // Ignorer les notifications non-completed
  if (payload.status !== "completed" || payload.response_code !== "00") {
    return NextResponse.json({ received: true });
  }

  // request_id est dans custom_data.request_id
  const requestId = payload.custom_data?.request_id;
  if (!requestId) {
    return NextResponse.json({ received: true });
  }

  const supabase = createServiceClient();

  const { data: mmRequest, error: fetchError } = await supabase
    .from("mobile_money_requests")
    .select(`
      *,
      subscription_types(id, name, duration_days, sessions, price),
      members(id, full_name, phone),
      gyms(id, name, whatsapp_phone, phone)
    `)
    .eq("id", requestId)
    .eq("status", "pending")
    .single();

  if (fetchError || !mmRequest) {
    // Déjà traité ou introuvable — idempotent
    return NextResponse.json({ received: true });
  }

  const type = mmRequest.subscription_types as {
    id: string; name: string; duration_days: number; sessions: number | null; price: number;
  } | null;
  const member = mmRequest.members as {
    id: string; full_name: string; phone: string | null;
  } | null;
  const gymData = mmRequest.gyms as {
    id: string; name: string; whatsapp_phone: string | null; phone: string | null;
  } | null;

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
    console.error("[PayDunya webhook] subscription error:", subError?.message);
    return NextResponse.json({ error: "Erreur création abonnement" }, { status: 500 });
  }

  // Enregistrer le paiement
  await supabase.from("payments").insert({
    gym_id: mmRequest.gym_id,
    member_id: member.id,
    subscription_id: subscription.id,
    kind: "subscription",
    method: "wave", // PayDunya agrège — on enregistre le vrai moyen si disponible
    amount: type.price,
  });

  // Marquer la demande complète
  await supabase
    .from("mobile_money_requests")
    .update({
      status: "complete",
      provider_txn_id: payload.invoice?.token,
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
