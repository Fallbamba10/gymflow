"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdminGym } from "@/lib/supabase/guards";

type ImportRow = {
  nom: string;
  telephone: string;
  notes: string;
};

type ImportResult = {
  inserted: number;
  skipped: number;
  errors: string[];
};

export async function importMembers(rows: ImportRow[]): Promise<ImportResult> {
  const gym = await requireAdminGym();
  const supabase = await createClient();

  // Charge tous les téléphones existants pour détecter les doublons
  const { data: existing } = await supabase
    .from("members")
    .select("phone, full_name")
    .eq("gym_id", gym.id);

  const existingPhones = new Set(
    (existing ?? []).map((m) => m.phone?.replace(/[\s\-\(\)\.]/g, "").toLowerCase()).filter(Boolean),
  );
  const existingNames = new Set(
    (existing ?? []).map((m) => m.full_name.trim().toLowerCase()),
  );

  let inserted = 0;
  let skipped = 0;
  const errors: string[] = [];

  // Insertion par batch de 50
  const BATCH = 50;
  const toInsert: { gym_id: string; full_name: string; phone: string | null; notes: string | null }[] = [];
  const skippedNames: string[] = [];

  for (const row of rows) {
    const name = row.nom.trim();
    const phone = row.telephone.trim() || null;
    const normalizedPhone = phone?.replace(/[\s\-\(\)\.]/g, "").toLowerCase();

    // Doublon sur téléphone (si renseigné) ou nom exact
    if (normalizedPhone && existingPhones.has(normalizedPhone)) {
      skipped++;
      skippedNames.push(name);
      continue;
    }
    if (existingNames.has(name.toLowerCase())) {
      skipped++;
      skippedNames.push(name);
      continue;
    }

    toInsert.push({
      gym_id: gym.id,
      full_name: name,
      phone: phone || null,
      notes: row.notes.trim() || null,
    });

    // Marque comme vu pour éviter doublons dans le même import
    if (normalizedPhone) existingPhones.add(normalizedPhone);
    existingNames.add(name.toLowerCase());
  }

  // Insert par batch
  for (let i = 0; i < toInsert.length; i += BATCH) {
    const batch = toInsert.slice(i, i + BATCH);
    const { error } = await supabase.from("members").insert(batch);
    if (error) {
      errors.push(`Ligne ${i + 1}–${i + batch.length} : ${error.message}`);
    } else {
      inserted += batch.length;
    }
  }

  revalidatePath("/members");
  revalidatePath("/");

  return { inserted, skipped, errors };
}
