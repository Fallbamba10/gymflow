// POST /api/payments/intech/webhook
// Reçoit les callbacks Intech après confirmation de paiement.
// → si SUCCESS : crée subscription + paiement + notifie WhatsApp via Intech

import { NextRequest, NextResponse } from "next/server";
import { type IntechWebhookPayload, verifyIntechWebhook, intechSendWhatsApp } from "@/lib/intech";
import { createServiceClient } from "@/lib/supabase/service";

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function POST(req: NextRequest) {
  let payload: IntechWebhookPayload;
  try {
    payload = (await req.json()) as IntechWebhookPayload;
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  // Vérification signature sha256
  if (!verifyIntechWebhook(payload)) {
    return NextResponse.json({ error: "Signature invalide" }, { status: 401 });
  }

  // Ignorer les statuts non finaux
  if (payload.status !== "SUCCESS") {
    return NextResponse.json({ received: true });
  }

  const requestId = payload.transaction.externalTransactionId;
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
    console.error("[Intech webhook] subscription error:", subError?.message);
    return NextResponse.json({ error: "Erreur création abonnement" }, { status: 500 });
  }

  // Déterminer la méthode de paiement
  const serviceCode = payload.transaction.codeService ?? "";
  const methodMap: Record<string, string> = {
    WAVE_SN_API_CASH_IN: "wave",
    ORANGE_SN_API_CASH_IN: "orange_money",
    FREE_SN_WALLET_CASH_IN: "other",
    WIZALL_SN_API_CASH_IN: "other",
  };
  const method = methodMap[serviceCode] ?? "other";

  // Enregistrer le paiement
  await supabase.from("payments").insert({
    gym_id: mmRequest.gym_id,
    member_id: member.id,
    subscription_id: subscription.id,
    kind: "subscription",
    method,
    amount: type.price,
    notes: `Intech ${serviceCode}`,
  });

  // Marquer la demande complète
  await supabase
    .from("mobile_money_requests")
    .update({
      status: "complete",
      provider_txn_id: payload.transaction.transactionId,
      webhook_received_at: now.toISOString(),
    })
    .eq("id", mmRequest.id);

  // Notifier le membre via WhatsApp Intech
  if (member.phone) {
    const firstName = member.full_name.split(" ")[0];
    await intechSendWhatsApp({
      phone: member.phone,
      message: `Bonjour ${firstName} ! Votre abonnement ${type.name} chez ${gymData.name} est confirmé. Valide jusqu'au ${toDateString(expiresAt)}. Bonne séance ! 💪`,
    });
  }

  return NextResponse.json({ received: true });
}
