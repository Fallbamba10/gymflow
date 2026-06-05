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

function translatePaymentError(message: string) {
  if (message.includes("invalid_staff_pin")) {
    return "PIN employe invalide";
  }
  if (message.includes("not_allowed")) {
    return "Action non autorisee";
  }
  return message;
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
  const staffId = getString(formData, "staff_id");
  const staffPin = getString(formData, "staff_pin");

  if (!Number.isFinite(amount) || amount <= 0) {
    redirect("/payments/new?error=Montant invalide");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let verifiedStaffId: string | null = null;

  if (staffId) {
    const { data: staff, error: staffError } = await supabase.rpc("verify_gym_staff_pin", {
      target_gym_id: gym.id,
      target_staff_id: staffId,
      target_pin: staffPin,
    });

    if (staffError || !staff) {
      redirect(`/payments/new?error=${encodeURIComponent(translatePaymentError(staffError?.message ?? "PIN employe invalide"))}`);
    }

    verifiedStaffId = Array.isArray(staff) ? staff[0]?.id ?? null : staff.id;
  }

  const { error } = await supabase.from("payments").insert({
    gym_id: gym.id,
    member_id: memberId || null,
    kind: "manual_adjustment",
    method,
    amount,
    operator_id: user?.id,
    staff_id: verifiedStaffId,
    notes,
  });

  if (error) {
    redirect(`/payments/new?error=${encodeURIComponent(translatePaymentError(error.message))}`);
  }

  revalidatePath("/payments");
  revalidatePath("/");
  redirect("/payments?success=Encaissement ajoute");
}
