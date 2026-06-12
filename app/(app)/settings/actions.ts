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

function getOptionalUrl(value: string) {
  if (!value) {
    return "";
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

export async function updateGymSettings(formData: FormData) {
  const gym = await requireAdminGym();

  const name = getString(formData, "name");
  const phone = getString(formData, "phone");
  const address = getString(formData, "address");
  const public_description = getString(formData, "public_description");
  const public_hours = getString(formData, "public_hours");
  const whatsapp_phone = getString(formData, "whatsapp_phone");
  const instagram_url = getOptionalUrl(getString(formData, "instagram_url"));
  const tiktok_url = getOptionalUrl(getString(formData, "tiktok_url"));
  const cover_image_url = getOptionalUrl(getString(formData, "cover_image_url"));
  const currency = getCurrency(getString(formData, "currency"));

  if (!name) {
    redirect("/settings?error=Nom+de+salle+obligatoire");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("gyms")
    .update({
      name,
      phone,
      address,
      public_description,
      public_hours,
      whatsapp_phone,
      instagram_url,
      tiktok_url,
      cover_image_url,
      currency,
    })
    .eq("id", gym.id);

  if (error) {
    redirect(`/settings?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  revalidatePath("/settings");
  revalidatePath(`/g/${gym.id}`);
  redirect("/settings?success=Param%C3%A8tres+enregistr%C3%A9s");
}
