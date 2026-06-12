// POST /api/billing/paydunya/webhook
// Reçoit la confirmation PayDunya pour un paiement GymFlow billing
// Pour l'instant : marque la demande comme complète et log.
// L'activation de l'abonnement GymFlow via Stripe reste le flux principal ;
// ce webhook servira à activer manuellement si le gérant a payé par mobile money.

import { NextRequest, NextResponse } from "next/server";
import { type PayDunyaWebhookPayload } from "@/lib/paydunya";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(req: NextRequest) {
  let payload: PayDunyaWebhookPayload;
  try {
    payload = (await req.json()) as PayDunyaWebhookPayload;
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  if (payload.status !== "completed" || payload.response_code !== "00") {
    return NextResponse.json({ received: true });
  }

  const requestId = payload.custom_data?.request_id?.replace("billing_", "");
  if (!requestId) return NextResponse.json({ received: true });

  const supabase = createServiceClient();

  await supabase
    .from("mobile_money_requests")
    .update({
      status: "complete",
      provider_txn_id: payload.invoice?.token,
      webhook_received_at: new Date().toISOString(),
    })
    .eq("id", requestId)
    .eq("status", "pending");

  // TODO: quand PayDunya fournit un webhook de confiance avec signature,
  // activer ici l'abonnement GymFlow directement (mettre billing_status = 'active').

  return NextResponse.json({ received: true });
}
