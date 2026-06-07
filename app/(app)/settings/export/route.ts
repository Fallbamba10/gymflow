import { getCurrentGym, getGymSettings } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";

function jsonDownload(filename: string, data: unknown) {
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

export async function GET() {
  const gym = await getCurrentGym();
  if (!gym || gym.role !== "admin") {
    return jsonDownload("gymflow-export-erreur.json", {
      erreur: "Export reserve aux admins",
    });
  }

  const supabase = await createClient();
  const [settings, members, subscriptions, payments, checkins, subscriptionTypes, staff] = await Promise.all([
    getGymSettings(gym.id),
    supabase
      .from("members")
      .select("id, member_number, full_name, phone, notes, created_at, archived_at")
      .eq("gym_id", gym.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("subscriptions")
      .select("id, member_id, subscription_type_id, starts_at, expires_at, sessions_left, price_paid, status, created_at")
      .eq("gym_id", gym.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("payments")
      .select("id, member_id, subscription_id, staff_id, amount, method, kind, paid_at, notes")
      .eq("gym_id", gym.id)
      .order("paid_at", { ascending: false }),
    supabase
      .from("checkins")
      .select("id, member_id, subscription_id, staff_id, checked_in_at")
      .eq("gym_id", gym.id)
      .order("checked_in_at", { ascending: false }),
    supabase
      .from("subscription_types")
      .select("id, name, duration_days, sessions, price, active, created_at")
      .eq("gym_id", gym.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("gym_staff")
      .select("id, full_name, role, active, created_at")
      .eq("gym_id", gym.id)
      .order("created_at", { ascending: false }),
  ]);

  const errors = [members, subscriptions, payments, checkins, subscriptionTypes, staff]
    .map((result) => result.error?.message)
    .filter(Boolean);

  if (errors.length > 0) {
    return jsonDownload("gymflow-export-erreur.json", {
      gym: settings,
      erreurs: errors,
    });
  }

  const date = new Date().toISOString().slice(0, 10);
  return jsonDownload(`gymflow-sauvegarde-${date}.json`, {
    exported_at: new Date().toISOString(),
    gym: settings,
    members: members.data ?? [],
    subscriptions: subscriptions.data ?? [],
    payments: payments.data ?? [],
    checkins: checkins.data ?? [],
    subscription_types: subscriptionTypes.data ?? [],
    staff: staff.data ?? [],
  });
}
