"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentGym, type PaymentMethod } from "@/lib/supabase/queries";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function translateCheckinError(message: string) {
  if (message.includes("no_active_subscription")) {
    return "Aucun abonnement actif";
  }
  if (message.includes("invalid_staff_pin")) {
    return "PIN employe invalide";
  }
  if (message.includes("not_allowed")) {
    return "Action non autorisee";
  }
  return message;
}

function getPaymentMethod(value: string): PaymentMethod {
  if (
    value === "cash" ||
    value === "wave" ||
    value === "orange_money" ||
    value === "card" ||
    value === "other"
  ) {
    return value;
  }

  return "cash";
}

export async function performMemberCheckin(formData: FormData) {
  const memberId = getString(formData, "member_id");
  const currentQuery = getString(formData, "current_q");
  const staffId = getString(formData, "staff_id");
  const staffPin = getString(formData, "staff_pin");
  const querySuffix = currentQuery ? `&q=${encodeURIComponent(currentQuery)}` : "";

  if (!memberId) {
    redirect("/checkin?error=Membre invalide");
  }

  const gym = await getCurrentGym();
  if (!gym) {
    redirect("/onboarding");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = staffId
    ? await supabase.rpc("perform_checkin_with_staff_pin", {
        target_gym_id: gym.id,
        target_member_id: memberId,
        target_staff_id: staffId,
        target_pin: staffPin,
        target_operator_id: user?.id,
      })
    : await supabase.rpc("perform_checkin", {
        target_gym_id: gym.id,
        target_member_id: memberId,
        target_operator_id: user?.id,
      });

  if (error) {
    redirect(`/checkin?error=${encodeURIComponent(translateCheckinError(error.message))}${querySuffix}`);
  }

  revalidatePath("/checkin");
  revalidatePath("/members");
  redirect(`/checkin?success=Entree validee${querySuffix}`);
}

export async function performWalkInCheckin(formData: FormData) {
  const amount = Number(getString(formData, "amount"));
  const method = getPaymentMethod(getString(formData, "method"));
  const customerName = getString(formData, "customer_name");
  const staffId = getString(formData, "staff_id");
  const staffPin = getString(formData, "staff_pin");

  if (!Number.isFinite(amount) || amount <= 0) {
    redirect("/checkin?error=Montant seance invalide");
  }

  const gym = await getCurrentGym();
  if (!gym) {
    redirect("/onboarding");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.rpc("perform_walkin_checkin", {
    target_gym_id: gym.id,
    target_amount: amount,
    target_method: method,
    target_customer_name: customerName || null,
    target_staff_id: staffId || null,
    target_pin: staffPin || null,
    target_operator_id: user?.id,
  });

  if (error) {
    redirect(`/checkin?error=${encodeURIComponent(translateCheckinError(error.message))}`);
  }

  revalidatePath("/checkin");
  revalidatePath("/payments");
  revalidatePath("/");
  redirect("/checkin?success=Seance simple encaissee et entree validee");
}
