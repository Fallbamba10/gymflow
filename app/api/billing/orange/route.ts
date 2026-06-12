// POST /api/billing/orange
// Crée un paiement Orange Money pour l'abonnement GymFlow mensuel (5900 FCFA)

import { NextRequest, NextResponse } from "next/server";
import { createOrangeMoneyPayment, isOrangeMoneyConfigured } from "@/lib/orange-money";
import { createClient } from "@/lib/supabase/server";
import { getCurrentGym } from "@/lib/supabase/queries";

const GYMFLOW_MONTHLY_PRICE = 5900;

export async function POST(_req: NextRequest) {
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
      provider: "orange_money",
      status: "pending",
      amount: GYMFLOW_MONTHLY_PRICE,
      currency: "XOF",
    })
    .select("id")
    .single();

  if (insertError || !mmRequest) {
    return NextResponse.json({ error: "Erreur création demande" }, { status: 500 });
  }

  if (!isOrangeMoneyConfigured()) {
    return NextResponse.json({
      request_id: mmRequest.id,
      payment_url: null,
      demo: true,
      message: "Orange Money non configuré — ajoute ORANGE_MONEY_CLIENT_ID, ORANGE_MONEY_CLIENT_SECRET et ORANGE_MONEY_MERCHANT_KEY.",
    });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://gymflow.app";
  const payment = await createOrangeMoneyPayment({
    amount: GYMFLOW_MONTHLY_PRICE,
    orderId: `billing_${mmRequest.id}`,
    returnUrl: `${baseUrl}/billing?success=1`,
    cancelUrl: `${baseUrl}/billing?canceled=1`,
    notifUrl: `${baseUrl}/api/billing/orange/webhook`,
  });

  if (!payment || payment.inittxnstatus !== "Success") {
    return NextResponse.json({ error: "Erreur Orange Money API" }, { status: 502 });
  }

  await supabase
    .from("mobile_money_requests")
    .update({
      provider_session_id: payment.payToken,
      provider_payment_url: payment.paymentUrl,
    })
    .eq("id", mmRequest.id);

  return NextResponse.json({
    request_id: mmRequest.id,
    payment_url: payment.paymentUrl,
  });
}
