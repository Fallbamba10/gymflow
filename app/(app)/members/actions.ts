"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentGym } from "@/lib/supabase/queries";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function toDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function createMember(formData: FormData) {
  const gym = await getCurrentGym();
  if (!gym) {
    redirect("/onboarding");
  }

  const fullName = getString(formData, "full_name");
  const phone = getString(formData, "phone");
  const notes = getString(formData, "notes");
  const subscriptionTypeId = getString(formData, "subscription_type_id");
  const method = getString(formData, "payment_method") || "cash";
  const startsAtValue = getString(formData, "starts_at");
  const startsAt = startsAtValue ? new Date(startsAtValue) : new Date();

  if (!fullName || !subscriptionTypeId) {
    redirect("/members/new?error=Formulaire invalide");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: type, error: typeError } = await supabase
    .from("subscription_types")
    .select("id, duration_days, sessions, price")
    .eq("gym_id", gym.id)
    .eq("id", subscriptionTypeId)
    .single();

  if (typeError || !type) {
    redirect("/members/new?error=Formule introuvable");
  }

  const { data: member, error: memberError } = await supabase
    .from("members")
    .insert({
      gym_id: gym.id,
      full_name: fullName,
      phone,
      notes,
    })
    .select("id")
    .single();

  if (memberError || !member) {
    redirect(`/members/new?error=${encodeURIComponent(memberError?.message ?? "Creation membre impossible")}`);
  }

  const expiresAt = addDays(startsAt, type.duration_days);
  const { data: subscription, error: subscriptionError } = await supabase
    .from("subscriptions")
    .insert({
      gym_id: gym.id,
      member_id: member.id,
      subscription_type_id: type.id,
      starts_at: toDateString(startsAt),
      expires_at: toDateString(expiresAt),
      sessions_left: type.sessions,
      price_paid: type.price,
      created_by: user?.id,
    })
    .select("id")
    .single();

  if (subscriptionError || !subscription) {
    redirect(`/members/new?error=${encodeURIComponent(subscriptionError?.message ?? "Creation abonnement impossible")}`);
  }

  const { error: paymentError } = await supabase.from("payments").insert({
    gym_id: gym.id,
    member_id: member.id,
    subscription_id: subscription.id,
    kind: "subscription",
    method,
    amount: type.price,
    operator_id: user?.id,
  });

  if (paymentError) {
    redirect(`/members/new?error=${encodeURIComponent(paymentError.message)}`);
  }

  revalidatePath("/members");
  revalidatePath("/");
  redirect("/members");
}

export async function renewMemberSubscription(formData: FormData) {
  const gym = await getCurrentGym();
  if (!gym) {
    redirect("/onboarding");
  }

  const memberId = getString(formData, "member_id");
  const subscriptionTypeId = getString(formData, "subscription_type_id");
  const method = getString(formData, "payment_method") || "cash";
  const startsAt = new Date();

  if (!memberId || !subscriptionTypeId) {
    redirect(`/members/${memberId}?error=Formulaire invalide`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: type, error: typeError } = await supabase
    .from("subscription_types")
    .select("id, duration_days, sessions, price")
    .eq("gym_id", gym.id)
    .eq("id", subscriptionTypeId)
    .single();

  if (typeError || !type) {
    redirect(`/members/${memberId}?error=Formule introuvable`);
  }

  await supabase
    .from("subscriptions")
    .update({ status: "expired" })
    .eq("gym_id", gym.id)
    .eq("member_id", memberId)
    .eq("status", "active");

  const expiresAt = addDays(startsAt, type.duration_days);
  const { data: subscription, error: subscriptionError } = await supabase
    .from("subscriptions")
    .insert({
      gym_id: gym.id,
      member_id: memberId,
      subscription_type_id: type.id,
      starts_at: toDateString(startsAt),
      expires_at: toDateString(expiresAt),
      sessions_left: type.sessions,
      price_paid: type.price,
      created_by: user?.id,
    })
    .select("id")
    .single();

  if (subscriptionError || !subscription) {
    redirect(`/members/${memberId}?error=${encodeURIComponent(subscriptionError?.message ?? "Renouvellement impossible")}`);
  }

  const { error: paymentError } = await supabase.from("payments").insert({
    gym_id: gym.id,
    member_id: memberId,
    subscription_id: subscription.id,
    kind: "subscription",
    method,
    amount: type.price,
    operator_id: user?.id,
  });

  if (paymentError) {
    redirect(`/members/${memberId}?error=${encodeURIComponent(paymentError.message)}`);
  }

  revalidatePath(`/members/${memberId}`);
  revalidatePath("/members");
  revalidatePath("/subscriptions");
  redirect(`/members/${memberId}?success=Abonnement renouvele`);
}

export async function updateMember(formData: FormData) {
  const gym = await getCurrentGym();
  if (!gym) {
    redirect("/onboarding");
  }

  const memberId = getString(formData, "member_id");
  const fullName = getString(formData, "full_name");
  const phone = getString(formData, "phone");
  const notes = getString(formData, "notes");

  if (!memberId || !fullName) {
    redirect(`/members/${memberId}/edit?error=Formulaire invalide`);
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("members")
    .update({
      full_name: fullName,
      phone,
      notes,
    })
    .eq("gym_id", gym.id)
    .eq("id", memberId);

  if (error) {
    redirect(`/members/${memberId}/edit?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/members/${memberId}`);
  revalidatePath("/members");
  revalidatePath("/");
  redirect(`/members/${memberId}?success=Membre modifie`);
}

export async function archiveMember(formData: FormData) {
  const gym = await getCurrentGym();
  if (!gym) {
    redirect("/onboarding");
  }

  const memberId = getString(formData, "member_id");
  if (!memberId) {
    redirect("/members?error=Membre invalide");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("members")
    .update({ archived_at: new Date().toISOString() })
    .eq("gym_id", gym.id)
    .eq("id", memberId);

  if (error) {
    redirect(`/members/${memberId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/members");
  revalidatePath("/");
  redirect("/members?success=Membre archive");
}
