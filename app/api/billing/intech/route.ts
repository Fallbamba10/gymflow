// POST /api/billing/intech
// Initie un cash-in Intech pour l'abonnement GymFlow mensuel.
// Body: { service: IntechService, phone: string }

import { NextRequest, NextResponse } from "next/server";
import { intechCashIn, isIntechConfigured, type IntechService } from "@/lib/intech";
import { createClient } from "@/lib/supabase/server";
import { getCurrentGym } from "@/lib/supabase/queries";

const GYMFLOW_MONTHLY_PRICE = 5900;

const VALID_SERVICES: IntechService[] = [
  "WAVE_SN_API_CASH_IN",
  "ORANGE_SN_API_CASH_IN",
  "FREE_SN_WALLET_CASH_IN",
  "WIZALL_SN_API_CASH_IN",
];

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const gym = await getCurrentGym();
  if (!gym) return NextResponse.json({ error: "Salle introuvable" }, { status: 404 });

  const body = (await req.json()) as { service: IntechService; phone: string };
  const { service, phone } = body;

  if (!service || !VALID_SERVICES.includes(service)) {
    return NextResponse.json({ error: "Service invalide" }, { status: 400 });
  }
  if (!phone) {
    return NextResponse.json({ error: "Numéro de téléphone requis" }, { status: 400 });
  }

  const { data: mmRequest, error: insertError } = await supabase
    .from("mobile_money_requests")
    .insert({
      gym_id: gym.id,
      kind: "gymflow_billing",
      provider: "intech",
      status: "pending",
      amount: GYMFLOW_MONTHLY_PRICE,
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
    phone,
    amount: GYMFLOW_MONTHLY_PRICE,
    codeService: service,
    externalTransactionId: mmRequest.id,
    callbackUrl: `${baseUrl}/api/billing/intech/webhook`,
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
