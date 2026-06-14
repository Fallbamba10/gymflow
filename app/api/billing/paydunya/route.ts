// POST /api/billing/paydunya
// Crée une facture PayDunya pour l'abonnement GymFlow mensuel (5900 FCFA)

import { NextResponse } from "next/server";
import { createPayDunyaInvoice, isPayDunyaConfigured } from "@/lib/paydunya";
import { createClient } from "@/lib/supabase/server";
import { getCurrentGym } from "@/lib/supabase/queries";

const GYMFLOW_MONTHLY_PRICE = 5900;

export async function POST(/* _req: NextRequest */) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const gym = await getCurrentGym();
  if (!gym) return NextResponse.json({ error: "Salle introuvable" }, { status: 404 });

  const { data: mmRequest, error: insertError } = await supabase
    .from("mobile_money_requests")
    .insert({
      gym_id: gym.id,
      kind: "gymflow_billing",
      provider: "paydunya",
      status: "pending",
      amount: GYMFLOW_MONTHLY_PRICE,
      currency: "XOF",
    })
    .select("id")
    .single();

  if (insertError || !mmRequest) {
    return NextResponse.json({ error: "Erreur création demande" }, { status: 500 });
  }

  if (!isPayDunyaConfigured()) {
    return NextResponse.json({
      request_id: mmRequest.id,
      payment_url: null,
      demo: true,
      message: "PayDunya non configuré — ajoute PAYDUNYA_MASTER_KEY, PAYDUNYA_PRIVATE_KEY, PAYDUNYA_PUBLIC_KEY et PAYDUNYA_TOKEN.",
    });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://gymflow.app";
  const invoice = await createPayDunyaInvoice({
    amount: GYMFLOW_MONTHLY_PRICE,
    description: "Abonnement GymFlow Pro — mensuel",
    clientReference: `billing_${mmRequest.id}`,
    returnUrl: `${baseUrl}/billing?success=1`,
    cancelUrl: `${baseUrl}/billing?canceled=1`,
    callbackUrl: `${baseUrl}/api/billing/paydunya/webhook`,
    storeName: "GymFlow",
    items: [
      {
        name: "GymFlow Pro",
        quantity: 1,
        unit_price: String(GYMFLOW_MONTHLY_PRICE),
        total_price: String(GYMFLOW_MONTHLY_PRICE),
        description: "Accès complet à GymFlow — 1 salle, membres illimités",
      },
    ],
  });

  if (!invoice) {
    return NextResponse.json({ error: "Erreur PayDunya API" }, { status: 502 });
  }

  await supabase
    .from("mobile_money_requests")
    .update({
      provider_session_id: invoice.token,
      provider_payment_url: invoice.invoice_url,
    })
    .eq("id", mmRequest.id);

  return NextResponse.json({
    request_id: mmRequest.id,
    payment_url: invoice.invoice_url,
  });
}
