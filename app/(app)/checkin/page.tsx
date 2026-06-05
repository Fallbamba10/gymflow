import { CheckCircle2, Search } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { StaffPinFields } from "@/components/staff-pin-fields";
import { SubmitButton } from "@/components/submit-button";
import { performMemberCheckin } from "@/app/(app)/checkin/actions";
import { getCheckinCandidates, getCurrentGym, getGymStaff, getTodayCheckins } from "@/lib/supabase/queries";

type CheckinPageProps = {
  searchParams: Promise<{
    error?: string;
    q?: string;
    success?: string;
  }>;
};

function formatTime(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("fr-FR").format(new Date(value));
}

export default async function CheckinPage({ searchParams }: CheckinPageProps) {
  const params = await searchParams;
  const query = params.q?.trim().toLowerCase() ?? "";
  const gym = await getCurrentGym();
  const allCandidates = gym ? await getCheckinCandidates(gym.id) : [];
  const candidates = allCandidates.filter((member) => {
    if (!query) return true;
    return (
      member.full_name.toLowerCase().includes(query) ||
      (member.phone ?? "").toLowerCase().includes(query) ||
      String(member.member_number).padStart(6, "0").includes(query)
    );
  });
  const checkins = gym ? await getTodayCheckins(gym.id) : [];
  const staff = gym ? await getGymStaff(gym.id) : [];

  return (
    <AppShell>
      <PageHeader
        title="Pointage"
        eyebrow={`${checkins.length} entree${checkins.length > 1 ? "s" : ""} aujourd'hui`}
      />

      <div className="grid gap-6 px-4 py-6 md:px-8 xl:grid-cols-[1fr_420px]">
        <section className="rounded-md border border-line bg-white shadow-soft">
          <div className="border-b border-line p-5">
            <h2 className="text-lg font-semibold">Rechercher un membre</h2>
            <p className="mt-1 text-sm text-neutral-500">Recherche par nom, telephone ou numero membre.</p>
          </div>
          <div className="p-5">
            <form className="flex flex-col gap-3 sm:flex-row" action="/checkin">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                <input
                  className="h-14 w-full rounded-md border border-line bg-paper pl-12 pr-4 text-base outline-none focus:border-mint"
                  name="q"
                  placeholder="Nom, telephone ou numero"
                  defaultValue={params.q ?? ""}
                />
              </div>
              <button className="h-14 rounded-md bg-ink px-5 text-sm font-semibold text-white">
                Rechercher
              </button>
            </form>

            {params.success ? (
              <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-mint">
                {params.success}
              </div>
            ) : null}
            {params.error ? (
              <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-danger">
                {params.error}
              </div>
            ) : null}

            <div className="mt-5 space-y-3">
              {candidates.length > 0 ? (
                candidates.map((member) => (
                  <div key={member.id} className="rounded-md border border-line p-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <p className="font-semibold">{member.full_name}</p>
                          <StatusBadge tone={member.status}>{member.status_label}</StatusBadge>
                        </div>
                        <p className="mt-1 text-sm text-neutral-500">
                          {String(member.member_number).padStart(6, "0")} · {member.plan ?? "Sans formule"} · expire le {formatDate(member.expires_at)}
                        </p>
                      </div>
                      <form action={performMemberCheckin}>
                        <input type="hidden" name="member_id" value={member.id} />
                        <div className="space-y-3">
                          <StaffPinFields staff={staff} />
                          <SubmitButton disabled={member.status === "expired"} className="h-10 w-full md:w-auto" pendingLabel="Validation...">
                            <CheckCircle2 size={18} />
                            Valider
                          </SubmitButton>
                        </div>
                      </form>
                    </div>
                  </div>
                ))
              ) : (
                <p className="rounded-md border border-line bg-paper p-4 text-sm text-neutral-500">
                  Aucun membre trouve. Ajuste la recherche ou ajoute un membre avec un abonnement actif.
                </p>
              )}
            </div>
          </div>
        </section>

        <aside className="rounded-md border border-line bg-white shadow-soft">
          <div className="border-b border-line p-5">
            <h2 className="text-lg font-semibold">Journal du jour</h2>
            <p className="mt-1 text-sm text-neutral-500">Dernieres entrees validees.</p>
          </div>
          <div className="divide-y divide-line">
            {checkins.length > 0 ? (
              checkins.slice(0, 12).map((entry) => (
                <div key={entry.id} className="flex items-center justify-between gap-4 p-5">
                  <div>
                    <p className="font-semibold">{entry.member_name}</p>
                    <p className="mt-1 text-sm text-neutral-500">{entry.plan ?? "Abonnement"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-semibold">{formatTime(entry.checked_in_at)}</p>
                    <p className="mt-1 text-xs text-mint">Valide</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="p-5 text-sm text-neutral-500">Aucune entree aujourd&apos;hui.</p>
            )}
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
