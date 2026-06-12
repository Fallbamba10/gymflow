// POST /api/payments/orange
// Crée un paiement Orange Money WebPay pour un abonnement membre.
// Body: { member_id, subscription_type_id }

import { NextRequest, NextResponse } from "next/server";
import { createOrangeMoneyPayment, isOrangeMoneyConfigured } from "@/lib/orange-money";
import { createClient } from "@/lib/supabase/server";
import { requireAdminGym } from "@/lib/supabase/guards";

export async function POST(req: NextRequest) {
  const gym = await requireAdminGym();

  const body = await req.json() as {
    member_id: string;
    subscription_type_id: string;
  };

  const { member_id, subscription_type_id } = body;
  if (!member_id || !subscription_type_id) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  const supabase = await createClient();

  const [memberRes, typeRes] = await Promise.all([
    supabase.from("members").select("id, full_name, phone").eq("id", member_id).eq("gym_id", gym.id).single(),
    supabase.from("subscription_types").select("id, name, price").eq("id", subscription_type_id).eq("gym_id", gym.id).single(),
  ]);

  if (memberRes.error || !memberRes.data) {
    return NextResponse.json({ error: "Membre introuvable" }, { status: 404 });
  }
  if (typeRes.error || !typeRes.data) {
    return NextResponse.json({ error: "Formule introuvable" }, { status: 404 });
  }

  const member = memberRes.data;
  const type = typeRes.data;

  const { data: mmRequest, error: insertError } = await supabase
    .from("mobile_money_requests")
    .insert({
      gym_id: gym.id,
      kind: "member_subscription",
      provider: "orange_money",
      status: "pending",
      member_id: member.id,
      subscription_type_id: type.id,
      amount: type.price,
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
    amount: type.price,
    orderId: mmRequest.id,
    returnUrl: `${baseUrl}/members/${member.id}?payment=orange_success`,
    cancelUrl: `${baseUrl}/members/${member.id}?payment=orange_cancelled`,
    notifUrl: `${baseUrl}/api/payments/orange/webhook`,
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
