import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, STRIPE_WEBHOOK_SECRET } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig || !STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook non configuré" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Helper : met à jour gyms à partir d'un objet subscription Stripe
  async function syncSubscription(subscription: Stripe.Subscription) {
    const gymId = subscription.metadata?.gym_id;
    if (!gymId) return;

    const rawEnd = (subscription as unknown as { current_period_end?: number }).current_period_end;
    const periodEnd = rawEnd ? new Date(rawEnd * 1000).toISOString() : null;

    await supabase
      .from("gyms")
      .update({
        stripe_subscription_id: subscription.id,
        billing_status: subscription.status,
        billing_period_end: periodEnd,
      })
      .eq("id", gymId);
  }

  // Helper : met à jour depuis un checkout session
  async function syncFromSession(session: Stripe.Checkout.Session) {
    const gymId = session.metadata?.gym_id;
    if (!gymId || !session.subscription) return;

    const sub = await stripe.subscriptions.retrieve(session.subscription as string);
    await syncSubscription(sub);
  }

  switch (event.type) {
    case "checkout.session.completed":
      await syncFromSession(event.data.object as Stripe.Checkout.Session);
      break;

    case "customer.subscription.updated":
    case "customer.subscription.created":
      await syncSubscription(event.data.object as Stripe.Subscription);
      break;

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const gymId = sub.metadata?.gym_id;
      if (gymId) {
        await supabase
          .from("gyms")
          .update({ billing_status: "canceled", billing_period_end: null })
          .eq("id", gymId);
      }
      break;
    }

    // invoice.payment_failed : passe en past_due (géré par subscription.updated)
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
