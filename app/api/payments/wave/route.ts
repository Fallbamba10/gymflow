// POST /api/payments/wave
// Crée un checkout Wave pour un abonnement membre.
// Body: { gym_id, member_id, subscription_type_id }
// Retourne { payment_url, request_id }

import { NextRequest, NextResponse } from "next/server";
import { createWaveCheckout, isWaveConfigured } from "@/lib/wave";
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

  // Créer la demande en base d'abord pour avoir l'id de référence
  const { data: mmRequest, error: insertError } = await supabase
    .from("mobile_money_requests")
    .insert({
      gym_id: gym.id,
      kind: "member_subscription",
      provider: "wave",
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

  if (!isWaveConfigured()) {
    // Mode démo : retourner l'ID sans vrai lien Wave
    return NextResponse.json({
      request_id: mmRequest.id,
      payment_url: null,
      demo: true,
      message: "Wave non configuré — ajoute WAVE_API_KEY dans les variables d'environnement.",
    });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://gymflow.app";
  const session = await createWaveCheckout({
    amount: type.price,
    currency: "XOF",
    clientReference: mmRequest.id,
    successUrl: `${baseUrl}/members/${member.id}?payment=wave_success`,
    errorUrl: `${baseUrl}/members/${member.id}?payment=wave_error`,
  });

  if (!session) {
    return NextResponse.json({ error: "Erreur Wave API" }, { status: 502 });
  }

  // Stocker l'ID de session Wave
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
