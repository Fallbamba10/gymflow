// POST /api/billing/intech/webhook
// Reçoit les callbacks Intech pour l'abonnement SaaS GymFlow.
// → si SUCCESS : met à jour billing_status de la gym

import { NextRequest, NextResponse } from "next/server";
import { type IntechWebhookPayload, verifyIntechWebhook } from "@/lib/intech";
import { createServiceClient } from "@/lib/supabase/service";

const BILLING_DAYS = 30;

export async function POST(req: NextRequest) {
  let payload: IntechWebhookPayload;
  try {
    payload = (await req.json()) as IntechWebhookPayload;
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  if (!verifyIntechWebhook(payload)) {
    return NextResponse.json({ error: "Signature invalide" }, { status: 401 });
  }

  if (payload.status !== "SUCCESS") {
    return NextResponse.json({ received: true });
  }

  const requestId = payload.transaction.externalTransactionId;
  if (!requestId) return NextResponse.json({ received: true });

  const supabase = createServiceClient();

  const { data: mmRequest } = await supabase
    .from("mobile_money_requests")
    .select("id, gym_id, status")
    .eq("id", requestId)
    .eq("status", "pending")
    .single();

  if (!mmRequest) return NextResponse.json({ received: true });

  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setDate(periodEnd.getDate() + BILLING_DAYS);

  await supabase
    .from("gyms")
    .update({
      billing_status: "active",
      billing_period_end: periodEnd.toISOString(),
    })
    .eq("id", mmRequest.gym_id);

  await supabase
    .from("mobile_money_requests")
    .update({
      status: "complete",
      provider_txn_id: payload.transaction.transactionId,
      webhook_received_at: now.toISOString(),
    })
    .eq("id", mmRequest.id);

  return NextResponse.json({ received: true });
}
