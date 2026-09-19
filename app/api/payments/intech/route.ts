// POST /api/payments/intech
// Initie un cash-in Intech pour le renouvellement d'abonnement d'un membre.
// Body: { member_id, subscription_type_id, service }
// service: WAVE_SN_API_CASH_IN | ORANGE_SN_API_CASH_IN | FREE_SN_WALLET_CASH_IN | WIZALL_SN_API_CASH_IN

import { NextRequest, NextResponse } from "next/server";
import { intechCashIn, isIntechConfigured, type IntechService } from "@/lib/intech";
import { requireAdminGym } from "@/lib/supabase/guards";
import { createClient } from "@/lib/supabase/server";

const VALID_SERVICES: IntechService[] = [
  "WAVE_SN_API_CASH_IN",
  "ORANGE_SN_API_CASH_IN",
  "FREE_SN_WALLET_CASH_IN",
  "WIZALL_SN_API_CASH_IN",
];

export async function POST(req: NextRequest) {
  const gym = await requireAdminGym();

  const body = (await req.json()) as {
    member_id: string;
    subscription_type_id: string;
    service: IntechService;
  };

  const { member_id, subscription_type_id, service } = body;

  if (!member_id || !subscription_type_id || !service) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  if (!VALID_SERVICES.includes(service)) {
    return NextResponse.json({ error: "Service invalide" }, { status: 400 });
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

  if (!member.phone) {
    return NextResponse.json({ error: "Le membre n'a pas de numéro de téléphone" }, { status: 422 });
  }

  const { data: mmRequest, error: insertError } = await supabase
    .from("mobile_money_requests")
    .insert({
      gym_id: gym.id,
      kind: "member_subscription",
      provider: "intech",
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

  if (!isIntechConfigured()) {
    return NextResponse.json({
      request_id: mmRequest.id,
      demo: true,
      message: "Intech non configuré — ajoute INTECH_API_KEY dans les variables d'environnement.",
    });
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gymflow.app";
  const result = await intechCashIn({
    phone: member.phone,
    amount: type.price,
    codeService: service,
    externalTransactionId: mmRequest.id,
    callbackUrl: `${baseUrl}/api/payments/intech/webhook`,
  });

  if (!result.success) {
    await supabase.from("mobile_money_requests").update({ status: "failed" }).eq("id", mmRequest.id);
    return NextResponse.json({ error: result.message ?? "Erreur Intech API" }, { status: 502 });
  }

  await supabase
    .from("mobile_money_requests")
    .update({ provider_session_id: result.transactionId ?? null })
    .eq("id", mmRequest.id);

  return NextResponse.json({ request_id: mmRequest.id, success: true });
}
