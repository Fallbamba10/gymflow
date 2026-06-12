// POST /api/payments/paydunya
// Crée une facture PayDunya pour le renouvellement d'abonnement d'un membre.
// Body: { member_id, subscription_type_id }
// Retourne { payment_url, request_id }

import { NextRequest, NextResponse } from "next/server";
import { createPayDunyaInvoice, isPayDunyaConfigured } from "@/lib/paydunya";
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

  const [memberRes, typeRes, gymRes] = await Promise.all([
    supabase.from("members").select("id, full_name, phone").eq("id", member_id).eq("gym_id", gym.id).single(),
    supabase.from("subscription_types").select("id, name, price").eq("id", subscription_type_id).eq("gym_id", gym.id).single(),
    supabase.from("gyms").select("name").eq("id", gym.id).single(),
  ]);

  if (memberRes.error || !memberRes.data) {
    return NextResponse.json({ error: "Membre introuvable" }, { status: 404 });
  }
  if (typeRes.error || !typeRes.data) {
    return NextResponse.json({ error: "Formule introuvable" }, { status: 404 });
  }

  const member = memberRes.data;
  const type = typeRes.data;
  const gymName = gymRes.data?.name ?? "GymFlow";

  // Créer la demande en base
  const { data: mmRequest, error: insertError } = await supabase
    .from("mobile_money_requests")
    .insert({
      gym_id: gym.id,
      kind: "member_subscription",
      provider: "paydunya",
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

  if (!isPayDunyaConfigured()) {
    return NextResponse.json({
      request_id: mmRequest.id,
      payment_url: null,
      demo: true,
      message: "PayDunya non configuré — ajoute PAYDUNYA_MASTER_KEY, PAYDUNYA_PRIVATE_KEY, PAYDUNYA_PUBLIC_KEY et PAYDUNYA_TOKEN dans les variables d'environnement.",
    });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://gymflow.app";
  const invoice = await createPayDunyaInvoice({
    amount: type.price,
    description: `Abonnement ${type.name} — ${member.full_name}`,
    clientReference: mmRequest.id,
    returnUrl: `${baseUrl}/members/${member.id}?payment=success`,
    cancelUrl: `${baseUrl}/members/${member.id}?payment=cancelled`,
    callbackUrl: `${baseUrl}/api/payments/paydunya/webhook`,
    storeName: gymName,
    items: [
      {
        name: type.name,
        quantity: 1,
        unit_price: String(type.price),
        total_price: String(type.price),
        description: `Abonnement salle de sport — ${member.full_name}`,
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
