import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  Banknote,
  BarChart3,
  Calendar,
  CheckCircle2,
  CreditCard,
  Mail,
  MapPin,
  Phone,
  ReceiptText,
  ShieldCheck,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { BrandMark } from "@/components/brand-mark";
import { PageHeader } from "@/components/page-header";
import { PrintButton } from "@/components/print-button";
import { SubmitButton } from "@/components/submit-button";
import { formatCurrency } from "@/lib/demo-data";
import { requireAdminGym } from "@/lib/supabase/guards";
import { getMonthlyReportData, type PaymentMethod } from "@/lib/supabase/queries";
import { emailMonthlyReport } from "./actions";

type ReportPageProps = {
  searchParams: Promise<{ month?: string }>;
};

const methodLabels: Record<PaymentMethod, string> = {
  cash: "Espèces",
  wave: "Wave",
  orange_money: "Orange Money",
  card: "Carte",
  other: "Autre",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

// Génère les options des 12 derniers mois
function getMonthOptions() {
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" })
      .format(d)
      .replace(/^./, (c) => c.toUpperCase());
    options.push({ value, label });
  }
  return options;
}

export default async function MonthlyReportPage({ searchParams }: ReportPageProps) {
  const gym = await requireAdminGym();
  const sp = await searchParams;

  // Mois par défaut = mois en cours
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const month = sp.month ?? defaultMonth;

  const report = await getMonthlyReportData(gym.id, month);
  if (!report) notFound();

  const monthOptions = getMonthOptions();
  const maxDayRevenue = Math.max(...report.byDay.map((d) => d.revenue), 1);
  const maxDayCheckins = Math.max(...report.byDay.map((d) => d.checkins), 1);
  const topPlan = report.byPlan[0] ?? null;
  const methodEntries = (Object.entries(report.methodTotals) as [PaymentMethod, number][])
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a);
  const bestDay = report.byDay.reduce(
    (best, d) => (d.revenue > best.revenue ? d : best),
    { date: "", label: "-", revenue: 0, checkins: 0, payments: 0 },
  );

  return (
    <AppShell>
      <PageHeader
        title="Rapport mensuel"
        eyebrow={report.monthLabel}
        actions={
          <div className="flex items-center gap-3 print:hidden">
            <Link
              href="/payments"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-semibold shadow-sm transition hover:bg-neutral-50"
            >
              <ArrowLeft size={18} />
              Caisse
            </Link>
            <form action={emailMonthlyReport}>
              <input type="hidden" name="month" value={month} />
              <SubmitButton variant="secondary" className="h-11" pendingLabel="Envoi…">
                <Mail size={17} />
                Envoyer par email
              </SubmitButton>
            </form>
            <PrintButton />
          </div>
        }
      />

      <div className="px-4 py-6 md:px-8 print:p-0">
        {/* Sélecteur de mois */}
        <form method="get" action="/payments/report" className="mb-6 flex items-center gap-3 print:hidden">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={17} />
            <select
              name="month"
              defaultValue={month}
              onChange={(e) => {
                // handled by form submit
                void e;
              }}
              className="h-11 rounded-md border border-line bg-white pl-9 pr-3 text-sm font-semibold outline-none focus:border-mint"
            >
              {monthOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="inline-flex h-11 items-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            Afficher
          </button>
        </form>

        {/* ===== RAPPORT IMPRIMABLE ===== */}
        <article className="mx-auto max-w-5xl space-y-6 print:max-w-none print:space-y-5">

          {/* En-tête rapport */}
          <header className="overflow-hidden rounded-xl border border-neutral-900 bg-ink text-white print:rounded-none print:border-0 print:border-b print:border-line print:bg-white print:text-ink">
            <div className="p-6">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-4">
                  <BrandMark inverse className="size-12 print:hidden" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/45 print:text-neutral-500">
                      Rapport mensuel
                    </p>
                    <h2 className="mt-1.5 text-2xl font-semibold">{report.gym.name}</h2>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/55 print:text-neutral-500">
                      {report.gym.phone && (
                        <span className="inline-flex items-center gap-1.5">
                          <Phone size={13} />{report.gym.phone}
                        </span>
                      )}
                      {report.gym.address && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin size={13} />{report.gym.address}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border border-white/15 bg-white/10 p-4 print:border-line print:bg-paper sm:text-right">
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/45 print:text-neutral-500">
                    Période
                  </p>
                  <p className="mt-1.5 text-xl font-semibold">{report.monthLabel}</p>
                  <p className="mt-1 text-sm text-white/55 print:text-neutral-500">
                    <ShieldCheck className="mr-1 inline" size={13} />
                    Généré par GymFlow
                  </p>
                </div>
              </div>

              {/* KPIs header */}
              <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-5 sm:grid-cols-4 print:border-line print:text-ink">
                {[
                  { label: "Revenus totaux", value: formatCurrency(report.totalRevenue), icon: Banknote },
                  { label: "Entrées", value: String(report.totalCheckins), icon: Activity },
                  { label: "Paiements", value: String(report.totalPayments), icon: ReceiptText },
                  { label: "Nouveaux membres", value: String(report.newMembers), icon: UserPlus },
                ].map((kpi) => (
                  <div key={kpi.label} className="border-l border-white/12 pl-4 first:border-l-0 print:border-line">
                    <p className="text-xs font-medium uppercase tracking-[0.07em] text-white/45 print:text-neutral-500">
                      {kpi.label}
                    </p>
                    <p className="mt-2 text-lg font-semibold">{kpi.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </header>

          {/* Grille stats + formules */}
          <div className="grid gap-5 lg:grid-cols-[1fr_360px]">

            {/* Graphe revenus journaliers */}
            <section className="rounded-xl border border-line bg-white shadow-soft print:rounded-none print:border-0 print:border-b print:border-line print:shadow-none">
              <div className="flex items-center justify-between border-b border-line p-5">
                <div>
                  <h3 className="font-semibold">Revenus par jour</h3>
                  <p className="mt-0.5 text-sm text-neutral-500">
                    Total {formatCurrency(report.totalRevenue)} · pic {formatCurrency(bestDay.revenue)} ({bestDay.label})
                  </p>
                </div>
                <TrendingUp className="text-mint" size={20} />
              </div>
              <div className="p-5">
                <div className="flex h-48 items-end gap-1 overflow-x-auto">
                  {report.byDay.map((day) => (
                    <div key={day.date} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t-sm bg-mint transition"
                        style={{ height: `${Math.max((day.revenue / maxDayRevenue) * 100, day.revenue > 0 ? 6 : 1)}%` }}
                        title={`${day.label} — ${formatCurrency(day.revenue)}`}
                      />
                      {report.byDay.length <= 31 && (
                        <p className="truncate text-[9px] font-semibold text-neutral-400">{day.label.split(" ")[0]}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Formules + méthodes */}
            <div className="space-y-5">
              <section className="rounded-xl border border-line bg-white shadow-soft print:rounded-none print:border-0 print:shadow-none">
                <div className="flex items-center justify-between border-b border-line p-4">
                  <h3 className="font-semibold">Mix des formules</h3>
                  <BarChart3 className="text-mint" size={18} />
                </div>
                <div className="space-y-3 p-4">
                  {report.byPlan.length > 0 ? report.byPlan.map((plan) => (
                    <div key={plan.name}>
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="truncate font-semibold">{plan.name}</span>
                        <span className="shrink-0 text-right">
                          <span className="font-semibold">{formatCurrency(plan.revenue)}</span>
                          <span className="ml-2 text-xs text-neutral-500">×{plan.count}</span>
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-paper">
                        <div
                          className="h-full rounded-full bg-ink"
                          style={{ width: `${Math.max((plan.revenue / (topPlan?.revenue ?? 1)) * 100, 4)}%` }}
                        />
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm text-neutral-500">Aucune vente ce mois.</p>
                  )}
                </div>
              </section>

              <section className="rounded-xl border border-line bg-white shadow-soft print:rounded-none print:border-0 print:shadow-none">
                <div className="flex items-center justify-between border-b border-line p-4">
                  <h3 className="font-semibold">Modes de paiement</h3>
                  <CreditCard className="text-mint" size={18} />
                </div>
                <div className="divide-y divide-line">
                  {methodEntries.length > 0 ? methodEntries.map(([method, amount]) => (
                    <div key={method} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                      <span className="font-semibold">{methodLabels[method]}</span>
                      <span className="font-semibold">{formatCurrency(amount)}</span>
                    </div>
                  )) : (
                    <p className="px-4 py-3 text-sm text-neutral-500">Aucun paiement.</p>
                  )}
                </div>
              </section>
            </div>
          </div>

          {/* Entrées par jour (tableau) */}
          <section className="rounded-xl border border-line bg-white shadow-soft print:rounded-none print:border-0 print:shadow-none">
            <div className="flex items-center justify-between border-b border-line p-5">
              <div>
                <h3 className="font-semibold">Activité journalière</h3>
                <p className="mt-0.5 text-sm text-neutral-500">Revenus et entrées par jour du mois.</p>
              </div>
              <Activity className="text-mint" size={20} />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line bg-neutral-50 print:bg-white">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.05em] text-neutral-500">Jour</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.05em] text-neutral-500">Revenus</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.05em] text-neutral-500">Paiements</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.05em] text-neutral-500">Entrées</th>
                    <th className="px-4 py-3 print:hidden">
                      <span className="sr-only">Barre</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {report.byDay.filter((d) => d.revenue > 0 || d.checkins > 0).map((day) => (
                    <tr key={day.date} className="hover:bg-neutral-50">
                      <td className="px-4 py-3 font-semibold capitalize">{day.label}</td>
                      <td className="px-4 py-3 text-right font-semibold text-mint">{formatCurrency(day.revenue)}</td>
                      <td className="px-4 py-3 text-right text-neutral-600">{day.payments}</td>
                      <td className="px-4 py-3 text-right text-neutral-600">{day.checkins}</td>
                      <td className="w-32 px-4 py-3 print:hidden">
                        <div className="h-2 overflow-hidden rounded-full bg-paper">
                          <div
                            className="h-full rounded-full bg-mint/60"
                            style={{ width: `${Math.max((day.checkins / maxDayCheckins) * 100, day.checkins > 0 ? 6 : 0)}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {report.byDay.every((d) => d.revenue === 0 && d.checkins === 0) && (
                    <tr>
                      <td colSpan={5} className="px-4 py-5 text-center text-sm text-neutral-500">
                        Aucune activité ce mois.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-line bg-neutral-50 print:bg-white">
                    <td className="px-4 py-3 font-semibold">Total</td>
                    <td className="px-4 py-3 text-right font-semibold text-mint">{formatCurrency(report.totalRevenue)}</td>
                    <td className="px-4 py-3 text-right font-semibold">{report.totalPayments}</td>
                    <td className="px-4 py-3 text-right font-semibold">{report.totalCheckins}</td>
                    <td className="print:hidden" />
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          {/* Contexte salle */}
          <section className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Membres actifs (salle)", value: String(report.activeMembers), icon: Users, detail: "tous abonnements confondus" },
              { label: "Nouveaux membres", value: String(report.newMembers), icon: UserPlus, detail: "inscrits ce mois" },
              { label: "Meilleur jour", value: formatCurrency(bestDay.revenue), icon: TrendingUp, detail: bestDay.label === "-" ? "Aucune vente" : `le ${bestDay.label}` },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-line bg-white p-5 shadow-soft print:rounded-none print:border-0 print:shadow-none">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.07em] text-neutral-500">{item.label}</p>
                    <p className="mt-3 text-xl font-semibold">{item.value}</p>
                    <p className="mt-1 text-xs text-neutral-500">{item.detail}</p>
                  </div>
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-paper text-ink">
                    <item.icon size={20} />
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* Journal des paiements */}
          <section className="rounded-xl border border-line bg-white shadow-soft print:rounded-none print:border-0 print:shadow-none">
            <div className="flex items-center justify-between border-b border-line p-5">
              <div>
                <h3 className="font-semibold">Détail des paiements</h3>
                <p className="mt-0.5 text-sm text-neutral-500">{report.totalPayments} transaction{report.totalPayments > 1 ? "s" : ""} ce mois.</p>
              </div>
              <CheckCircle2 className="text-mint" size={20} />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line bg-neutral-50 print:bg-white">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.05em] text-neutral-500">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.05em] text-neutral-500">Client</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.05em] text-neutral-500">Formule</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.05em] text-neutral-500">Mode</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.05em] text-neutral-500">Montant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {report.payments.length > 0 ? report.payments.map((p) => (
                    <tr key={p.id} className="hover:bg-neutral-50">
                      <td className="whitespace-nowrap px-4 py-3 text-neutral-600">
                        {formatDate(p.paid_at)}<span className="ml-2 text-neutral-400">{formatTime(p.paid_at)}</span>
                      </td>
                      <td className="px-4 py-3 font-semibold">{p.member_name}</td>
                      <td className="px-4 py-3 text-neutral-600">{p.plan ?? "Paiement manuel"}</td>
                      <td className="px-4 py-3 text-neutral-600">{methodLabels[p.method]}</td>
                      <td className="px-4 py-3 text-right font-semibold">{formatCurrency(p.amount)}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-5 text-center text-sm text-neutral-500">
                        Aucun paiement ce mois.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Pied de page */}
          <footer className="border-t border-line pt-4 text-center text-xs text-neutral-400 print:mt-8">
            <p>Rapport généré par <strong>GymFlow</strong> pour {report.gym.name} · {report.monthLabel}</p>
          </footer>

        </article>
      </div>
    </AppShell>
  );
}
