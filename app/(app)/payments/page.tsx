import Link from "next/link";
import { Banknote, CalendarDays, CreditCard, Download, Plus, ReceiptText, Search, ShieldCheck, TrendingUp, WalletCards } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { formatCurrency } from "@/lib/demo-data";
import { requireAdminGym } from "@/lib/supabase/guards";
import {
  getPaymentsData,
  type PaymentMethod,
  type PaymentsPeriod,
} from "@/lib/supabase/queries";

const periodOptions = [
  { label: "Aujourd'hui", value: "today" },
  { label: "Semaine", value: "week" },
  { label: "Mois", value: "month" },
  { label: "Tout", value: "all" },
];

const methodOptions: { label: string; value: PaymentMethod | "all" }[] = [
  { label: "Tous", value: "all" },
  { label: "Especes", value: "cash" },
  { label: "Wave", value: "wave" },
  { label: "Orange Money", value: "orange_money" },
  { label: "Carte", value: "card" },
  { label: "Autre", value: "other" },
];

const methodLabels: Record<PaymentMethod, string> = {
  cash: "Especes",
  wave: "Wave",
  orange_money: "Orange Money",
  card: "Carte",
  other: "Autre",
};

const methodAccent: Record<PaymentMethod, string> = {
  cash: "bg-ink",
  wave: "bg-sky-500",
  orange_money: "bg-orange-500",
  card: "bg-violet-500",
  other: "bg-neutral-400",
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

const PAGE_SIZE = 50;

type PaymentsPageProps = {
  searchParams: Promise<{
    period?: string;
    method?: string;
    q?: string;
    page?: string;
  }>;
};

function getPeriod(value?: string): PaymentsPeriod {
  return periodOptions.some((option) => option.value === value)
    ? (value as PaymentsPeriod)
    : "today";
}

function getMethod(value?: string): PaymentMethod | "all" {
  return methodOptions.some((option) => option.value === value)
    ? (value as PaymentMethod | "all")
    : "all";
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
    const qs = new URLSearchParams();
    qs.set("period", period);
    qs.set("method", method);
    if (query) qs.set("q", query);
    if (p > 1) qs.set("page", String(p));
    return `/payments?${qs.toString()}`;
  }

  const stats = [
    {
      label: "Total filtre",
      value: formatCurrency(paymentsData.total),
      detail: `${paymentsData.count} paiement${paymentsData.count > 1 ? "s" : ""}`,
      icon: Banknote,
    },
    {
      label: "Aujourd'hui",
      value: formatCurrency(paymentsData.todayTotal),
      detail: "encaissement du jour",
      icon: CalendarDays,
    },
    {
      label: "Mobile money",
      value: formatCurrency(paymentsData.methodTotals.wave + paymentsData.methodTotals.orange_money),
      detail: "Wave + Orange Money",
      icon: WalletCards,
    },
    {
      label: "Especes",
      value: formatCurrency(paymentsData.methodTotals.cash),
      detail: "paiements cash",
      icon: CreditCard,
    },
  ];
  const averagePayment = paymentsData.count > 0 ? paymentsData.total / paymentsData.count : 0;
  const manualPayments = paymentsData.payments.filter((payment) => payment.kind === "manual_adjustment");
  const subscriptionPayments = paymentsData.payments.filter((payment) => payment.kind === "subscription");
  const manualTotal = manualPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const subscriptionTotal = subscriptionPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const bestMethod = methodOptions
    .filter((option): option is { label: string; value: PaymentMethod } => option.value !== "all")
    .map((option) => ({
      label: option.label,
      value: option.value,
      amount: paymentsData.methodTotals[option.value],
    }))
    .sort((a, b) => b.amount - a.amount)[0];
  const methodBreakdown = methodOptions
    .filter((option): option is { label: string; value: PaymentMethod } => option.value !== "all")
    .map((option) => ({
      label: option.label,
      value: option.value,
      amount: paymentsData.methodTotals[option.value],
      share: paymentsData.total > 0 ? (paymentsData.methodTotals[option.value] / paymentsData.total) * 100 : 0,
    }));
  const exportHref = `/payments/export?period=${period}&method=${method}${query ? `&q=${encodeURIComponent(query)}` : ""}`;
  const periodCounts = periodOptions.map((option) => ({
    ...option,
    active: period === option.value,
  }));
  const methodCounts = methodOptions.map((option) => ({
    ...option,
    amount: option.value === "all" ? paymentsData.total : paymentsData.methodTotals[option.value],
    active: method === option.value,
  }));

  return (
    <AppShell>
      <PageHeader
        title="Caisse"
        eyebrow="Paiements et encaissements"
        actions={
          <>
            <Link href={exportHref} className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-semibold shadow-sm transition hover:bg-neutral-50">
              <Download size={18} />
              Export CSV
            </Link>
            <Link href="/payments/new" className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-mint px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700">
              <Plus size={18} />
              Encaisser
            </Link>
          </>
        }
      />

      <div className="px-4 py-6 md:px-8">

        <section className="rounded-md border border-neutral-900 bg-ink p-5 text-white shadow-soft md:p-6">
          <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr] xl:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-white/70">
                <ShieldCheck size={14} />
                Caisse gerant
              </div>
              <h2 className="mt-4 text-2xl font-semibold md:text-3xl">Controle clair des encaissements</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
                Totaux, moyens de paiement et recus restent au meme endroit pour cloturer la journee sans friction.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="border-l border-white/15 pl-4">
                <p className="text-xs font-medium uppercase tracking-[0.08em] text-white/45">Filtre actif</p>
                <p className="mt-2 text-xl font-semibold">{formatCurrency(paymentsData.total)}</p>
              </div>
              <div className="border-l border-white/15 pl-4">
                <p className="text-xs font-medium uppercase tracking-[0.08em] text-white/45">Aujourd&apos;hui</p>
                <p className="mt-2 text-xl font-semibold">{formatCurrency(paymentsData.todayTotal)}</p>
              </div>
              <div className="border-l border-white/15 pl-4">
                <p className="text-xs font-medium uppercase tracking-[0.08em] text-white/45">Paiements</p>
                <p className="mt-2 text-xl font-semibold">{paymentsData.count}</p>
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

        <section className="mt-6 grid gap-4 xl:grid-cols-[1fr_1.3fr]">
          <div className="rounded-md border border-line bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Synthese caisse</h2>
                <p className="mt-1 text-sm text-neutral-500">Lecture rapide du filtre actif.</p>
              </div>
              <TrendingUp className="text-mint" size={22} />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-md border border-line bg-paper p-4">
                <p className="text-xs font-semibold uppercase text-neutral-500">Panier moyen</p>
                <p className="mt-2 text-lg font-semibold">{formatCurrency(averagePayment)}</p>
              </div>
              <div className="rounded-md border border-line bg-paper p-4">
                <p className="text-xs font-semibold uppercase text-neutral-500">Meilleur moyen</p>
                <p className="mt-2 text-lg font-semibold">{bestMethod?.amount ? bestMethod.label : "-"}</p>
              </div>
              <div className="rounded-md border border-line bg-paper p-4">
                <p className="text-xs font-semibold uppercase text-neutral-500">Ajustements</p>
                <p className="mt-2 text-lg font-semibold">{formatCurrency(manualTotal)}</p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-line p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <ReceiptText size={17} />
                  Abonnements
                </div>
                <p className="mt-2 text-xl font-semibold">{formatCurrency(subscriptionTotal)}</p>
                <p className="mt-1 text-xs text-neutral-500">{subscriptionPayments.length} encaissement{subscriptionPayments.length > 1 ? "s" : ""}</p>
              </div>
              <div className="rounded-md border border-line p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Banknote size={17} />
                  Paiements manuels
                </div>
                <p className="mt-2 text-xl font-semibold">{formatCurrency(manualTotal)}</p>
                <p className="mt-1 text-xs text-neutral-500">{manualPayments.length} encaissement{manualPayments.length > 1 ? "s" : ""}</p>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-line bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Repartition moyens</h2>
                <p className="mt-1 text-sm text-neutral-500">Part de chaque moyen sur le filtre actif.</p>
              </div>
              <WalletCards className="text-mint" size={22} />
            </div>
            <div className="mt-5 space-y-4">
              {methodBreakdown.map((item) => (
                <div key={item.value}>
                  <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                    <span className="font-semibold">{item.label}</span>
                    <span className="text-neutral-600">{formatCurrency(item.amount)}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-md bg-paper">
                    <div
                      className={`h-full rounded-md ${methodAccent[item.value]}`}
                      style={{ width: `${Math.max(item.share, item.amount > 0 ? 3 : 0)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">{item.share.toFixed(1)}%</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-md border border-line bg-white shadow-soft">
          <div className="border-b border-line p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Journal des paiements</h2>
                <p className="mt-1 text-sm text-neutral-500">Abonnements crees et renouvellements encaisses.</p>
              </div>
              <form className="grid gap-3 sm:grid-cols-[1fr_auto]" action="/payments">
                <div className="relative min-w-0 sm:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                  <input
                    className="h-11 w-full rounded-md border border-line bg-paper pl-10 pr-3 text-sm outline-none focus:border-mint"
                    name="q"
                    placeholder="Membre, formule ou moyen"
                    defaultValue={query}
                  />
                </div>
                <button className="h-11 rounded-md bg-ink px-4 text-sm font-semibold text-white">
                  Filtrer
                </button>
                <input type="hidden" name="period" value={period} />
                <input type="hidden" name="method" value={method} />
              </form>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {periodCounts.map((option) => (
                <Link
                  key={option.value}
                  href={`/payments?period=${option.value}&method=${method}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                  className={`inline-flex h-10 items-center rounded-md px-3 text-sm font-semibold shadow-sm transition ${
                    option.active ? "bg-ink text-white" : "border border-line bg-white text-neutral-600 hover:bg-neutral-50"
                  }`}
                >
                  {option.label}
                </Link>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {methodCounts.map((option) => (
                <Link
                  key={option.value}
                  href={`/payments?period=${period}&method=${option.value}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                  className={`inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-semibold shadow-sm transition ${
                    option.active ? "bg-mint text-white" : "border border-line bg-white text-neutral-600 hover:bg-neutral-50"
                  }`}
                >
                  {option.label}
                  <span className={`rounded-md px-2 py-0.5 text-xs ${option.active ? "bg-white/15 text-white" : "bg-paper text-neutral-500"}`}>
                    {formatCurrency(option.amount)}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[920px]">
              <div className="grid grid-cols-[1fr_1.2fr_1fr_0.9fr_0.9fr_0.9fr_0.9fr_0.7fr] border-b border-line bg-neutral-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.04em] text-neutral-500">
                <span>Date</span>
                <span>Membre</span>
                <span>Formule</span>
                <span>Moyen</span>
                <span>Employe</span>
                <span>Type</span>
                <span className="text-right">Montant</span>
                <span className="text-right">Recu</span>
              </div>
              {paginatedPayments.length > 0 ? (
                paginatedPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="grid grid-cols-[1fr_1.2fr_1fr_0.9fr_0.9fr_0.9fr_0.9fr_0.7fr] items-center border-b border-line px-4 py-4 text-sm transition last:border-b-0 hover:bg-neutral-50"
                  >
                    <span className="text-neutral-600">{formatDateTime(payment.paid_at)}</span>
                    <span className="min-w-0 font-semibold">
                      {payment.member_id ? (
                        <Link href={`/members/${payment.member_id}`} className="block truncate transition hover:text-mint">
                          {payment.member_name}
                        </Link>
                      ) : (
                        <span className="block truncate">{payment.member_name}</span>
                      )}
                    </span>
                    <span className="truncate">{payment.plan ?? payment.notes ?? "-"}</span>
                    <span>{methodLabels[payment.method]}</span>
                    <span>{payment.staff_name ?? "-"}</span>
                    <span>
                      <StatusBadge tone="neutral">
                        {payment.kind === "subscription" ? "Abonnement" : "Ajustement"}
                      </StatusBadge>
                    </span>
                    <span className="text-right font-semibold">{formatCurrency(payment.amount)}</span>
                    <span className="text-right">
                      <Link
                        href={`/payments/${payment.id}/receipt`}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-line bg-white px-3 text-xs font-semibold transition hover:bg-neutral-50"
                      >
                        <ReceiptText size={14} />
                        Recu
                      </Link>
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="font-semibold">Aucun paiement trouve</p>
                  <p className="mt-2 text-sm text-neutral-500">Essaie une autre periode ou ajoute/renouvelle un abonnement.</p>
                  <Link href="/members" className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-mint px-4 text-sm font-semibold text-white">
                    Voir les membres
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        {totalPages > 1 && (
          <div className="mt-5 flex items-center justify-between gap-4 text-sm">
            <p className="text-neutral-500">
              {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, totalPayments)} sur {totalPayments} paiements
            </p>
            <div className="flex items-center gap-2">
              {safePage > 1 ? (
                <Link href={pageHref(safePage - 1)} className="inline-flex h-10 items-center justify-center rounded-md border border-line bg-white px-4 font-semibold transition hover:bg-neutral-50">
                  Précédent
                </Link>
              ) : null}
              <span className="inline-flex h-10 items-center justify-center rounded-md bg-ink px-4 font-semibold text-white">
                {safePage} / {totalPages}
              </span>
              {safePage < totalPages ? (
                <Link href={pageHref(safePage + 1)} className="inline-flex h-10 items-center justify-center rounded-md border border-line bg-white px-4 font-semibold transition hover:bg-neutral-50">
                  Suivant
                </Link>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
