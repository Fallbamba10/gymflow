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

