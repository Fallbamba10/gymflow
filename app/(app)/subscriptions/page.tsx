import Link from "next/link";
import { BarChart3, CreditCard, EyeOff, Plus, RotateCcw, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { formatCurrency, formatDuration, formatSessions } from "@/lib/demo-data";
import { getCurrentGym, getSubscriptionTypeStats, getSubscriptionTypes } from "@/lib/supabase/queries";

type SubscriptionsPageProps = {
  searchParams: Promise<{
    success?: string;
    error?: string;
    status?: string;
  }>;
};

export default async function SubscriptionsPage({ searchParams }: SubscriptionsPageProps) {
  const params = await searchParams;
  const selectedStatus = params.status ?? "active";
  const gym = await getCurrentGym();
  const [allSubscriptionTypes, typeStats] = gym
    ? await Promise.all([
        getSubscriptionTypes(gym.id, { includeInactive: true }),
        getSubscriptionTypeStats(gym.id),
      ])
    : [[], {}];
  const subscriptionTypes = allSubscriptionTypes.filter((type) => {
    if (selectedStatus === "all") return true;
    if (selectedStatus === "inactive") return !type.active;
    return type.active;
  });
  const activeCount = allSubscriptionTypes.filter((type) => type.active).length;
  const inactiveCount = allSubscriptionTypes.length - activeCount;
  const totalRevenue = allSubscriptionTypes.reduce(
    (sum, type) => sum + (typeStats[type.id]?.revenue ?? 0),
    0,
  );
  const totalSales = allSubscriptionTypes.reduce(
    (sum, type) => sum + (typeStats[type.id]?.sales_count ?? 0),
    0,
  );
  const topType = [...allSubscriptionTypes].sort(
    (a, b) => (typeStats[b.id]?.revenue ?? 0) - (typeStats[a.id]?.revenue ?? 0),
  )[0];
  const filters = [
    { label: `Actives (${activeCount})`, value: "active" },
    { label: `Inactives (${inactiveCount})`, value: "inactive" },
    { label: `Toutes (${allSubscriptionTypes.length})`, value: "all" },
  ];
  const stats = [
    {
      label: "Formules actives",
      value: String(activeCount),
      detail: `${inactiveCount} desactivee${inactiveCount > 1 ? "s" : ""}`,
      icon: CreditCard,
    },
    {
      label: "Ventes totales",
      value: String(totalSales),
      detail: "abonnements crees",
      icon: BarChart3,
    },
    {
      label: "Revenu formules",
      value: formatCurrency(totalRevenue),
      detail: "historique complet",
      icon: TrendingUp,
    },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Abonnements"
        eyebrow="Formules et tarifs"
        actions={
          <Link href="/subscriptions/new" className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-mint px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700">
            <Plus size={18} />
            Nouvelle formule
          </Link>
        }
      />

      <div className="grid gap-6 px-4 py-6 md:px-8 xl:grid-cols-[1fr_380px]">
        <section className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {stats.map((stat) => (
              <article key={stat.label} className="rounded-md border border-line bg-white p-5 shadow-soft">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-neutral-500">{stat.label}</p>
                    <p className="mt-3 text-2xl font-semibold">{stat.value}</p>
                    <p className="mt-1 text-sm text-neutral-500">{stat.detail}</p>
                  </div>
                  <div className="flex size-10 items-center justify-center rounded-md bg-paper text-ink">
                    <stat.icon size={20} />
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="rounded-md border border-line bg-white shadow-soft">
          <div className="flex items-center justify-between border-b border-line p-5">
            <div>
              <h2 className="text-lg font-semibold">Catalogue formules</h2>
              <p className="mt-1 text-sm text-neutral-500">Prix, duree, ventes et disponibilite.</p>
            </div>
            <CreditCard className="text-mint" size={22} />
          </div>

          {params.success ? (
            <div className="mx-5 mt-5 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-mint">
              {params.success}
            </div>
          ) : null}

          {params.error ? (
            <div className="mx-5 mt-5 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold text-danger">
              {params.error}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2 border-b border-line p-5">
            {filters.map((filter) => (
              <Link
                key={filter.value}
                href={`/subscriptions?status=${filter.value}`}
                className={`inline-flex h-9 items-center rounded-md px-3 text-sm font-semibold ${
                  selectedStatus === filter.value ? "bg-ink text-white" : "border border-line bg-white text-neutral-600"
                }`}
              >
                {filter.label}
              </Link>
            ))}
          </div>

          <div className="divide-y divide-line">
            {subscriptionTypes.length > 0 ? (
              subscriptionTypes.map((type) => {
                const stats = typeStats[type.id] ?? {
                  sales_count: 0,
                  revenue: 0,
                  active_subscriptions: 0,
                  latest_sale_at: null,
                };

                return (
                <div key={type.id} className="grid gap-4 p-5 md:grid-cols-[1.3fr_0.7fr_0.7fr_0.8fr_0.8fr_0.8fr] md:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{type.name}</p>
                      <StatusBadge tone={type.active ? "active" : "neutral"}>
                        {type.active ? "Active" : "Inactive"}
                      </StatusBadge>
                    </div>
                    <p className="mt-1 text-sm text-neutral-500">
                      {stats.active_subscriptions} abonnement{stats.active_subscriptions > 1 ? "s" : ""} actif{stats.active_subscriptions > 1 ? "s" : ""}
                    </p>
                  </div>
                  <p className="text-sm">{formatDuration(type.duration_days)}</p>
                  <p className="text-sm">{formatSessions(type.sessions)}</p>
                  <p className="text-sm font-semibold">{formatCurrency(type.price)}</p>
                  <div className="text-sm">
                    <p className="font-semibold">{formatCurrency(stats.revenue)}</p>
                    <p className="mt-1 text-xs text-neutral-500">{stats.sales_count} vente{stats.sales_count > 1 ? "s" : ""}</p>
                  </div>
                  <Link
                    href={`/subscriptions/${type.id}/edit`}
                    className="inline-flex h-9 items-center justify-center rounded-md border border-line bg-white px-3 text-sm font-semibold transition hover:bg-neutral-50 md:justify-self-end"
                  >
                    Modifier
                  </Link>
                </div>
                );
              })
            ) : (
              <div className="p-8 text-center">
                <p className="font-semibold">
                  {allSubscriptionTypes.length === 0 ? "Aucune formule pour le moment" : "Aucune formule dans ce filtre"}
                </p>
                <p className="mt-2 text-sm text-neutral-500">
                  {allSubscriptionTypes.length === 0
                    ? "Cree ta premiere formule pour pouvoir ajouter des membres."
                    : "Change de filtre pour revoir les autres formules."}
                </p>
                <Link href="/subscriptions/new" className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-mint px-4 text-sm font-semibold text-white">
                  Creer une formule
                </Link>
              </div>
            )}
          </div>
          </div>
        </section>

        <aside className="rounded-md border border-line bg-white shadow-soft">
          <div className="flex items-center justify-between border-b border-line p-5">
            <div>
              <h2 className="text-lg font-semibold">Renouvellements</h2>
              <p className="mt-1 text-sm text-neutral-500">Les renouvellements se font depuis la fiche membre.</p>
            </div>
            <RotateCcw className="text-amber" size={22} />
          </div>
          <div className="space-y-4 p-5 text-sm">
            <div className="rounded-md bg-paper p-4">
              <p className="font-semibold">Top formule</p>
              <p className="mt-1 text-neutral-500">
                {topType ? `${topType.name} · ${formatCurrency(typeStats[topType.id]?.revenue ?? 0)}` : "Aucune vente pour le moment."}
              </p>
            </div>
            <div className="rounded-md bg-paper p-4">
              <p className="font-semibold">Modifier une formule</p>
              <p className="mt-1 text-neutral-500">Mets a jour le prix ou la duree pour les prochains abonnements.</p>
            </div>
            <div className="rounded-md bg-paper p-4">
              <div className="flex items-center gap-2 font-semibold">
                <EyeOff size={16} />
                Desactiver une formule
              </div>
              <p className="mt-1 text-neutral-500">La formule disparait des nouvelles ventes sans casser l&apos;historique.</p>
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
