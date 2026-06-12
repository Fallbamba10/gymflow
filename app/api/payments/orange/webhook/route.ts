// POST /api/payments/orange/webhook
// Reçoit la notification Orange Money WebPay (notif_url)
// → crée subscription + paiement + envoie WhatsApp

import { NextRequest, NextResponse } from "next/server";
import { type OrangeMoneyNotif } from "@/lib/orange-money";
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
  let notif: OrangeMoneyNotif;
  try {
    notif = (await req.json()) as OrangeMoneyNotif;
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  // Orange Money envoie aussi des notifications PENDING — on ignore
  if (notif.status !== "SUCCESS") {
    return NextResponse.json({ received: true });
  }

  const supabase = createServiceClient();

  // orderId = mmRequest.id
  const { data: mmRequest, error: fetchError } = await supabase
    .from("mobile_money_requests")
    .select("*, subscription_types(id, name, duration_days, sessions, price), members(id, full_name, phone), gyms(id, name, whatsapp_phone, phone)")
    .eq("id", notif.orderId)
    .eq("status", "pending")
    .single();

  if (fetchError || !mmRequest) {
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

  await supabase
    .from("subscriptions")
    .update({ status: "expired" })
    .eq("gym_id", mmRequest.gym_id)
    .eq("member_id", member.id)
    .eq("status", "active");

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
    console.error("[Orange webhook] subscription insert error:", subError?.message);
    return NextResponse.json({ error: "Erreur création abonnement" }, { status: 500 });
  }

  await supabase.from("payments").insert({
    gym_id: mmRequest.gym_id,
    member_id: member.id,
    subscription_id: subscription.id,
    kind: "subscription",
    method: "orange_money",
    amount: type.price,
  });

  await supabase
    .from("mobile_money_requests")
    .update({
      status: "complete",
      provider_txn_id: notif.txnid,
      webhook_received_at: now.toISOString(),
    })
    .eq("id", mmRequest.id);

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
