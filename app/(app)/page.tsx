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
  DoorOpen,
  Gauge,
  Plus,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserPlus,
  UserCheck,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { formatCurrency } from "@/lib/demo-data";
import { getCurrentGym, getDashboardData, getTodayCheckins } from "@/lib/supabase/queries";

function formatTime(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function plural(count: number, singular: string, pluralValue = `${singular}s`) {
  return `${count} ${count > 1 ? pluralValue : singular}`;
}

type HomeProps = {
  searchParams: Promise<{ welcome?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const [gym, sp] = await Promise.all([getCurrentGym(), searchParams]);
  const isWelcome = sp.welcome === "1";

  // ── Vue opérateur ─────────────────────────────────────────────────────────
  if (gym?.role === "operator") {
    const checkins = await getTodayCheckins(gym.id);
    const memberCheckins = checkins.filter((e) => e.member_id);
    const walkInCheckins = checkins.filter((e) => !e.member_id);

    return (
      <AppShell>
        <div className="min-h-screen bg-[#080808] text-white">
          {/* Header */}
          <div className="border-b border-white/8 px-6 py-5 md:px-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/40">
                  {new Intl.DateTimeFormat("fr-FR", { dateStyle: "full" }).format(new Date())}
                </p>
                <h1 className="mt-1 text-2xl font-semibold">Espace employé</h1>
              </div>
              <Link
                href="/checkin"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-500 px-4 text-sm font-semibold text-white transition hover:bg-emerald-400"
              >
                <UserCheck size={16} />
                Pointage
              </Link>
            </div>
          </div>

          <div className="px-6 py-6 md:px-8">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Entrées", value: checkins.length },
                { label: "Abonnés", value: memberCheckins.length },
                { label: "Séances", value: walkInCheckins.length },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-white/8 bg-white/4 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/40">{s.label}</p>
                  <p className="mt-3 text-3xl font-semibold">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Link
                href="/checkin"
                className="group flex items-center justify-between rounded-2xl border border-white/8 bg-white/4 p-5 transition hover:border-emerald-500/30 hover:bg-white/6"
              >
                <div className="flex items-center gap-4">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500 text-white">
                    <DoorOpen size={20} />
                  </div>
                  <div>
                    <p className="font-semibold">Encaisser une séance</p>
                    <p className="mt-0.5 text-xs text-white/40">Prix libre, paiement direct</p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-white/25 transition group-hover:text-emerald-400" />
              </Link>
              <Link
                href="/checkin"
                className="group flex items-center justify-between rounded-2xl border border-white/8 bg-white/4 p-5 transition hover:border-emerald-500/30 hover:bg-white/6"
              >
                <div className="flex items-center gap-4">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-white/10 text-white">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <p className="font-semibold">Pointer un membre</p>
                    <p className="mt-0.5 text-xs text-white/40">Recherche par nom ou numéro</p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-white/25 transition group-hover:text-emerald-400" />
              </Link>
            </div>

            {/* Journal */}
            <div className="mt-6 overflow-hidden rounded-2xl border border-white/8 bg-white/4">
              <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
                <div>
                  <h2 className="font-semibold">Journal du jour</h2>
                  <p className="mt-0.5 text-xs text-white/40">Dernières entrées</p>
                </div>
                <Clock3 size={18} className="text-emerald-400" />
              </div>
              <div className="divide-y divide-white/6">
                {checkins.length > 0 ? (
                  checkins.slice(0, 10).map((entry) => (
                    <div key={entry.id} className="flex items-center gap-4 px-6 py-3.5">
                      <span className="shrink-0 rounded-lg bg-white/8 px-2.5 py-1 text-xs font-semibold tabular-nums text-white/60">
                        {formatTime(entry.checked_in_at)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{entry.member_name}</p>
                        <p className="truncate text-xs text-white/40">{entry.plan ?? "Abonnement"}</p>
                      </div>
                      <span className="shrink-0 text-xs font-semibold text-emerald-400">Validé</span>
                    </div>
                  ))
                ) : (
                  <p className="px-6 py-5 text-sm text-white/35">Aucune entrée aujourd&apos;hui.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  // ── Vue admin ─────────────────────────────────────────────────────────────
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
  const maxRevenue = Math.max(...dashboard.revenue7Days.map((d) => d.amount), 1);
  const weekRevenue = dashboard.revenue7Days.reduce((s, d) => s + d.amount, 0);
  const bestDay = dashboard.revenue7Days.reduce(
    (best, d) => (d.amount > best.amount ? d : best),
    { date: "", label: "-", amount: 0 },
  );
  const uniqueCheckinsToday = new Set(
    dashboard.checkinsToday.map((e) => e.member_id).filter(Boolean),
  ).size;
  const activeRate =
    dashboard.totalMembers > 0
      ? Math.round((dashboard.activeMembers / dashboard.totalMembers) * 100)
      : 0;
  const averageTicket =
    dashboard.paymentsToday > 0 ? dashboard.revenueToday / dashboard.paymentsToday : 0;
  const urgentAlerts = dashboard.alerts.filter((a) => a.status === "expired").length;
  const warningAlerts = dashboard.alerts.length - urgentAlerts;
  const topPlanMax = Math.max(...dashboard.topPlans.map((p) => p.amount), 1);
  const latestCheckin = dashboard.checkinsToday[0] ?? null;
  const topPlan = dashboard.topPlans[0] ?? null;

  const stats = [
    {
      label: "Revenus du jour",
      value: formatCurrency(dashboard.revenueToday),
      detail: `${plural(dashboard.paymentsToday, "paiement")} · moy. ${formatCurrency(averageTicket)}`,
      icon: Banknote,
      accent: "text-emerald-400",
      bg: "bg-emerald-500/15",
    },
    {
      label: "Entrées aujourd'hui",
      value: String(dashboard.checkinsToday.length),
      detail: `${uniqueCheckinsToday} membre${uniqueCheckinsToday > 1 ? "s" : ""} unique${uniqueCheckinsToday > 1 ? "s" : ""}`,
      icon: Activity,
      accent: "text-blue-400",
      bg: "bg-blue-500/15",
    },
    {
      label: "Membres actifs",
      value: String(dashboard.activeMembers),
      detail: `${activeRate}% du portefeuille actif`,
      icon: Users,
      accent: "text-violet-400",
      bg: "bg-violet-500/15",
    },
    {
      label: "Priorités",
      value: String(dashboard.alerts.length),
      detail: `${urgentAlerts} urgent${urgentAlerts !== 1 ? "s" : ""} · ${warningAlerts} à surveiller`,
      icon: AlertTriangle,
      accent: dashboard.alerts.length > 0 ? "text-amber-400" : "text-white/40",
      bg: dashboard.alerts.length > 0 ? "bg-amber-500/15" : "bg-white/8",
    },
  ];

  const quickActions = [
    { label: "Nouveau membre", href: "/members/new", icon: UserPlus, primary: true },
    { label: "Pointage", href: "/checkin", icon: CheckCircle2, primary: false },
    { label: "Caisse", href: "/payments", icon: ReceiptText, primary: false },
    { label: "Abonnements", href: "/subscriptions", icon: CreditCard, primary: false },
  ];

  return (
    <AppShell>
      <div className="min-h-screen bg-[#080808] text-white">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="border-b border-white/8 px-6 py-5 md:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/40">
                {todayLabel}
              </p>
              <h1 className="mt-1 text-2xl font-semibold">
                {gym?.name ?? "Tableau de bord"}
              </h1>
            </div>
            <Link
              href="/members/new"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-500 px-4 text-sm font-semibold text-white transition hover:bg-emerald-400"
            >
              <Plus size={16} />
              Ajouter membre
            </Link>
          </div>
        </div>

        <div className="px-6 py-6 md:px-8">

          {/* ── Bandeau bienvenue ───────────────────────────────────── */}
          {isWelcome && (
            <div className="mb-6 overflow-hidden rounded-2xl border border-emerald-500/25 bg-emerald-500/8">
              <div className="relative px-6 py-5">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />
                <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-emerald-400">
                  <Sparkles size={12} />
                  Bienvenue sur GymFlow
                </p>
                <p className="mt-1.5 text-sm font-semibold text-white/80">
                  Votre espace est prêt. Voici les 3 premières étapes.
                </p>
              </div>
              <div className="grid gap-px bg-white/5 sm:grid-cols-3">
                {[
                  { step: "1", label: "Créer une formule", href: "/subscriptions/new", accent: "bg-emerald-500" },
                  { step: "2", label: "Ajouter un membre", href: "/members/new", accent: "bg-white/20" },
                  { step: "3", label: "Compléter les paramètres", href: "/settings", accent: "bg-white/10" },
                ].map((item) => (
                  <Link
                    key={item.step}
                    href={item.href}
                    className="group flex items-center gap-3 bg-[#080808] px-5 py-3.5 transition hover:bg-white/4"
                  >
                    <span className={`flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white ${item.accent}`}>
                      {item.step}
                    </span>
                    <span className="text-sm font-semibold text-white/70 group-hover:text-white">{item.label}</span>
                    <ArrowRight size={14} className="ml-auto text-white/20 transition group-hover:text-emerald-400" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ── Hero cockpit ───────────────────────────────────────── */}
          <div className="rounded-2xl border border-white/8 bg-white/4 p-6">
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-white/40">
                  <ShieldCheck size={12} />
                  Pilotage en direct
                </div>
                <p className="mt-3 text-xl font-semibold">
                  {gym?.name ? `${gym.name} tourne aujourd'hui` : "Votre salle tourne aujourd'hui"}
                </p>
                <p className="mt-1 text-sm text-white/40">
                  Ventes, entrées et renouvellements au même endroit.
                </p>
              </div>
              <div className="hidden shrink-0 items-center gap-8 sm:flex">
                <div className="text-right">
                  <p className="text-xs text-white/35">7 jours</p>
                  <p className="mt-1 text-lg font-semibold">{formatCurrency(weekRevenue)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/35">Meilleur jour</p>
                  <p className="mt-1 text-lg font-semibold capitalize">{bestDay.label}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/35">Actifs</p>
                  <p className="mt-1 text-lg font-semibold">{activeRate}%</p>
                </div>
              </div>
            </div>

            {/* Signaux rapides */}
            <div className="mt-5 grid gap-3 border-t border-white/6 pt-5 sm:grid-cols-3">
              {[
                {
                  label: "Flux comptoir",
                  value: `${dashboard.checkinsToday.length} entrée${dashboard.checkinsToday.length !== 1 ? "s" : ""}`,
                  detail: latestCheckin ? `Dernier à ${formatTime(latestCheckin.checked_in_at)}` : "Aucune entrée validée",
                  icon: DoorOpen,
                },
                {
                  label: "Priorité du jour",
                  value: dashboard.alerts.length > 0 ? `${dashboard.alerts.length} à traiter` : "Salle stable",
                  detail: urgentAlerts > 0 ? `${urgentAlerts} renouvellement${urgentAlerts !== 1 ? "s" : ""} urgent${urgentAlerts !== 1 ? "s" : ""}` : "Aucune urgence",
                  icon: AlertTriangle,
                },
                {
                  label: "Formule forte",
                  value: topPlan?.name ?? "Aucune vente",
                  detail: topPlan ? `${formatCurrency(topPlan.amount)} sur 7 jours` : "Les ventes apparaîtront ici",
                  icon: TrendingUp,
                },
              ].map((signal) => (
                <div key={signal.label} className="flex items-start gap-3 rounded-xl border border-white/6 bg-white/3 px-4 py-3.5">
                  <signal.icon size={16} className="mt-0.5 shrink-0 text-white/30" />
                  <div className="min-w-0">
                    <p className="text-xs text-white/40">{signal.label}</p>
                    <p className="mt-1 text-sm font-semibold truncate">{signal.value}</p>
                    <p className="mt-0.5 text-xs text-white/30 truncate">{signal.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── KPI cards ──────────────────────────────────────────── */}
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/8 bg-white/4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/40">
                      {stat.label}
                    </p>
                    <p className="mt-3 text-2xl font-semibold">{stat.value}</p>
                    <p className="mt-1 text-xs text-white/35 leading-5">{stat.detail}</p>
                  </div>
                  <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${stat.bg} ${stat.accent}`}>
                    <stat.icon size={18} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Actions rapides ─────────────────────────────────────── */}
          <div className="mt-4 grid gap-2 sm:grid-cols-4">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={`inline-flex h-11 items-center justify-between gap-2 rounded-xl px-4 text-sm font-semibold transition ${
                  action.primary
                    ? "bg-emerald-500 text-white hover:bg-emerald-400"
                    : "border border-white/8 bg-white/4 text-white/70 hover:bg-white/8 hover:text-white"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <action.icon size={16} className="shrink-0" />
                  <span className="truncate">{action.label}</span>
                </span>
                <ArrowRight size={14} className="shrink-0 opacity-50" />
              </Link>
            ))}
          </div>

          {/* ── Graphes ─────────────────────────────────────────────── */}
          <div className="mt-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            {/* Revenus 7 jours */}
            <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/4">
              <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
                <div>
                  <h2 className="font-semibold">Revenus 7 jours</h2>
                  <p className="mt-0.5 text-xs text-white/40">
                    {formatCurrency(weekRevenue)} encaissés · pic {formatCurrency(bestDay.amount)}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-400">
                  <TrendingUp size={13} />
                  Suivi
                </div>
              </div>
              <div className="p-6">
                <div className="flex h-44 items-end gap-2">
                  {dashboard.revenue7Days.map((day) => (
                    <div key={day.date} className="flex h-full min-w-0 flex-1 flex-col justify-end gap-2">
                      <div className="flex flex-1 items-end">
                        <div
                          className="w-full rounded-t-lg bg-emerald-500/70 transition hover:bg-emerald-400"
                          style={{
                            height: `${Math.max((day.amount / maxRevenue) * 100, day.amount > 0 ? 8 : 2)}%`,
                          }}
                          title={formatCurrency(day.amount)}
                        />
                      </div>
                      <div className="text-center">
                        <p className="truncate text-xs font-semibold capitalize text-white/50">{day.label}</p>
                        <p className="mt-0.5 truncate text-[10px] text-white/30">{formatCurrency(day.amount)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mix formules */}
            <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/4">
              <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
                <div>
                  <h2 className="font-semibold">Mix des formules</h2>
                  <p className="mt-0.5 text-xs text-white/40">Ce qui génère le revenu.</p>
                </div>
                <Gauge size={18} className="text-emerald-400" />
              </div>
              <div className="space-y-4 p-6">
                {dashboard.topPlans.length > 0 ? (
                  dashboard.topPlans.map((plan, i) => (
                    <div key={plan.name}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-white/8 text-xs font-bold text-white/60">
                            {i + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{plan.name}</p>
                            <p className="text-xs text-white/35">{plural(plan.count, "paiement")}</p>
                          </div>
                        </div>
                        <p className="shrink-0 text-sm font-semibold text-emerald-400">
                          {formatCurrency(plan.amount)}
                        </p>
                      </div>
                      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/8">
                        <div
                          className="h-full rounded-full bg-emerald-500/60"
                          style={{ width: `${Math.max((plan.amount / topPlanMax) * 100, 6)}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-white/35">Aucune vente sur 7 jours.</p>
                )}
              </div>
            </div>
          </div>

          {/* ── Priorités + Pointage ─────────────────────────────── */}
          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            {/* Priorités */}
            <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/4">
              <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
                <div>
                  <h2 className="font-semibold">Priorités clients</h2>
                  <p className="mt-0.5 text-xs text-white/40">Renouvellements et séances faibles.</p>
                </div>
                <CalendarClock size={18} className="text-amber-400" />
              </div>
              <div className="divide-y divide-white/6">
                {dashboard.alerts.length > 0 ? (
                  dashboard.alerts.map((alert) => (
                    <Link
                      key={alert.member_id}
                      href={`/members/${alert.member_id}`}
                      className="flex items-center justify-between gap-3 px-6 py-3.5 transition hover:bg-white/4"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{alert.member_name}</p>
                        <p className="mt-0.5 truncate text-xs text-white/35">{alert.plan ?? "Sans formule"}</p>
                      </div>
                      <StatusBadge tone={alert.status}>{alert.status_label}</StatusBadge>
                    </Link>
                  ))
                ) : (
                  <p className="px-6 py-5 text-sm text-white/35">Aucune alerte pour le moment.</p>
                )}
              </div>
            </div>

            {/* Pointage temps réel */}
            <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/4">
              <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
                <div>
                  <h2 className="font-semibold">Pointage temps réel</h2>
                  <p className="mt-0.5 text-xs text-white/40">Dernières entrées validées.</p>
                </div>
                <Link
                  href="/checkin"
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-white/8 px-3 text-xs font-semibold text-white/70 transition hover:bg-white/12 hover:text-white"
                >
                  <CheckCircle2 size={13} />
                  Ouvrir
                </Link>
              </div>
              <div className="divide-y divide-white/6">
                {dashboard.checkinsToday.length > 0 ? (
                  dashboard.checkinsToday.slice(0, 6).map((entry) => (
                    <div key={entry.id} className="flex items-center gap-4 px-6 py-3.5">
                      <span className="shrink-0 rounded-lg bg-white/8 px-2.5 py-1 text-xs font-semibold tabular-nums text-white/50">
                        {formatTime(entry.checked_in_at)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{entry.member_name}</p>
                        <p className="truncate text-xs text-white/35">
                          {entry.plan ?? "Abonnement"}{entry.staff_name ? ` · ${entry.staff_name}` : ""}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs font-semibold text-emerald-400">Validé</span>
                    </div>
                  ))
                ) : (
                  <p className="px-6 py-5 text-sm text-white/35">Aucune entrée aujourd&apos;hui.</p>
                )}
              </div>
            </div>
          </div>

          {/* ── Dernières opérations ────────────────────────────── */}
          <div className="mt-4 overflow-hidden rounded-2xl border border-white/8 bg-white/4">
            <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
              <div>
                <h2 className="font-semibold">Dernières opérations</h2>
                <p className="mt-0.5 text-xs text-white/40">Encaissements récents.</p>
              </div>
              <Link
                href="/payments"
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-white/8 px-3 text-xs font-semibold text-white/70 transition hover:bg-white/12 hover:text-white"
              >
                <ReceiptText size={13} />
                Voir caisse
              </Link>
            </div>
            <div className="divide-y divide-white/6">
              {dashboard.recentPayments.length > 0 ? (
                dashboard.recentPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center gap-4 px-6 py-3.5">
                    <div className="min-w-0 flex-1">
                      {payment.member_id ? (
                        <Link
                          href={`/members/${payment.member_id}`}
                          className="truncate text-sm font-semibold transition hover:text-emerald-400"
                        >
                          {payment.member_name}
                        </Link>
                      ) : (
                        <p className="truncate text-sm font-semibold">{payment.member_name}</p>
                      )}
                      <p className="mt-0.5 truncate text-xs text-white/35">
                        {payment.plan ?? "Paiement manuel"}{payment.staff_name ? ` · ${payment.staff_name}` : ""}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-white/35 tabular-nums">
                      {formatTime(payment.paid_at)}
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-emerald-400">
                      {formatCurrency(payment.amount)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="px-6 py-5 text-sm text-white/35">Aucun paiement récent.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </AppShell>
  );
}
