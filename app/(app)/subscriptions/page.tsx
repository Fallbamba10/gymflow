import Link from "next/link";
import { BarChart3, CreditCard, EyeOff, Plus, RotateCcw, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { formatCurrency, formatDuration, formatSessions } from "@/lib/demo-data";
import { requireAdminGym } from "@/lib/supabase/guards";
import { getSubscriptionTypeStats, getSubscriptionTypes } from "@/lib/supabase/queries";

type SubscriptionsPageProps = {
  searchParams: Promise<{ status?: string }>;
};

export default async function SubscriptionsPage({ searchParams }: SubscriptionsPageProps) {
  const params = await searchParams;
  const selectedStatus = params.status ?? "active";
  const gym = await requireAdminGym();

  const [allTypes, typeStats] = await Promise.all([
    getSubscriptionTypes(gym.id, { includeInactive: true }),
    getSubscriptionTypeStats(gym.id),
  ]);

  const types = allTypes.filter((t) => {
    if (selectedStatus === "all") return true;
    if (selectedStatus === "inactive") return !t.active;
    return t.active;
  });

  const activeCount = allTypes.filter((t) => t.active).length;
  const inactiveCount = allTypes.length - activeCount;
  const totalRevenue = allTypes.reduce((s, t) => s + (typeStats[t.id]?.revenue ?? 0), 0);
  const totalSales = allTypes.reduce((s, t) => s + (typeStats[t.id]?.sales_count ?? 0), 0);
  const topType = [...allTypes].sort((a, b) => (typeStats[b.id]?.revenue ?? 0) - (typeStats[a.id]?.revenue ?? 0))[0];

  const filters = [
    { label: "Actives", value: "active", count: activeCount },
    { label: "Inactives", value: "inactive", count: inactiveCount },
    { label: "Toutes", value: "all", count: allTypes.length },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Abonnements"
        eyebrow="Formules et tarifs"
        actions={
          <Link
            href="/subscriptions/new"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-500 px-4 text-sm font-semibold text-white transition hover:bg-emerald-400"
          >
            <Plus size={16} />
            Nouvelle formule
          </Link>
        }
      />

      <div className="grid gap-4 px-6 py-6 md:px-8 xl:grid-cols-[1fr_300px]">
        <div className="space-y-4">

          {/* KPIs */}
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { label: "Formules actives", value: String(activeCount), detail: `${inactiveCount} désactivée${inactiveCount > 1 ? "s" : ""}`, icon: CreditCard, accent: "text-emerald-400", bg: "bg-emerald-500/15" },
              { label: "Ventes totales", value: String(totalSales), detail: "abonnements créés", icon: BarChart3, accent: "text-blue-400", bg: "bg-blue-500/15" },
              { label: "Revenu formules", value: formatCurrency(totalRevenue), detail: "historique complet", icon: TrendingUp, accent: "text-violet-400", bg: "bg-violet-500/15" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-white/8 bg-white/4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/40">{s.label}</p>
                    <p className="mt-3 text-2xl font-semibold">{s.value}</p>
                    <p className="mt-1 text-xs text-white/35">{s.detail}</p>
                  </div>
                  <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${s.bg} ${s.accent}`}>
                    <s.icon size={18} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Catalogue */}
          <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/4">
            <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
              <div>
                <h2 className="font-semibold">Catalogue formules</h2>
                <p className="mt-0.5 text-xs text-white/40">Prix, durée, ventes et disponibilité.</p>
              </div>
              <CreditCard size={18} className="text-emerald-400" />
            </div>

            {/* Filtres */}
            <div className="flex gap-2 border-b border-white/8 px-6 py-3">
              {filters.map((f) => (
                <Link
                  key={f.value}
                  href={`/subscriptions?status=${f.value}`}
                  className={`inline-flex h-8 items-center gap-2 rounded-xl px-3 text-xs font-semibold transition ${
                    selectedStatus === f.value
                      ? "bg-emerald-500 text-white"
                      : "border border-white/8 bg-white/4 text-white/50 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  {f.label}
                  <span className={`rounded-md px-1.5 py-0.5 text-[10px] ${selectedStatus === f.value ? "bg-white/20" : "bg-white/8 text-white/40"}`}>
                    {f.count}
                  </span>
                </Link>
              ))}
            </div>

            {/* Liste */}
            <div className="divide-y divide-white/6">
              {types.length > 0 ? (
                types.map((type) => {
                  const s = typeStats[type.id] ?? { sales_count: 0, revenue: 0, active_subscriptions: 0, latest_sale_at: null };
                  return (
                    <div key={type.id} className="grid items-center gap-4 px-6 py-4 md:grid-cols-[1.4fr_0.6fr_0.6fr_0.8fr_0.8fr_auto]">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{type.name}</p>
                          <StatusBadge tone={type.active ? "active" : "neutral"}>
                            {type.active ? "Active" : "Inactive"}
                          </StatusBadge>
                        </div>
                        <p className="mt-0.5 text-xs text-white/40">
                          {s.active_subscriptions} abonnement{s.active_subscriptions !== 1 ? "s" : ""} actif{s.active_subscriptions !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <p className="text-sm text-white/60">{formatDuration(type.duration_days)}</p>
                      <p className="text-sm text-white/60">{formatSessions(type.sessions)}</p>
                      <p className="text-sm font-semibold">{formatCurrency(type.price)}</p>
                      <div>
                        <p className="text-sm font-semibold text-emerald-400">{formatCurrency(s.revenue)}</p>
                        <p className="text-xs text-white/35">{s.sales_count} vente{s.sales_count !== 1 ? "s" : ""}</p>
                      </div>
                      <Link
                        href={`/subscriptions/${type.id}/edit`}
                        className="inline-flex h-8 items-center rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-semibold text-white/60 transition hover:bg-white/8 hover:text-white"
                      >
                        Modifier
                      </Link>
                    </div>
                  );
                })
              ) : (
                <div className="px-6 py-10 text-center">
                  <p className="font-semibold text-white/60">
                    {allTypes.length === 0 ? "Aucune formule pour le moment" : "Aucune formule dans ce filtre"}
                  </p>
                  <p className="mt-1 text-sm text-white/30">
                    {allTypes.length === 0
                      ? "Crée ta première formule pour pouvoir ajouter des membres."
                      : "Change de filtre pour revoir les autres formules."}
                  </p>
                  {allTypes.length === 0 && (
                    <Link
                      href="/subscriptions/new"
                      className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-500 px-4 text-sm font-semibold text-white"
                    >
                      <Plus size={15} />
                      Créer une formule
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar infos */}
        <aside className="space-y-3 xl:sticky xl:top-24 xl:self-start">
          <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/4">
            <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
              <h2 className="font-semibold">Aide rapide</h2>
              <RotateCcw size={16} className="text-amber-400" />
            </div>
            <div className="space-y-3 p-5">
              <div className="rounded-xl border border-white/6 bg-white/4 p-4">
                <p className="text-sm font-semibold">Top formule</p>
                <p className="mt-1 text-xs leading-5 text-white/40">
                  {topType
                    ? `${topType.name} · ${formatCurrency(typeStats[topType.id]?.revenue ?? 0)}`
                    : "Aucune vente pour le moment."}
                </p>
              </div>
              <div className="rounded-xl border border-white/6 bg-white/4 p-4">
                <p className="text-sm font-semibold">Modifier une formule</p>
                <p className="mt-1 text-xs leading-5 text-white/40">
                  Mets à jour le prix ou la durée pour les prochains abonnements.
                </p>
              </div>
              <div className="rounded-xl border border-white/6 bg-white/4 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <EyeOff size={14} className="text-white/40" />
                  Désactiver une formule
                </div>
                <p className="mt-1 text-xs leading-5 text-white/40">
                  La formule disparaît des nouvelles ventes sans casser l&apos;historique.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
