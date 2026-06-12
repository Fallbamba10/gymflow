import { NextResponse } from "next/server";
import { stripe, SITE_URL } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { getCurrentGym } from "@/lib/supabase/queries";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const gym = await getCurrentGym();
  if (!gym) {
    return NextResponse.json({ error: "Salle introuvable" }, { status: 404 });
  }

  const { data: gymData } = await supabase
    .from("gyms")
    .select("stripe_customer_id")
    .eq("id", gym.id)
    .single();

  if (!gymData?.stripe_customer_id) {
    return NextResponse.json({ error: "Aucun abonnement Stripe trouvé" }, { status: 400 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: gymData.stripe_customer_id,
    return_url: `${SITE_URL}/billing`,
  });

  return NextResponse.json({ url: session.url });
}
