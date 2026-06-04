"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentGym } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getRole(value: string): "admin" | "operator" {
  return value === "admin" ? "admin" : "operator";
}

function translateTeamError(message: string) {
  if (message.includes("user_not_found")) {
    return "Utilisateur introuvable. Il doit d'abord creer un compte GymFlow.";
  }
  if (message.includes("not_allowed")) {
    return "Action reservee aux admins.";
  }
  if (message.includes("invalid_name")) {
    return "Nom employe invalide.";
  }
  if (message.includes("invalid_pin")) {
    return "Le PIN doit contenir 4 a 8 chiffres.";
  }
  return message;
}

export async function addGymUser(formData: FormData) {
  const gym = await getCurrentGym();
  if (!gym) {
    redirect("/onboarding");
  }

  const email = getString(formData, "email");
  const role = getRole(getString(formData, "role"));

  if (!email) {
    redirect("/team?error=Email obligatoire");
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("add_gym_user_by_email", {
    target_gym_id: gym.id,
    target_email: email,
    target_role: role,
  });

  if (error) {
    redirect(`/team?error=${encodeURIComponent(translateTeamError(error.message))}`);
  }

  revalidatePath("/team");
  redirect("/team?success=Employe ajoute");
}

export async function updateGymUserRole(formData: FormData) {
  const gym = await getCurrentGym();
  if (!gym) {
    redirect("/onboarding");
  }

  const gymUserId = getString(formData, "gym_user_id");
  const role = getRole(getString(formData, "role"));

  if (!gymUserId) {
    redirect("/team?error=Employe introuvable");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("gym_users")
    .update({ role })
    .eq("gym_id", gym.id)
    .eq("id", gymUserId);

  if (error) {
    redirect(`/team?error=${encodeURIComponent(translateTeamError(error.message))}`);
  }

  revalidatePath("/team");
  redirect("/team?success=Role modifie");
}

export async function deactivateGymUser(formData: FormData) {
  const gym = await getCurrentGym();
  if (!gym) {
    redirect("/onboarding");
  }

  const gymUserId = getString(formData, "gym_user_id");
  if (!gymUserId) {
    redirect("/team?error=Employe introuvable");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("gym_users")
    .update({ active: false })
    .eq("gym_id", gym.id)
    .eq("id", gymUserId);

  if (error) {
    redirect(`/team?error=${encodeURIComponent(translateTeamError(error.message))}`);
  }

  revalidatePath("/team");
  redirect("/team?success=Employe desactive");
}

export async function addGymStaff(formData: FormData) {
  const gym = await getCurrentGym();
  if (!gym) {
    redirect("/onboarding");
  }

  const fullName = getString(formData, "full_name");
  const pin = getString(formData, "pin");
  const role = getRole(getString(formData, "role"));

  const supabase = await createClient();
  const { error } = await supabase.rpc("create_gym_staff_with_pin", {
    target_gym_id: gym.id,
    target_full_name: fullName,
    target_role: role,
    target_pin: pin,
  });

  if (error) {
    redirect(`/team?error=${encodeURIComponent(translateTeamError(error.message))}`);
  }

  revalidatePath("/team");
  redirect("/team?success=Employe PIN ajoute");
}

export async function updateGymStaffRole(formData: FormData) {
  const gym = await getCurrentGym();
  if (!gym) {
    redirect("/onboarding");
  }

  const staffId = getString(formData, "staff_id");
  const role = getRole(getString(formData, "role"));

  if (!staffId) {
    redirect("/team?error=Employe introuvable");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("gym_staff")
    .update({ role })
    .eq("gym_id", gym.id)
    .eq("id", staffId);

  if (error) {
    redirect(`/team?error=${encodeURIComponent(translateTeamError(error.message))}`);
  }

  revalidatePath("/team");
  redirect("/team?success=Role modifie");
}

export async function deactivateGymStaff(formData: FormData) {
  const gym = await getCurrentGym();
  if (!gym) {
    redirect("/onboarding");
  }

  const staffId = getString(formData, "staff_id");
  if (!staffId) {
    redirect("/team?error=Employe introuvable");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("gym_staff")
    .update({ active: false })
    .eq("gym_id", gym.id)
    .eq("id", staffId);

  if (error) {
    redirect(`/team?error=${encodeURIComponent(translateTeamError(error.message))}`);
  }

  revalidatePath("/team");
  redirect("/team?success=Employe desactive");
}
