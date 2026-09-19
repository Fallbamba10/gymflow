import { NextResponse } from "next/server";
import { stripe, STRIPE_PRICE_ID, SITE_URL } from "@/lib/stripe";
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

  if (!STRIPE_PRICE_ID) {
    return NextResponse.json({ error: "STRIPE_PRICE_ID non configuré" }, { status: 500 });
  }

  // Récupère ou crée le customer Stripe
  let customerId: string | undefined;

  const { data: gymData } = await supabase
    .from("gyms")
    .select("stripe_customer_id")
    .eq("id", gym.id)
    .single();

  if (gymData?.stripe_customer_id) {
    customerId = gymData.stripe_customer_id;
  } else {
    const customer = await stripe.customers.create({
      email: user.email,
      name: gym.name,
      metadata: { gym_id: gym.id },
    });
    customerId = customer.id;

    await supabase
      .from("gyms")
      .update({ stripe_customer_id: customerId })
      .eq("id", gym.id);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
    // L'essai est déjà accordé à la création de la salle. Ne pas en recréer
    // un second dans Stripe au moment où le client choisit de payer.
    subscription_data: { metadata: { gym_id: gym.id } },
    success_url: `${SITE_URL}/billing?success=1`,
    cancel_url: `${SITE_URL}/billing?canceled=1`,
    metadata: { gym_id: gym.id },
  });

  return NextResponse.json({ url: session.url });
}
