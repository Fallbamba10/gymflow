/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Plus, Search, Users } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { requireAdminGym } from "@/lib/supabase/guards";
import { getMembers } from "@/lib/supabase/queries";

function getMemberStatus(member: Awaited<ReturnType<typeof getMembers>>[number]) {
  if (member.archived_at) return { tone: "neutral" as const, label: "Archivé" };
  const sub = member.active_subscription;
  if (!sub) return { tone: "expired" as const, label: "Sans abonnement" };
  if (sub.status !== "active") return { tone: "expired" as const, label: "Expiré" };
  if (sub.sessions_left !== null && sub.sessions_left <= 2)
    return { tone: "warning" as const, label: `${sub.sessions_left} séance${sub.sessions_left > 1 ? "s" : ""}` };
  const daysLeft = Math.ceil((new Date(sub.expires_at).getTime() - Date.now()) / 86400000);
  if (daysLeft <= 2) return { tone: "warning" as const, label: `Expire J-${Math.max(daysLeft, 0)}` };
  return { tone: "active" as const, label: "Actif" };
}

const PAGE_SIZE = 50;

type MembersPageProps = {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
};

export default async function MembersPage({ searchParams }: MembersPageProps) {
  const params = await searchParams;
  const query = params.q?.trim().toLowerCase() ?? "";
  const selectedStatus = params.status ?? "all";
  const currentPage = Math.max(1, parseInt(params.page ?? "1", 10));
  const gym = await requireAdminGym();
  const allMembers = await getMembers(gym.id, { includeArchived: true });
  const visibleActive = allMembers.filter((m) => !m.archived_at);

  const members = allMembers.filter((m) => {
    const status = getMemberStatus(m);
    const matchQ =
      !query ||
      m.full_name.toLowerCase().includes(query) ||
      (m.phone ?? "").toLowerCase().includes(query) ||
      String(m.member_number).padStart(6, "0").includes(query);
    const matchS =
      (selectedStatus === "all" && !m.archived_at) ||
      (selectedStatus === "active" && status.tone === "active") ||
      (selectedStatus === "renewal" && (status.tone === "warning" || status.tone === "expired")) ||
      (selectedStatus === "expired" && status.tone === "expired") ||
      (selectedStatus === "archived" && Boolean(m.archived_at));
    return matchQ && matchS;
  });

  const totalFiltered = members.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedMembers = members.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function pageHref(p: number) {
    const qs = new URLSearchParams();
    if (params.q) qs.set("q", params.q);
    if (selectedStatus !== "all") qs.set("status", selectedStatus);
    if (p > 1) qs.set("page", String(p));
    const s = qs.toString();
    return `/members${s ? `?${s}` : ""}`;
  }

  const renewalCount = allMembers.filter((m) => {
    const s = getMemberStatus(m);
    return s.tone === "warning" || s.tone === "expired";
  }).length;
  const activeCount = visibleActive.filter((m) => getMemberStatus(m).tone === "active").length;
  const expiredCount = visibleActive.filter((m) => getMemberStatus(m).tone === "expired").length;
  const archivedCount = allMembers.filter((m) => m.archived_at).length;

  const filters = [
    { label: "Tous", value: "all", count: visibleActive.length },
    { label: "Actifs", value: "active", count: activeCount },
    { label: "À renouveler", value: "renewal", count: renewalCount },
    { label: "Expirés", value: "expired", count: expiredCount },
    { label: "Archivés", value: "archived", count: archivedCount },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Membres"
        eyebrow={`${visibleActive.length} membres enregistrés`}
        actions={
          <Link
            href="/members/new"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-500 px-4 text-sm font-semibold text-white transition hover:bg-emerald-400"
          >
            <Plus size={16} />
            Nouveau membre
          </Link>
        }
      />

      <div className="px-6 py-6 md:px-8">

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Membres visibles", value: visibleActive.length, icon: Users, accent: "text-white/60" },
            { label: "Actifs", value: activeCount, icon: CheckCircle2, accent: "text-emerald-400" },
            { label: "À traiter", value: renewalCount, icon: AlertTriangle, accent: renewalCount > 0 ? "text-amber-400" : "text-white/40" },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/8 bg-white/4 px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/40">{item.label}</p>
                <item.icon size={15} className={item.accent} />
              </div>
              <p className="mt-2 text-2xl font-semibold">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Recherche */}
        <form className="mt-4 flex gap-2" action="/members">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" size={16} />
            <input
              className="h-11 w-full rounded-xl border border-white/10 bg-white/6 pl-10 pr-4 text-sm text-white placeholder-white/25 outline-none transition focus:border-emerald-500/60 focus:bg-white/8"
              name="q"
              placeholder="Rechercher par nom, téléphone ou numéro…"
              defaultValue={params.q ?? ""}
            />
          </div>
          <button className="inline-flex h-11 items-center gap-2 rounded-xl bg-white/8 px-4 text-sm font-semibold text-white/70 transition hover:bg-white/12 hover:text-white">
            <Search size={15} />
            Chercher
          </button>
          <input type="hidden" name="status" value={selectedStatus} />
        </form>

        {/* Filtres */}
        <div className="mt-3 flex flex-wrap gap-2">
          {filters.map((f) => (
            <Link
              key={f.value}
              href={`/members?status=${f.value}${params.q ? `&q=${encodeURIComponent(params.q)}` : ""}`}
              className={`inline-flex h-9 items-center gap-2 rounded-xl px-3 text-sm font-semibold transition ${
                selectedStatus === f.value
                  ? "bg-emerald-500 text-white"
                  : "border border-white/8 bg-white/4 text-white/50 hover:bg-white/8 hover:text-white"
              }`}
            >
              {f.label}
              <span className={`rounded-md px-1.5 py-0.5 text-xs ${selectedStatus === f.value ? "bg-white/20 text-white" : "bg-white/8 text-white/40"}`}>
                {f.count}
              </span>
            </Link>
          ))}
        </div>

        {/* Tableau */}
        <div className="mt-4 overflow-hidden rounded-2xl border border-white/8">
          <div className="overflow-x-auto">
            <div className="min-w-[860px]">
              <div className="grid grid-cols-[0.6fr_1.6fr_1fr_1fr_0.7fr_0.9fr_0.8fr] border-b border-white/8 bg-white/3 px-5 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-white/35">
                <span>N°</span>
                <span>Membre</span>
                <span>Téléphone</span>
                <span>Formule</span>
                <span>Séances</span>
                <span>Expiration</span>
                <span>Statut</span>
              </div>

              {paginatedMembers.length > 0 ? (
                paginatedMembers.map((member) => {
                  const status = getMemberStatus(member);
                  const sub = member.active_subscription;
                  return (
                    <Link
                      key={member.id}
                      href={`/members/${member.id}`}
                      className="grid grid-cols-[0.6fr_1.6fr_1fr_1fr_0.7fr_0.9fr_0.8fr] items-center border-b border-white/6 px-5 py-3.5 text-sm transition last:border-b-0 hover:bg-white/4"
                    >
                      <span className="font-mono text-xs text-white/35">
                        {String(member.member_number).padStart(6, "0")}
                      </span>
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/8 text-xs font-bold text-white/60">
                          {member.photo_url ? (
                            <img src={member.photo_url} alt={member.full_name} className="size-full object-cover" />
                          ) : (
                            member.full_name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-semibold">{member.full_name}</span>
                          <span className="mt-0.5 block text-xs text-white/35">
                            Ajouté le {new Intl.DateTimeFormat("fr-FR").format(new Date(member.created_at))}
                          </span>
                        </span>
                      </span>
                      <span className="text-white/55">{member.phone ?? "—"}</span>
                      <span className="truncate text-white/70">{sub?.subscription_types?.name ?? "—"}</span>
                      <span className="text-white/55">{sub?.sessions_left ?? "Illimité"}</span>
                      <span className="text-white/55">
                        {sub?.expires_at ? new Intl.DateTimeFormat("fr-FR").format(new Date(sub.expires_at)) : "—"}
                      </span>
                      <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                    </Link>
                  );
                })
              ) : (
                <div className="px-5 py-10 text-center">
                  <p className="font-semibold text-white/60">Aucun membre trouvé</p>
                  <p className="mt-1 text-sm text-white/30">Ajuste la recherche ou ajoute un nouveau membre.</p>
                  <Link
                    href="/members/new"
                    className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-500 px-4 text-sm font-semibold text-white"
                  >
                    <Plus size={15} />
                    Ajouter un membre
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between gap-4 text-sm">
            <p className="text-white/35">
              {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, totalFiltered)} sur {totalFiltered}
            </p>
            <div className="flex items-center gap-2">
              {safePage > 1 && (
                <Link href={pageHref(safePage - 1)} className="inline-flex h-9 items-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white/60 transition hover:bg-white/8 hover:text-white">
                  Précédent
                </Link>
              )}
              <span className="inline-flex h-9 items-center rounded-xl bg-emerald-500 px-4 text-sm font-semibold text-white">
                {safePage} / {totalPages}
              </span>
              {safePage < totalPages && (
                <Link href={pageHref(safePage + 1)} className="inline-flex h-9 items-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white/60 transition hover:bg-white/8 hover:text-white">
                  Suivant
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
