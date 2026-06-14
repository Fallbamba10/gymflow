"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminGym } from "@/lib/supabase/guards";
import { createClient } from "@/lib/supabase/server";

// ─── Cours ──────────────────────────────────────────────────────────────────

export async function createClass(formData: FormData) {
  const gym = await requireAdminGym();
  const supabase = await createClient();

  const name = formData.get("name")?.toString().trim() ?? "";
  const description = formData.get("description")?.toString().trim() || null;
  const instructor = formData.get("instructor")?.toString().trim() || null;
  const color = formData.get("color")?.toString() || "#1E8A6A";
  const capacity = parseInt(formData.get("capacity")?.toString() ?? "20", 10);
  const duration_minutes = parseInt(formData.get("duration_minutes")?.toString() ?? "60", 10);

  if (!name || capacity <= 0 || duration_minutes <= 0) {
    redirect("/classes/new?error=invalid");
  }

  const { data, error } = await supabase
    .from("classes")
    .insert({ gym_id: gym.id, name, description, instructor, color, capacity, duration_minutes })
    .select("id")
    .single();

  if (error || !data) redirect("/classes?error=create");

  revalidatePath("/classes");
  redirect(`/classes/${data.id}?created=1`);
}

export async function updateClass(formData: FormData) {
  const gym = await requireAdminGym();
  const supabase = await createClient();

  const id = formData.get("class_id")?.toString() ?? "";
  const name = formData.get("name")?.toString().trim() ?? "";
  const description = formData.get("description")?.toString().trim() || null;
  const instructor = formData.get("instructor")?.toString().trim() || null;
  const color = formData.get("color")?.toString() || "#1E8A6A";
  const capacity = parseInt(formData.get("capacity")?.toString() ?? "20", 10);
  const duration_minutes = parseInt(formData.get("duration_minutes")?.toString() ?? "60", 10);
  const active = formData.get("active") === "true";

  await supabase
    .from("classes")
    .update({ name, description, instructor, color, capacity, duration_minutes, active })
    .eq("id", id)
    .eq("gym_id", gym.id);

  revalidatePath("/classes");
  revalidatePath(`/classes/${id}`);
  redirect(`/classes/${id}?updated=1`);
}

export async function deleteClass(formData: FormData) {
  const gym = await requireAdminGym();
  const supabase = await createClient();
  const id = formData.get("class_id")?.toString() ?? "";

  await supabase.from("classes").delete().eq("id", id).eq("gym_id", gym.id);

  revalidatePath("/classes");
  redirect("/classes?deleted=1");
}

// ─── Séances ─────────────────────────────────────────────────────────────────

export async function createClassSession(formData: FormData) {
  const gym = await requireAdminGym();
  const supabase = await createClient();

  const class_id = formData.get("class_id")?.toString() ?? "";
  const date = formData.get("date")?.toString() ?? "";
  const time = formData.get("time")?.toString() ?? "";
  const duration = parseInt(formData.get("duration_minutes")?.toString() ?? "60", 10);
  const instructor = formData.get("instructor")?.toString().trim() || null;
  const capacity = formData.get("capacity") ? parseInt(formData.get("capacity")!.toString(), 10) : null;
  const notes = formData.get("notes")?.toString().trim() || null;

  if (!date || !time || !class_id) redirect(`/classes/${class_id}?error=invalid`);

  const starts_at = new Date(`${date}T${time}:00`).toISOString();
  const ends_at = new Date(new Date(starts_at).getTime() + duration * 60000).toISOString();

  const { data, error } = await supabase
    .from("class_sessions")
    .insert({ gym_id: gym.id, class_id, starts_at, ends_at, instructor, capacity, notes })
    .select("id")
    .single();

  if (error || !data) redirect(`/classes/${class_id}?error=session`);

  revalidatePath("/classes");
  revalidatePath(`/classes/${class_id}`);
  redirect(`/classes/sessions/${data.id}?created=1`);
}

export async function cancelClassSession(formData: FormData) {
  const gym = await requireAdminGym();
  const supabase = await createClient();

  const session_id = formData.get("session_id")?.toString() ?? "";
  const class_id = formData.get("class_id")?.toString() ?? "";

  await supabase
    .from("class_sessions")
    .update({ status: "cancelled" })
    .eq("id", session_id)
    .eq("gym_id", gym.id);

  revalidatePath(`/classes/${class_id}`);
  revalidatePath(`/classes/sessions/${session_id}`);
  redirect(`/classes/${class_id}?cancelled=1`);
}

// ─── Inscriptions ─────────────────────────────────────────────────────────────

export async function bookMember(formData: FormData) {
  const gym = await requireAdminGym();
  const supabase = await createClient();

  const session_id = formData.get("session_id")?.toString() ?? "";
  const member_id = formData.get("member_id")?.toString() ?? "";

  await supabase
    .from("class_bookings")
    .upsert({ gym_id: gym.id, session_id, member_id }, { onConflict: "session_id,member_id", ignoreDuplicates: true });

  revalidatePath(`/classes/sessions/${session_id}`);
  redirect(`/classes/sessions/${session_id}?booked=1`);
}

export async function removeBooking(formData: FormData) {
  const gym = await requireAdminGym();
  const supabase = await createClient();

  const booking_id = formData.get("booking_id")?.toString() ?? "";
  const session_id = formData.get("session_id")?.toString() ?? "";

  await supabase.from("class_bookings").delete().eq("id", booking_id).eq("gym_id", gym.id);

  revalidatePath(`/classes/sessions/${session_id}`);
  redirect(`/classes/sessions/${session_id}?removed=1`);
}

export async function checkinBooking(formData: FormData) {
  const gym = await requireAdminGym();
  const supabase = await createClient();

  const booking_id = formData.get("booking_id")?.toString() ?? "";
  const session_id = formData.get("session_id")?.toString() ?? "";

  await supabase
    .from("class_bookings")
    .update({ checked_in: true, checked_in_at: new Date().toISOString() })
    .eq("id", booking_id)
    .eq("gym_id", gym.id);

  revalidatePath(`/classes/sessions/${session_id}`);
  redirect(`/classes/sessions/${session_id}?checkin=1`);
}
