import Link from "next/link";
import { AlertTriangle, CheckCircle2, Download, Plus, Search, UserRound, Users } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { requireAdminGym } from "@/lib/supabase/guards";
import { getMembers } from "@/lib/supabase/queries";

function getMemberStatus(member: Awaited<ReturnType<typeof getMembers>>[number]) {
  if (member.archived_at) {
    return { tone: "neutral" as const, label: "Archive" };
  }

  const subscription = member.active_subscription;
  if (!subscription) {
    return { tone: "expired" as const, label: "Aucun abonnement" };
  }

  if (subscription.status !== "active") {
    return { tone: "expired" as const, label: "Expire" };
  }

  if (subscription.sessions_left !== null && subscription.sessions_left <= 2) {
    return {
      tone: "warning" as const,
      label: `${subscription.sessions_left} seance${subscription.sessions_left > 1 ? "s" : ""}`,
    };
  }

  const expiresAt = new Date(subscription.expires_at);
  const daysLeft = Math.ceil((expiresAt.getTime() - Date.now()) / 86400000);
  if (daysLeft <= 2) {
    return { tone: "warning" as const, label: `Expire J-${Math.max(daysLeft, 0)}` };
  }

  return { tone: "active" as const, label: "Actif" };
}

type MembersPageProps = {
  searchParams: Promise<{
    error?: string;
    q?: string;
    status?: string;
    success?: string;
  }>;
};

export default async function MembersPage({ searchParams }: MembersPageProps) {
  const params = await searchParams;
  const query = params.q?.trim().toLowerCase() ?? "";
  const selectedStatus = params.status ?? "all";
  const gym = await requireAdminGym();
  const allMembers = await getMembers(gym.id, { includeArchived: true });
  const visibleActiveMembers = allMembers.filter((member) => !member.archived_at);
  const members = allMembers.filter((member) => {
    const status = getMemberStatus(member);
    const matchesQuery =
      !query ||
      member.full_name.toLowerCase().includes(query) ||
      (member.phone ?? "").toLowerCase().includes(query) ||
      String(member.member_number).padStart(6, "0").includes(query);
    const matchesStatus =
      (selectedStatus === "all" && !member.archived_at) ||
      (selectedStatus === "active" && status.tone === "active") ||
      (selectedStatus === "renewal" && (status.tone === "warning" || status.tone === "expired")) ||
      (selectedStatus === "expired" && status.tone === "expired") ||
      (selectedStatus === "archived" && Boolean(member.archived_at));

    return matchesQuery && matchesStatus;
  });
  const renewalCount = allMembers.filter((member) => {
    const status = getMemberStatus(member);
    return status.tone === "warning" || status.tone === "expired";
  }).length;
  const activeCount = visibleActiveMembers.filter((member) => getMemberStatus(member).tone === "active").length;
  const expiredCount = visibleActiveMembers.filter((member) => getMemberStatus(member).tone === "expired").length;
  const archivedCount = allMembers.filter((member) => member.archived_at).length;
  const filters = [
    { label: "Tous", value: "all", count: visibleActiveMembers.length },
    { label: "Actifs", value: "active", count: activeCount },
    { label: "A renouveler", value: "renewal", count: renewalCount },
    { label: "Expires", value: "expired", count: expiredCount },
    { label: "Archives", value: "archived", count: archivedCount },
  ];
  const summary = [
    { label: "Membres visibles", value: visibleActiveMembers.length, detail: "hors archives", icon: Users },
    { label: "Actifs", value: activeCount, detail: "abonnement valide", icon: CheckCircle2 },
    { label: "A traiter", value: renewalCount, detail: "renouvellement", icon: AlertTriangle },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Membres"
        eyebrow={`${members.length} membres enregistres`}
        actions={
          <>
            <Link href="/members/export" className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-semibold shadow-sm transition hover:bg-neutral-50">
              <Download size={18} />
              Export CSV
            </Link>
            <Link href="/members/new" className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-mint px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700">
              <Plus size={18} />
              Nouveau membre
            </Link>
          </>
        }
      />

      <div className="px-4 py-6 md:px-8">
        {params.success ? (
          <div className="mb-5 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-mint">
            {params.success}
          </div>
        ) : null}

        {params.error ? (
          <div className="mb-5 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold text-danger">
            {params.error}
          </div>
        ) : null}

        <section className="rounded-md border border-neutral-900 bg-ink p-5 text-white shadow-soft md:p-6">
          <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr] xl:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-white/70">
                <UserRound size={14} />
                Portefeuille membres
              </div>
              <h2 className="mt-4 text-2xl font-semibold md:text-3xl">Repere vite les membres a traiter</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
                Une vue simple pour chercher, verifier le statut et ouvrir une fiche sans perdre le fil.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {summary.map((item) => (
                <div key={item.label} className="border-l border-white/15 pl-4">
                  <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.08em] text-white/45">
                    <item.icon size={13} />
                    {item.label}
                  </p>
                  <p className="mt-2 text-xl font-semibold">{item.value}</p>
                  <p className="mt-1 text-xs text-white/50">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-md border border-line bg-white p-4 shadow-soft">
          <form className="grid gap-3 xl:grid-cols-[1fr_auto]" action="/members">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={19} />
              <input
                className="h-12 w-full rounded-md border border-line bg-paper pl-12 pr-3 text-sm outline-none focus:border-mint"
                name="q"
                placeholder="Rechercher par nom, telephone ou numero"
                defaultValue={params.q ?? ""}
              />
            </div>
            <button className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-ink px-5 text-sm font-semibold text-white transition hover:bg-neutral-800">
              <Search size={18} />
              Rechercher
            </button>
            <input type="hidden" name="status" value={selectedStatus} />
          </form>
        </section>

        <div className="my-4 flex flex-wrap items-center gap-2">
          {filters.map((filter) => (
            <Link
              key={filter.value}
              href={`/members?status=${filter.value}${params.q ? `&q=${encodeURIComponent(params.q)}` : ""}`}
              className={`inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-semibold shadow-sm transition ${
                selectedStatus === filter.value ? "bg-ink text-white" : "border border-line bg-white text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              {filter.label}
              <span className={`rounded-md px-2 py-0.5 text-xs ${selectedStatus === filter.value ? "bg-white/15 text-white" : "bg-paper text-neutral-500"}`}>
                {filter.count}
              </span>
            </Link>
          ))}
        </div>

        <div className="overflow-x-auto rounded-md border border-line bg-white shadow-soft">
          <div className="min-w-[920px]">
            <div className="grid grid-cols-[0.75fr_1.55fr_1fr_1fr_0.8fr_0.9fr_0.9fr] border-b border-line bg-neutral-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.04em] text-neutral-500">
              <span>Numero</span>
              <span>Membre</span>
              <span>Telephone</span>
              <span>Formule</span>
              <span>Seances</span>
              <span>Expiration</span>
              <span>Statut</span>
            </div>
            {members.length > 0 ? (
              members.map((member) => {
                const status = getMemberStatus(member);
                const subscription = member.active_subscription;
                return (
                  <Link
                    key={member.id}
                    href={`/members/${member.id}`}
                    className="grid grid-cols-[0.75fr_1.55fr_1fr_1fr_0.8fr_0.9fr_0.9fr] items-center border-b border-line px-4 py-4 text-sm transition last:border-b-0 hover:bg-neutral-50"
                  >
                    <span className="font-mono text-neutral-500">{String(member.member_number).padStart(6, "0")}</span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{member.full_name}</span>
                      <span className="mt-1 block text-xs text-neutral-500">Ajoute le {new Intl.DateTimeFormat("fr-FR").format(new Date(member.created_at))}</span>
                    </span>
                    <span className="text-neutral-600">{member.phone ?? "-"}</span>
                    <span className="truncate">{subscription?.subscription_types?.name ?? "-"}</span>
                    <span>{subscription?.sessions_left ?? "Illimite"}</span>
                    <span>{subscription?.expires_at ? new Intl.DateTimeFormat("fr-FR").format(new Date(subscription.expires_at)) : "-"}</span>
                    <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                  </Link>
                );
              })
            ) : (
              <div className="p-8 text-center">
                <p className="font-semibold">Aucun membre trouve</p>
                <p className="mt-2 text-sm text-neutral-500">Ajuste la recherche ou ajoute un nouveau membre.</p>
                <Link href="/members/new" className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-mint px-4 text-sm font-semibold text-white">
                  Ajouter un membre
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
