import Link from "next/link";
import { Activity, AlertTriangle, Banknote, CalendarClock, CheckCircle2, Plus, Search, Users } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { formatCurrency } from "@/lib/demo-data";
import { getCurrentGym, getDashboardData } from "@/lib/supabase/queries";

function formatTime(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function Home() {
  const gym = await getCurrentGym();
  const dashboard = gym
    ? await getDashboardData(gym.id)
    : {
        revenueToday: 0,
        paymentsToday: 0,
        checkinsToday: [],
        activeMembers: 0,
        totalMembers: 0,
        alerts: [],
      };

  const stats = [
    {
      label: "Revenus du jour",
      value: formatCurrency(dashboard.revenueToday),
      detail: `${dashboard.paymentsToday} paiement${dashboard.paymentsToday > 1 ? "s" : ""}`,
      icon: Banknote,
    },
    {
      label: "Entrees",
      value: String(dashboard.checkinsToday.length),
      detail: "journal du jour",
      icon: Activity,
    },
    {
      label: "Membres actifs",
      value: String(dashboard.activeMembers),
      detail: `${dashboard.totalMembers} membres au total`,
      icon: Users,
    },
    {
      label: "Alertes",
      value: String(dashboard.alerts.length),
      detail: "expires ou a renouveler",
      icon: AlertTriangle,
    },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Tableau de bord"
        eyebrow={new Intl.DateTimeFormat("fr-FR", { dateStyle: "full" }).format(new Date())}
        actions={
          <Link href="/members/new" className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-mint px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700">
            <Plus size={18} />
            Ajouter membre
          </Link>
        }
      />

      <div className="px-4 py-6 md:px-8">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-md border border-line bg-white shadow-soft">
            <div className="flex items-center justify-between border-b border-line p-5">
              <div>
                <h2 className="text-lg font-semibold">Pointage rapide</h2>
                <p className="mt-1 text-sm text-neutral-500">Acces direct au pointage connecte a Supabase.</p>
              </div>
              <CheckCircle2 className="text-mint" size={22} />
            </div>
            <div className="p-5">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                  <input
                    className="h-12 w-full rounded-md border border-line bg-paper pl-10 pr-3 text-sm outline-none focus:border-mint"
                    placeholder="Recherche sur la page Pointage"
                    disabled
                  />
                </div>
                <Link href="/checkin" className="inline-flex h-12 items-center justify-center rounded-md bg-ink px-5 text-sm font-semibold text-white">
                  Ouvrir le pointage
                </Link>
              </div>

              <div className="mt-5 overflow-hidden rounded-md border border-line">
                {dashboard.checkinsToday.length > 0 ? (
                  dashboard.checkinsToday.slice(0, 5).map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between border-b border-line px-4 py-3 last:border-b-0">
                      <div className="flex items-center gap-3">
                        <span className="rounded-md bg-paper px-2 py-1 text-sm font-semibold">{formatTime(entry.checked_in_at)}</span>
                        <div>
                          <p className="text-sm font-semibold">{entry.member_name}</p>
                          <p className="text-xs text-neutral-500">{entry.plan ?? "Abonnement"}</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-mint">Valide</span>
                    </div>
                  ))
                ) : (
                  <p className="p-4 text-sm text-neutral-500">Aucune entree aujourd&apos;hui.</p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-md border border-line bg-white shadow-soft">
            <div className="flex items-center justify-between border-b border-line p-5">
              <div>
                <h2 className="text-lg font-semibold">A renouveler</h2>
                <p className="mt-1 text-sm text-neutral-500">Abonnements expires ou seances faibles.</p>
              </div>
              <CalendarClock className="text-amber" size={22} />
            </div>
            <div className="divide-y divide-line">
              {dashboard.alerts.length > 0 ? (
                dashboard.alerts.map((alert) => (
                  <Link
                    key={alert.member_id}
                    href={`/members/${alert.member_id}`}
                    className="flex items-center justify-between gap-3 p-5 transition hover:bg-neutral-50"
                  >
                    <div>
                      <p className="text-sm font-semibold">{alert.member_name}</p>
                      <p className="mt-1 text-xs text-neutral-500">{alert.plan ?? "Sans formule"}</p>
                    </div>
                    <StatusBadge tone={alert.status}>{alert.status_label}</StatusBadge>
                  </Link>
                ))
              ) : (
                <p className="p-5 text-sm text-neutral-500">Aucune alerte pour le moment.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
