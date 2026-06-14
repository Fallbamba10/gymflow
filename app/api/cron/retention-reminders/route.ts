import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { notifyExpiryReminder } from "@/lib/whatsapp";

// Appelé chaque lundi matin par Vercel Cron (voir vercel.json)
// Envoie un WhatsApp aux membres actifs n'ayant pas pointé depuis 14 jours.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const cutoff = new Date(Date.now() - 14 * 86400000).toISOString();

  // Récupérer tous les membres actifs (non archivés) avec leur dernière entrée
  const { data: gyms } = await supabase
    .from("gyms")
    .select("id, name, whatsapp_phone, phone");

  let sent = 0;
  let errors = 0;

  for (const gym of gyms ?? []) {
    const gymContact = gym.whatsapp_phone || gym.phone || "";

    // Membres actifs non archivés
    const { data: members } = await supabase
      .from("members")
      .select("id, full_name, phone")
      .eq("gym_id", gym.id)
      .is("archived_at", null)
      .not("phone", "is", null);

    if (!members?.length) continue;

    const memberIds = members.map((m) => m.id);

    // Membres ayant pointé dans les 14 derniers jours → à exclure
    const { data: recentCheckins } = await supabase
      .from("checkins")
      .select("member_id")
      .eq("gym_id", gym.id)
      .in("member_id", memberIds)
      .gte("checked_in_at", cutoff);

    const activeSet = new Set((recentCheckins ?? []).map((c) => c.member_id as string));

    // Garder seulement ceux avec un abonnement actif (pas la peine de relancer un expiré)
    const { data: activeSubs } = await supabase
      .from("subscriptions")
      .select("member_id")
      .eq("gym_id", gym.id)
      .eq("status", "active")
      .in("member_id", memberIds);

    const hasActiveSub = new Set((activeSubs ?? []).map((s) => s.member_id as string));

    for (const member of members) {
      if (activeSet.has(member.id)) continue;
      if (!hasActiveSub.has(member.id)) continue;
      if (!member.phone) continue;

      try {
        await notifyExpiryReminder({
          phone: member.phone,
          memberName: member.full_name ?? "",
          gymName: gym.name ?? "",
          daysLeft: 0,
          gymContact,
        });
        sent++;
      } catch {
        errors++;
      }
    }
  }

  return NextResponse.json({ sent, errors });
}
