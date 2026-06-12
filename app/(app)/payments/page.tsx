import Link from "next/link";
import { Banknote, CalendarDays, CreditCard, FileBarChart2, Plus, ReceiptText, Search, TrendingUp, WalletCards } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { formatCurrency } from "@/lib/demo-data";
import { requireAdminGym } from "@/lib/supabase/guards";
import { getPaymentsData, type PaymentMethod, type PaymentsPeriod } from "@/lib/supabase/queries";

const periodOptions = [
  { label: "Aujourd'hui", value: "today" },
  { label: "Semaine", value: "week" },
  { label: "Mois", value: "month" },
  { label: "Tout", value: "all" },
];

const methodOptions: { label: string; value: PaymentMethod | "all" }[] = [
  { label: "Tous", value: "all" },
  { label: "Espèces", value: "cash" },
  { label: "Wave", value: "wave" },
  { label: "Orange Money", value: "orange_money" },
  { label: "Carte", value: "card" },
  { label: "Autre", value: "other" },
];

const methodLabels: Record<PaymentMethod, string> = {
  cash: "Espèces",
  wave: "Wave",
  orange_money: "Orange Money",
  card: "Carte",
  other: "Autre",
};

const methodAccentBar: Record<PaymentMethod, string> = {
  cash: "bg-white/40",
  wave: "bg-sky-400",
  orange_money: "bg-orange-400",
  card: "bg-violet-400",
  other: "bg-white/20",
};

function formatDateTime(v: string) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(v));
}

const PAGE_SIZE = 50;

type PaymentsPageProps = {
  searchParams: Promise<{ period?: string; method?: string; q?: string; page?: string }>;
};

function getPeriod(v?: string): PaymentsPeriod {
  return periodOptions.some((o) => o.value === v) ? (v as PaymentsPeriod) : "today";
}
function getMethod(v?: string): PaymentMethod | "all" {
  return methodOptions.some((o) => o.value === v) ? (v as PaymentMethod | "all") : "all";
}

export default async function PaymentsPage({ searchParams }: PaymentsPageProps) {
  const params = await searchParams;
  const period = getPeriod(params.period);
  const method = getMethod(params.method);
  const query = params.q ?? "";
  const currentPage = Math.max(1, parseInt(params.page ?? "1", 10));
  const gym = await requireAdminGym();
  const paymentsData = await getPaymentsData(gym.id, { period, method, query });

  const totalPayments = paymentsData.payments.length;
  const totalPages = Math.max(1, Math.ceil(totalPayments / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedPayments = paymentsData.payments.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function pageHref(p: number) {
    const qs = new URLSearchParams({ period, method });
    if (query) qs.set("q", query);
    if (p > 1) qs.set("page", String(p));
    return `/payments?${qs.toString()}`;
  }

  const averagePayment = paymentsData.count > 0 ? paymentsData.total / paymentsData.count : 0;
  const manualPayments = paymentsData.payments.filter((p) => p.kind === "manual_adjustment");
  const subscriptionPayments = paymentsData.payments.filter((p) => p.kind === "subscription");
  const manualTotal = manualPayments.reduce((s, p) => s + p.amount, 0);
  const subscriptionTotal = subscriptionPayments.reduce((s, p) => s + p.amount, 0);
  const bestMethod = methodOptions
    .filter((o): o is { label: string; value: PaymentMethod } => o.value !== "all")
    .map((o) => ({ label: o.label, amount: paymentsData.methodTotals[o.value] }))
    .sort((a, b) => b.amount - a.amount)[0];
  const methodBreakdown = methodOptions
    .filter((o): o is { label: string; value: PaymentMethod } => o.value !== "all")
    .map((o) => ({
      label: o.label, value: o.value,
      amount: paymentsData.methodTotals[o.value],
      share: paymentsData.total > 0 ? (paymentsData.methodTotals[o.value] / paymentsData.total) * 100 : 0,
    }));
  const exportHref = `/payments/export?period=${period}&method=${method}${query ? `&q=${encodeURIComponent(query)}` : ""}`;

  return (
    <AppShell>
      <PageHeader
        title="Caisse"
        eyebrow="Paiements et encaissements"
        actions={
          <>
            <Link
              href="/payments/report"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white/60 transition hover:bg-white/8 hover:text-white"
            >
              <FileBarChart2 size={16} />
              Rapport
            </Link>
            <Link
              href={exportHref}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white/60 transition hover:bg-white/8 hover:text-white"
            >
              Export CSV
            </Link>
            <Link
              href="/payments/new"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-500 px-4 text-sm font-semibold text-white transition hover:bg-emerald-400"
            >
              <Plus size={16} />
              Encaisser
            </Link>
          </>
        }
      />

      <div className="px-6 py-6 md:px-8">

        {/* KPIs */}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Total filtré", value: formatCurrency(paymentsData.total), detail: `${paymentsData.count} paiement${paymentsData.count !== 1 ? "s" : ""}`, icon: Banknote, accent: "text-emerald-400", bg: "bg-emerald-500/15" },
            { label: "Aujourd'hui", value: formatCurrency(paymentsData.todayTotal), detail: "encaissement du jour", icon: CalendarDays, accent: "text-blue-400", bg: "bg-blue-500/15" },
            { label: "Mobile money", value: formatCurrency(paymentsData.methodTotals.wave + paymentsData.methodTotals.orange_money), detail: "Wave + Orange Money", icon: WalletCards, accent: "text-sky-400", bg: "bg-sky-500/15" },
            { label: "Espèces", value: formatCurrency(paymentsData.methodTotals.cash), detail: "paiements cash", icon: CreditCard, accent: "text-white/60", bg: "bg-white/8" },
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

        {/* Synthèse + Répartition */}
        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          {/* Synthèse */}
          <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/4">
            <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
              <div>
                <h2 className="font-semibold">Synthèse caisse</h2>
                <p className="mt-0.5 text-xs text-white/40">Lecture rapide du filtre actif.</p>
              </div>
              <TrendingUp size={18} className="text-emerald-400" />
            </div>
            <div className="grid grid-cols-3 divide-x divide-white/6 border-b border-white/8">
              {[
                { label: "Panier moyen", value: formatCurrency(averagePayment) },
                { label: "Meilleur moyen", value: bestMethod?.amount ? bestMethod.label : "—" },
                { label: "Ajustements", value: formatCurrency(manualTotal) },
              ].map((s) => (
                <div key={s.label} className="px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-white/35">{s.label}</p>
                  <p className="mt-1.5 text-sm font-semibold">{s.value}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 divide-x divide-white/6 p-0">
              {[
                { label: "Abonnements", value: formatCurrency(subscriptionTotal), count: subscriptionPayments.length, icon: ReceiptText },
                { label: "Paiements manuels", value: formatCurrency(manualTotal), count: manualPayments.length, icon: Banknote },
              ].map((s) => (
                <div key={s.label} className="px-5 py-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-white/50">
                    <s.icon size={13} />
                    {s.label}
                  </div>
                  <p className="mt-2 text-lg font-semibold text-emerald-400">{s.value}</p>
                  <p className="mt-0.5 text-xs text-white/30">{s.count} encaissement{s.count !== 1 ? "s" : ""}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Répartition moyens */}
          <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/4">
            <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
              <div>
                <h2 className="font-semibold">Répartition moyens</h2>
                <p className="mt-0.5 text-xs text-white/40">Part de chaque moyen sur le filtre actif.</p>
              </div>
              <WalletCards size={18} className="text-emerald-400" />
            </div>
            <div className="space-y-4 px-6 py-5">
              {methodBreakdown.map((item) => (
                <div key={item.value}>
                  <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                    <span className="font-semibold text-white/70">{item.label}</span>
                    <span className="text-white/50">{formatCurrency(item.amount)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/8">
                    <div
                      className={`h-full rounded-full ${methodAccentBar[item.value]}`}
                      style={{ width: `${Math.max(item.share, item.amount > 0 ? 3 : 0)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-white/30">{item.share.toFixed(1)}%</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Journal */}
        <div className="mt-4 overflow-hidden rounded-2xl border border-white/8 bg-white/4">
          <div className="border-b border-white/8 px-6 py-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h2 className="font-semibold">Journal des paiements</h2>
                <p className="mt-0.5 text-xs text-white/40">Abonnements créés et renouvellements encaissés.</p>
              </div>
              <form className="flex gap-2" action="/payments">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" size={14} />
                  <input
                    className="h-9 w-64 rounded-xl border border-white/10 bg-white/6 pl-9 pr-3 text-sm text-white placeholder-white/25 outline-none transition focus:border-emerald-500/60 focus:bg-white/8"
                    name="q"
                    placeholder="Membre, formule ou moyen…"
                    defaultValue={query}
                  />
                </div>
                <button className="h-9 rounded-xl bg-white/8 px-3 text-xs font-semibold text-white/60 transition hover:bg-white/12 hover:text-white">
                  Filtrer
                </button>
                <input type="hidden" name="period" value={period} />
                <input type="hidden" name="method" value={method} />
              </form>
            </div>

            {/* Filtres période */}
            <div className="mt-4 flex flex-wrap gap-2">
              {periodOptions.map((o) => (
                <Link
                  key={o.value}
                  href={`/payments?period=${o.value}&method=${method}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                  className={`inline-flex h-8 items-center rounded-xl px-3 text-xs font-semibold transition ${
                    period === o.value ? "bg-emerald-500 text-white" : "border border-white/8 bg-white/4 text-white/50 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  {o.label}
                </Link>
              ))}
            </div>

            {/* Filtres méthode */}
            <div className="mt-2 flex flex-wrap gap-2">
              {methodOptions.map((o) => {
                const amount = o.value === "all" ? paymentsData.total : paymentsData.methodTotals[o.value];
                return (
                  <Link
                    key={o.value}
                    href={`/payments?period=${period}&method=${o.value}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                    className={`inline-flex h-8 items-center gap-2 rounded-xl px-3 text-xs font-semibold transition ${
                      method === o.value ? "bg-white/15 text-white" : "border border-white/8 bg-white/4 text-white/50 hover:bg-white/8 hover:text-white"
                    }`}
                  >
                    {o.label}
                    <span className="text-[10px] text-white/30">{formatCurrency(amount)}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Tableau */}
          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              <div className="grid grid-cols-[1fr_1.2fr_1fr_0.8fr_0.8fr_0.7fr_0.8fr_0.6fr] border-b border-white/8 bg-white/3 px-5 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-white/35">
                <span>Date</span>
                <span>Membre</span>
                <span>Formule</span>
                <span>Moyen</span>
                <span>Employé</span>
                <span>Type</span>
                <span className="text-right">Montant</span>
                <span className="text-right">Reçu</span>
              </div>
              {paginatedPayments.length > 0 ? (
                paginatedPayments.map((p) => (
                  <div key={p.id} className="grid grid-cols-[1fr_1.2fr_1fr_0.8fr_0.8fr_0.7fr_0.8fr_0.6fr] items-center border-b border-white/6 px-5 py-3.5 text-sm transition last:border-b-0 hover:bg-white/4">
                    <span className="text-xs text-white/40">{formatDateTime(p.paid_at)}</span>
                    <span className="min-w-0 font-semibold">
                      {p.member_id ? (
                        <Link href={`/members/${p.member_id}`} className="block truncate transition hover:text-emerald-400">
                          {p.member_name}
                        </Link>
                      ) : (
                        <span className="block truncate">{p.member_name}</span>
                      )}
                    </span>
                    <span className="truncate text-white/60">{p.plan ?? p.notes ?? "—"}</span>
                    <span className="text-white/60">{methodLabels[p.method]}</span>
                    <span className="text-white/45">{p.staff_name ?? "—"}</span>
                    <span>
                      <StatusBadge tone="neutral">
                        {p.kind === "subscription" ? "Abo" : "Manuel"}
                      </StatusBadge>
                    </span>
                    <span className="text-right font-semibold text-emerald-400">{formatCurrency(p.amount)}</span>
                    <span className="text-right">
                      <Link
                        href={`/payments/${p.id}/receipt`}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 text-xs font-semibold text-white/50 transition hover:bg-white/8 hover:text-white"
                      >
                        <ReceiptText size={13} />
                        Reçu
                      </Link>
                    </span>
                  </div>
                ))
              ) : (
                <div className="px-6 py-10 text-center">
                  <p className="font-semibold text-white/60">Aucun paiement trouvé</p>
                  <p className="mt-1 text-sm text-white/30">Essaie une autre période ou renouvelle un abonnement.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between gap-4 text-sm">
            <p className="text-white/35">
              {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, totalPayments)} sur {totalPayments}
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
