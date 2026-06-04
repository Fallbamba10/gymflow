"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentGym, type PaymentMethod } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
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

export async function createManualPayment(formData: FormData) {
  const gym = await getCurrentGym();
  if (!gym) {
    redirect("/onboarding");
  }

  const amount = Number(getString(formData, "amount"));
  const method = getPaymentMethod(getString(formData, "method"));
  const memberId = getString(formData, "member_id");
  const notes = getString(formData, "notes");

  if (!Number.isFinite(amount) || amount <= 0) {
    redirect("/payments/new?error=Montant invalide");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("payments").insert({
    gym_id: gym.id,
    member_id: memberId || null,
    kind: "manual_adjustment",
    method,
    amount,
    operator_id: user?.id,
    notes,
  });

  if (error) {
    redirect(`/payments/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/payments");
  revalidatePath("/");
  redirect("/payments?success=Encaissement ajoute");
}
