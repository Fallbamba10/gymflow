"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminGym } from "@/lib/supabase/guards";
import { createClient } from "@/lib/supabase/server";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getCurrency(value: string) {
  if (value === "EUR" || value === "USD") {
    return value;
  }

  return "XOF";
}

export async function updateGymSettings(formData: FormData) {
  const gym = await requireAdminGym();

  const name = getString(formData, "name");
  const phone = getString(formData, "phone");
  const address = getString(formData, "address");
  const currency = getCurrency(getString(formData, "currency"));

  if (!name) {
    redirect("/settings?error=Nom de salle obligatoire");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("gyms")
    .update({
      name,
      phone,
      address,
      currency,
    })
    .eq("id", gym.id);

  if (error) {
    redirect(`/settings?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  revalidatePath("/settings");
  redirect("/settings?success=Parametres enregistres");
}
