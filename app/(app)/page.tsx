import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Banknote,
  CalendarClock,
  CheckCircle2,
  Clock3,
  CreditCard,
  Gauge,
  Plus,
  ReceiptText,
  ShieldCheck,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
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

function plural(count: number, singular: string, pluralValue = `${singular}s`) {
  return `${count} ${count > 1 ? pluralValue : singular}`;
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
        revenue7Days: [],
        recentPayments: [],
        topPlans: [],
      };

  const todayLabel = new Intl.DateTimeFormat("fr-FR", { dateStyle: "full" }).format(new Date());
  const maxRevenue = Math.max(...dashboard.revenue7Days.map((day) => day.amount), 1);
  const weekRevenue = dashboard.revenue7Days.reduce((sum, day) => sum + day.amount, 0);
  const bestDay = dashboard.revenue7Days.reduce(
    (best, day) => (day.amount > best.amount ? day : best),
    { date: "", label: "-", amount: 0 },
  );
  const uniqueCheckinsToday = new Set(
    dashboard.checkinsToday.map((entry) => entry.member_id).filter(Boolean),
  ).size;
  const activeRate =
    dashboard.totalMembers > 0 ? Math.round((dashboard.activeMembers / dashboard.totalMembers) * 100) : 0;
  const averageTicket =
    dashboard.paymentsToday > 0 ? dashboard.revenueToday / dashboard.paymentsToday : 0;
  const urgentAlerts = dashboard.alerts.filter((alert) => alert.status === "expired").length;
  const warningAlerts = dashboard.alerts.length - urgentAlerts;
  const topPlanMax = Math.max(...dashboard.topPlans.map((plan) => plan.amount), 1);

  const stats = [
    {
      label: "Revenus du jour",
      value: formatCurrency(dashboard.revenueToday),
      detail: `${plural(dashboard.paymentsToday, "paiement")} · ticket moyen ${formatCurrency(averageTicket)}`,
      icon: Banknote,
      tone: "mint",
    },
    {
      label: "Entrees aujourd'hui",
      value: String(dashboard.checkinsToday.length),
      detail: `${uniqueCheckinsToday} membre${uniqueCheckinsToday > 1 ? "s" : ""} unique${uniqueCheckinsToday > 1 ? "s" : ""}`,
      icon: Activity,
      tone: "ink",
    },
    {
      label: "Membres actifs",
      value: String(dashboard.activeMembers),
      detail: `${activeRate}% du portefeuille actif`,
      icon: Users,
      tone: "amber",
    },
    {
      label: "Priorites",
      value: String(dashboard.alerts.length),
      detail: `${urgentAlerts} urgent${urgentAlerts > 1 ? "s" : ""} · ${warningAlerts} a surveiller`,
      icon: AlertTriangle,
      tone: "danger",
    },
  ];

  const quickActions = [
    { label: "Nouveau membre", href: "/members/new", icon: UserPlus, tone: "bg-mint text-white hover:bg-emerald-700" },
    { label: "Pointage", href: "/checkin", icon: CheckCircle2, tone: "bg-ink text-white hover:bg-neutral-800" },
    { label: "Caisse", href: "/payments", icon: ReceiptText, tone: "border border-line bg-white text-ink hover:bg-neutral-50" },
    { label: "Abonnements", href: "/subscriptions", icon: CreditCard, tone: "border border-line bg-white text-ink hover:bg-neutral-50" },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Tableau de bord"
        eyebrow={todayLabel}
        actions={
          <Link href="/members/new" className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-mint px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700">
            <Plus size={18} />
            Ajouter membre
          </Link>
        }
      />

      <div className="px-4 py-6 md:px-8">
        <section className="rounded-md border border-neutral-900 bg-ink p-5 text-white shadow-soft md:p-6">
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-white/70">
                <ShieldCheck size={14} />
                Pilotage en direct
              </div>
              <h2 className="mt-4 text-2xl font-semibold md:text-3xl">
                {gym?.name ? `${gym.name} tourne aujourd'hui` : "Votre salle tourne aujourd'hui"}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
                Gardez les ventes, les entrees et les renouvellements visibles au meme endroit pour agir vite pendant la journee.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="border-l border-white/15 pl-4">
                <p className="text-xs font-medium uppercase tracking-[0.08em] text-white/45">Semaine</p>
                <p className="mt-2 text-xl font-semibold">{formatCurrency(weekRevenue)}</p>
              </div>
              <div className="border-l border-white/15 pl-4">
                <p className="text-xs font-medium uppercase tracking-[0.08em] text-white/45">Meilleur jour</p>
                <p className="mt-2 text-xl font-semibold capitalize">{bestDay.label}</p>
              </div>
              <div className="border-l border-white/15 pl-4">
                <p className="text-xs font-medium uppercase tracking-[0.08em] text-white/45">Sante</p>
                <p className="mt-2 text-xl font-semibold">{activeRate}% actifs</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <article key={stat.label} className="rounded-md border border-line bg-white p-5 shadow-soft">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-500">{stat.label}</p>
                  <p className="mt-3 text-2xl font-semibold">{stat.value}</p>
                  <p className="mt-1 text-sm leading-5 text-neutral-500">{stat.detail}</p>
                </div>
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-paper text-ink">
                  <stat.icon size={20} />
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-5 grid gap-3 md:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`inline-flex h-12 items-center justify-between gap-3 rounded-md px-4 text-sm font-semibold shadow-sm transition ${action.tone}`}
            >
              <span className="inline-flex min-w-0 items-center gap-2">
                <action.icon size={18} className="shrink-0" />
                <span className="truncate">{action.label}</span>
              </span>
              <ArrowRight size={16} className="shrink-0" />
            </Link>
          ))}
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-md border border-line bg-white shadow-soft">
            <div className="flex flex-col gap-3 border-b border-line p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Revenus 7 jours</h2>
                <p className="mt-1 text-sm text-neutral-500">
                  {formatCurrency(weekRevenue)} encaisses · pic a {formatCurrency(bestDay.amount)}
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-sm font-semibold text-mint">
                <TrendingUp size={17} />
                Suivi caisse
              </div>
            </div>
            <div className="p-5">
              <div className="h-64 rounded-md border border-line bg-[linear-gradient(to_bottom,#f7f7f2_0,#f7f7f2_24%,#ffffff_24%,#ffffff_25%,#f7f7f2_25%,#f7f7f2_49%,#ffffff_49%,#ffffff_50%,#f7f7f2_50%,#f7f7f2_74%,#ffffff_74%,#ffffff_75%,#f7f7f2_75%,#f7f7f2_100%)] p-4">
                <div className="flex h-full items-end gap-3">
                  {dashboard.revenue7Days.map((day) => (
                    <div key={day.date} className="flex h-full min-w-0 flex-1 flex-col justify-end gap-2">
                      <div className="flex flex-1 items-end">
                        <div
                          className="w-full rounded-t-md bg-mint shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] transition"
                          style={{ height: `${Math.max((day.amount / maxRevenue) * 100, day.amount > 0 ? 10 : 2)}%` }}
                          title={formatCurrency(day.amount)}
                        />
                      </div>
                      <div className="text-center">
                        <p className="truncate text-xs font-semibold capitalize text-neutral-700">{day.label}</p>
                        <p className="mt-1 truncate text-[11px] text-neutral-500">{formatCurrency(day.amount)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-line bg-white shadow-soft">
            <div className="flex items-center justify-between border-b border-line p-5">
              <div>
                <h2 className="text-lg font-semibold">Mix des formules</h2>
                <p className="mt-1 text-sm text-neutral-500">Ce qui genere le revenu recent.</p>
              </div>
              <Gauge className="text-mint" size={22} />
            </div>
            <div className="space-y-4 p-5">
              {dashboard.topPlans.length > 0 ? (
                dashboard.topPlans.map((plan, index) => (
                  <div key={plan.name}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-paper text-sm font-semibold">
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{plan.name}</p>
                          <p className="mt-1 text-xs text-neutral-500">{plural(plan.count, "paiement")}</p>
                        </div>
                      </div>
                      <p className="shrink-0 text-sm font-semibold">{formatCurrency(plan.amount)}</p>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-paper">
                      <div className="h-full rounded-full bg-ink" style={{ width: `${Math.max((plan.amount / topPlanMax) * 100, 6)}%` }} />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-neutral-500">Aucune vente sur les 7 derniers jours.</p>
              )}
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-md border border-line bg-white shadow-soft">
            <div className="flex items-center justify-between border-b border-line p-5">
              <div>
                <h2 className="text-lg font-semibold">Priorites clients</h2>
                <p className="mt-1 text-sm text-neutral-500">Renouvellements et seances faibles.</p>
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
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{alert.member_name}</p>
                      <p className="mt-1 truncate text-xs text-neutral-500">{alert.plan ?? "Sans formule"}</p>
                    </div>
                    <StatusBadge tone={alert.status}>{alert.status_label}</StatusBadge>
                  </Link>
                ))
              ) : (
                <p className="p-5 text-sm text-neutral-500">Aucune alerte pour le moment.</p>
              )}
            </div>
          </div>

          <div className="rounded-md border border-line bg-white shadow-soft">
            <div className="flex flex-col gap-3 border-b border-line p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Pointage en temps reel</h2>
                <p className="mt-1 text-sm text-neutral-500">Dernieres entrees validees aujourd&apos;hui.</p>
              </div>
              <Link href="/checkin" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white transition hover:bg-neutral-800">
                <CheckCircle2 size={17} />
                Ouvrir
              </Link>
            </div>
            <div className="divide-y divide-line">
              {dashboard.checkinsToday.length > 0 ? (
                dashboard.checkinsToday.slice(0, 6).map((entry) => (
                  <div key={entry.id} className="grid gap-3 p-5 text-sm sm:grid-cols-[84px_1fr_auto] sm:items-center">
                    <div className="inline-flex h-9 w-fit items-center gap-2 rounded-md bg-paper px-3 font-semibold text-neutral-700">
                      <Clock3 size={15} />
                      {formatTime(entry.checked_in_at)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{entry.member_name}</p>
                      <p className="mt-1 truncate text-xs text-neutral-500">
                        {entry.plan ?? "Abonnement"}{entry.staff_name ? ` · ${entry.staff_name}` : ""}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-mint">Valide</span>
                  </div>
                ))
              ) : (
                <p className="p-5 text-sm text-neutral-500">Aucune entree aujourd&apos;hui.</p>
              )}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-md border border-line bg-white shadow-soft">
          <div className="flex flex-col gap-3 border-b border-line p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Dernieres operations</h2>
              <p className="mt-1 text-sm text-neutral-500">Encaissements recents avec attribution equipe.</p>
            </div>
            <Link href="/payments" className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:bg-neutral-50">
              Voir caisse
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="divide-y divide-line">
            {dashboard.recentPayments.length > 0 ? (
              dashboard.recentPayments.map((payment) => (
                <div key={payment.id} className="grid gap-3 p-5 text-sm md:grid-cols-[1.2fr_1fr_0.8fr] md:items-center">
                  <div className="min-w-0">
                    {payment.member_id ? (
                      <Link href={`/members/${payment.member_id}`} className="truncate font-semibold transition hover:text-mint">
                        {payment.member_name}
                      </Link>
                    ) : (
                      <p className="truncate font-semibold">{payment.member_name}</p>
                    )}
                    <p className="mt-1 truncate text-xs text-neutral-500">
                      {payment.plan ?? "Paiement manuel"}{payment.staff_name ? ` · ${payment.staff_name}` : ""}
                    </p>
                  </div>
                  <p className="text-neutral-600">{formatTime(payment.paid_at)}</p>
                  <p className="font-semibold md:text-right">{formatCurrency(payment.amount)}</p>
                </div>
              ))
            ) : (
              <p className="p-5 text-sm text-neutral-500">Aucun paiement recent.</p>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
