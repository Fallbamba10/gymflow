"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentGym, type PaymentMethod } from "@/lib/supabase/queries";
import { notifySessionsLow } from "@/lib/whatsapp";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function translateCheckinError(message: string) {
  if (message.includes("no_active_subscription")) {
    return "Aucun abonnement actif";
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

  const { error } = await supabase.rpc("perform_checkin", {
    target_gym_id: gym.id,
    target_member_id: memberId,
    target_operator_id: user?.id,
  });

  if (error) {
    redirect(`/checkin?error=${encodeURIComponent(translateCheckinError(error.message))}${querySuffix}`);
  }

  // Alerte WhatsApp si séances restantes <= 2 après pointage
  try {
    const supabase2 = await createClient();
    const { data: subData } = await supabase2
      .from("subscriptions")
      .select("sessions_left, members(full_name, phone), subscription_types(name)")
      .eq("gym_id", gym.id)
      .eq("member_id", memberId)
      .eq("status", "active")
      .single();

    const sessionsLeft = subData?.sessions_left ?? null;
    const memberInfo = Array.isArray(subData?.members) ? subData.members[0] : subData?.members;
    const phone = memberInfo?.phone ?? null;

    if (phone && sessionsLeft !== null && sessionsLeft <= 2 && sessionsLeft > 0) {
      const { data: gymData } = await supabase2
        .from("gyms")
        .select("name, whatsapp_phone, phone")
        .eq("id", gym.id)
        .single();

      if (gymData) {
        await notifySessionsLow({
          phone,
          memberName: memberInfo?.full_name ?? "",
          gymName: gymData.name,
          sessionsLeft,
          gymContact: gymData.whatsapp_phone || gymData.phone || "",
        });
      }
    }
  } catch {
    // Ne jamais bloquer le pointage pour une erreur de notification
  }

  revalidatePath("/checkin");
  revalidatePath("/members");
  redirect(`/checkin?success=Entree validee${querySuffix}`);
}

export async function performWalkInCheckin(formData: FormData) {
  const amount = Number(getString(formData, "amount"));
  const method = getPaymentMethod(getString(formData, "method"));
  const customerName = getString(formData, "customer_name");

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
    target_staff_id: null,
    target_pin: null,
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
