import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { notifyExpiryReminder } from "@/lib/whatsapp";
import { sendTrialEndingEmail } from "@/lib/email";

// Appelé chaque matin par Vercel Cron (voir vercel.json)
// Envoie un rappel WhatsApp aux membres dont l'abonnement expire dans 3 jours ou 1 jour.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();

  const today = new Date();
  const targets = [1, 3]; // jours avant expiration

  let sent = 0;
  let errors = 0;

  for (const daysLeft of targets) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysLeft);
    const targetDateStr = targetDate.toISOString().slice(0, 10);

    const { data: subscriptions, error } = await supabase
      .from("subscriptions")
      .select(`
        id,
        gym_id,
        expires_at,
        members(full_name, phone),
        gyms(name, whatsapp_phone, phone)
      `)
      .eq("status", "active")
      .eq("expires_at", targetDateStr);

    if (error) {
      console.error(`[cron/expiry-reminders] erreur requête J-${daysLeft}:`, error.message);
      errors++;
      continue;
    }

    for (const sub of subscriptions ?? []) {
      const member = Array.isArray(sub.members) ? sub.members[0] : sub.members;
      const gym = Array.isArray(sub.gyms) ? sub.gyms[0] : sub.gyms;

      if (!member?.phone || !gym) continue;

      try {
        await notifyExpiryReminder({
          phone: member.phone,
          memberName: member.full_name ?? "",
          gymName: gym.name ?? "",
          daysLeft,
          gymContact: gym.whatsapp_phone || gym.phone || "",
        });
        sent++;
      } catch {
        errors++;
      }
    }
  }

  // Rappels email fin de trial (J-1 et J-3)
  const serviceSupabase = createServiceClient();
  let trialEmailsSent = 0;

  for (const daysLeft of targets) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysLeft);
    const dateStr = targetDate.toISOString().slice(0, 10);

    const { data: gyms } = await serviceSupabase
      .from("gyms")
      .select("name, owner_id")
      .eq("billing_status", "trialing")
      .gte("trial_ends_at", `${dateStr}T00:00:00Z`)
      .lte("trial_ends_at", `${dateStr}T23:59:59Z`);

    for (const gym of gyms ?? []) {
      const { data: ownerData } = await serviceSupabase.auth.admin.getUserById(gym.owner_id);
      const email = ownerData?.user?.email;
      if (!email) continue;
      try {
        await sendTrialEndingEmail({ to: email, gymName: gym.name, daysLeft });
        trialEmailsSent++;
      } catch {
        errors++;
      }
    }
  }

  return NextResponse.json({ sent, errors, trialEmailsSent });
}
