// POST /api/billing/wave
// Crée un checkout Wave pour l'abonnement GymFlow mensuel (5900 FCFA)
// Retourne { payment_url, request_id }

import { NextRequest, NextResponse } from "next/server";
import { createWaveCheckout, isWaveConfigured } from "@/lib/wave";
import { createClient } from "@/lib/supabase/server";
import { getCurrentGym } from "@/lib/supabase/queries";

const GYMFLOW_MONTHLY_PRICE = 5900; // XOF

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
      provider: "wave",
      status: "pending",
      amount: GYMFLOW_MONTHLY_PRICE,
      currency: "XOF",
    })
    .select("id")
    .single();

  if (insertError || !mmRequest) {
    return NextResponse.json({ error: "Erreur création demande" }, { status: 500 });
  }

  if (!isWaveConfigured()) {
    return NextResponse.json({
      request_id: mmRequest.id,
      payment_url: null,
      demo: true,
      message: "Wave non configuré — ajoute WAVE_API_KEY dans les variables d'environnement.",
    });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://gymflow.app";
  const session = await createWaveCheckout({
    amount: GYMFLOW_MONTHLY_PRICE,
    currency: "XOF",
    clientReference: `billing_${mmRequest.id}`,
    successUrl: `${baseUrl}/billing?success=1`,
    errorUrl: `${baseUrl}/billing?canceled=1`,
  });

  if (!session) {
    return NextResponse.json({ error: "Erreur Wave API" }, { status: 502 });
  }

  await supabase
    .from("mobile_money_requests")
    .update({
      provider_session_id: session.id,
      provider_payment_url: session.wave_launch_url,
    })
    .eq("id", mmRequest.id);

  return NextResponse.json({
    request_id: mmRequest.id,
    payment_url: session.wave_launch_url,
  });
}
