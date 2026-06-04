"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentGym } from "@/lib/supabase/queries";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getNumber(formData: FormData, key: string) {
  const value = Number(getString(formData, key));
  return Number.isFinite(value) ? value : 0;
}

export async function createSubscriptionType(formData: FormData) {
  const gym = await getCurrentGym();
  if (!gym) {
    redirect("/onboarding");
  }

  const name = getString(formData, "name");
  const price = getNumber(formData, "price");
  const durationDays = getNumber(formData, "duration_days");
  const sessionsRaw = getString(formData, "sessions");
  const sessions = sessionsRaw ? Number(sessionsRaw) : null;

  if (!name || price < 0 || durationDays <= 0) {
    redirect("/subscriptions/new?error=Formulaire invalide");
  }

  if (sessionsRaw && (!Number.isFinite(sessions) || Number(sessions) <= 0)) {
    redirect("/subscriptions/new?error=Nombre de seances invalide");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("subscription_types").insert({
    gym_id: gym.id,
    name,
    price,
    duration_days: durationDays,
    sessions: sessions && Number.isFinite(sessions) ? sessions : null,
  });

  if (error) {
    redirect(`/subscriptions/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/subscriptions");
  redirect("/subscriptions");
}

export async function updateSubscriptionType(formData: FormData) {
  const gym = await getCurrentGym();
  if (!gym) {
    redirect("/onboarding");
  }

  const subscriptionTypeId = getString(formData, "subscription_type_id");
  const name = getString(formData, "name");
  const price = getNumber(formData, "price");
  const durationDays = getNumber(formData, "duration_days");
  const sessionsRaw = getString(formData, "sessions");
  const sessions = sessionsRaw ? Number(sessionsRaw) : null;

  if (!subscriptionTypeId || !name || price < 0 || durationDays <= 0) {
    redirect(`/subscriptions/${subscriptionTypeId}/edit?error=Formulaire invalide`);
  }

  if (sessionsRaw && (!Number.isFinite(sessions) || Number(sessions) <= 0)) {
    redirect(`/subscriptions/${subscriptionTypeId}/edit?error=Nombre de seances invalide`);
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("subscription_types")
    .update({
      name,
      price,
      duration_days: durationDays,
      sessions,
    })
    .eq("gym_id", gym.id)
    .eq("id", subscriptionTypeId);

  if (error) {
    redirect(`/subscriptions/${subscriptionTypeId}/edit?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/subscriptions");
  revalidatePath(`/subscriptions/${subscriptionTypeId}/edit`);
  redirect("/subscriptions?success=Formule modifiee");
}

export async function deactivateSubscriptionType(formData: FormData) {
  const gym = await getCurrentGym();
  if (!gym) {
    redirect("/onboarding");
  }

  const subscriptionTypeId = getString(formData, "subscription_type_id");
  if (!subscriptionTypeId) {
    redirect("/subscriptions?error=Formule introuvable");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("subscription_types")
    .update({ active: false })
    .eq("gym_id", gym.id)
    .eq("id", subscriptionTypeId);

  if (error) {
    redirect(`/subscriptions/${subscriptionTypeId}/edit?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/subscriptions");
  redirect("/subscriptions?success=Formule desactivee");
}
