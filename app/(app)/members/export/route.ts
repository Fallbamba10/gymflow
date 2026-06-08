import { csvResponse, toCsv } from "@/lib/csv";
import { getCurrentGym, getMembers } from "@/lib/supabase/queries";

function formatMemberNumber(value: number) {
  return String(value).padStart(6, "0");
}

function getMemberStatus(member: Awaited<ReturnType<typeof getMembers>>[number]) {
  const subscription = member.active_subscription;
  if (!subscription) {
    return "Aucun abonnement";
  }

  if (subscription.status !== "active") {
    return "Expire";
  }

  if (subscription.sessions_left === 0) {
    return "Expire";
  }

  return "Actif";
}

export async function GET() {
  const gym = await getCurrentGym();
  if (!gym || gym.role !== "admin") {
    return csvResponse("gymflow-membres.csv", toCsv([{ erreur: "Export reserve aux admins" }]));
  }

  const members = await getMembers(gym.id);
  const csv = toCsv(
    members.map((member) => ({
      numero: formatMemberNumber(member.member_number),
      nom: member.full_name,
      telephone: member.phone ?? "",
      formule: member.active_subscription?.subscription_types?.name ?? "",
      seances: member.active_subscription?.sessions_left ?? "Illimite",
      expiration: member.active_subscription?.expires_at ?? "",
      statut: getMemberStatus(member),
      cree_le: member.created_at,
    })),
  );

  return csvResponse("gymflow-membres.csv", csv);
}
