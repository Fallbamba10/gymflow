"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdminGym } from "@/lib/supabase/guards";
import {
  notifyWelcome,
  notifySubscriptionConfirmed,
  notifyExpiryReminder,
  notifySessionsLow,
} from "@/lib/whatsapp";

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

function translateMemberActionError(message: string) {
  if (message.includes("not_allowed")) {
    return "Action non autorisee";
  }
  return message;
}

export async function createMember(formData: FormData) {
  const gym = await requireAdminGym();

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
    .select("id, name, duration_days, sessions, price")
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
    redirect(`/members/new?error=${encodeURIComponent(translateMemberActionError(paymentError.message))}`);
  }

  if (phone) {
    const { data: gymData } = await supabase
      .from("gyms")
      .select("name, whatsapp_phone, phone")
      .eq("id", gym.id)
      .single();

    if (gymData) {
      const gymContact = gymData.whatsapp_phone || gymData.phone || "";
      await notifyWelcome({ phone, memberName: fullName, gymName: gymData.name });
      await notifySubscriptionConfirmed({
        phone,
        memberName: fullName,
        gymName: gymData.name,
        planName: type.name ?? "",
        expiresAt: toDateString(expiresAt),
        gymContact,
      });
    }
  }

  revalidatePath("/members");
  revalidatePath("/");
  redirect("/members");
}

export async function renewMemberSubscription(formData: FormData) {
  const gym = await requireAdminGym();

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
    .select("id, name, duration_days, sessions, price")
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
    redirect(`/members/${memberId}?error=${encodeURIComponent(translateMemberActionError(paymentError.message))}`);
  }

  const { data: memberData } = await supabase
    .from("members")
    .select("full_name, phone")
    .eq("id", memberId)
    .single();

  if (memberData?.phone) {
    const { data: gymData } = await supabase
      .from("gyms")
      .select("name, whatsapp_phone, phone")
      .eq("id", gym.id)
      .single();

    if (gymData) {
      await notifySubscriptionConfirmed({
        phone: memberData.phone,
        memberName: memberData.full_name,
        gymName: gymData.name,
        planName: type.name ?? "",
        expiresAt: toDateString(expiresAt),
        gymContact: gymData.whatsapp_phone || gymData.phone || "",
      });
    }
  }

  revalidatePath(`/members/${memberId}`);
  revalidatePath("/members");
  revalidatePath("/subscriptions");
  redirect(`/members/${memberId}?success=Abonnement renouvele`);
}

export async function updateMember(formData: FormData) {
  const gym = await requireAdminGym();

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
  const gym = await requireAdminGym();

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

export async function restoreMember(formData: FormData) {
  const gym = await requireAdminGym();

  const memberId = getString(formData, "member_id");
  if (!memberId) {
    redirect("/members?error=Membre invalide");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("members")
    .update({ archived_at: null })
    .eq("gym_id", gym.id)
    .eq("id", memberId);

  if (error) {
    redirect(`/members/${memberId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/members/${memberId}`);
  revalidatePath("/members");
  revalidatePath("/");
  redirect(`/members/${memberId}?success=Membre restaure`);
}

export async function sendWhatsAppReminder(formData: FormData) {
  const gym = await requireAdminGym();

  const memberId = getString(formData, "member_id");
  if (!memberId) {
    redirect(`/members?error=Membre invalide`);
  }

  const supabase = await createClient();

  const { data: member } = await supabase
    .from("members")
    .select("full_name, phone, id")
    .eq("gym_id", gym.id)
    .eq("id", memberId)
    .single();

  if (!member?.phone) {
    redirect(`/members/${memberId}?error=Aucun telephone renseigne pour ce membre`);
  }

  const { data: gymData } = await supabase
    .from("gyms")
    .select("name, whatsapp_phone, phone")
    .eq("id", gym.id)
    .single();

  if (!gymData) {
    redirect(`/members/${memberId}?error=Salle introuvable`);
  }

  const gymContact = gymData.whatsapp_phone || gymData.phone || "";

  // Check subscription state to pick the right template
  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("expires_at, sessions_left, status, subscription_types(name)")
    .eq("gym_id", gym.id)
    .eq("member_id", memberId)
    .order("created_at", { ascending: false })
    .limit(1);

  const sub = subscriptions?.[0] ?? null;
  const subType = sub
    ? (Array.isArray(sub.subscription_types) ? sub.subscription_types[0] : sub.subscription_types)
    : null;

  const daysLeft = sub?.expires_at
    ? Math.ceil((new Date(sub.expires_at).getTime() - Date.now()) / 86400000)
    : null;

  const sessionsLeft = sub?.sessions_left ?? null;

  if (sessionsLeft !== null && sessionsLeft <= 3) {
    await notifySessionsLow({
      phone: member.phone,
      memberName: member.full_name,
      gymName: gymData.name,
      sessionsLeft,
      gymContact,
    });
  } else if (daysLeft !== null && daysLeft <= 7) {
    await notifyExpiryReminder({
      phone: member.phone,
      memberName: member.full_name,
      gymName: gymData.name,
      daysLeft: Math.max(daysLeft, 0),
      gymContact,
    });
  } else {
    // Generic renewal reminder — reuse expiry template with 0 days as "now"
    await notifyExpiryReminder({
      phone: member.phone,
      memberName: member.full_name,
      gymName: gymData.name,
      daysLeft: daysLeft ?? 0,
      gymContact,
    });
  }

  const planLabel = (subType as { name?: string } | null)?.name ?? "abonnement";
  redirect(`/members/${memberId}?success=Rappel WhatsApp envoye pour ${planLabel}`);
}
