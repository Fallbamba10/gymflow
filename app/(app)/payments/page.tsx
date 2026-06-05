import Link from "next/link";
import { Banknote, CalendarDays, CreditCard, Download, Plus, Search, WalletCards } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { formatCurrency } from "@/lib/demo-data";
import {
  getCurrentGym,
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

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

type PaymentsPageProps = {
  searchParams: Promise<{
    error?: string;
    period?: string;
    method?: string;
    q?: string;
    success?: string;
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
  const gym = await getCurrentGym();
  const paymentsData = gym
    ? await getPaymentsData(gym.id, { period, method, query })
    : {
        payments: [],
        total: 0,
        count: 0,
        todayTotal: 0,
        methodTotals: {
          cash: 0,
          wave: 0,
          orange_money: 0,
          card: 0,
          other: 0,
        },
      };

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
  const exportHref = `/payments/export?period=${period}&method=${method}${query ? `&q=${encodeURIComponent(query)}` : ""}`;

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
              {periodOptions.map((option) => (
                <Link
                  key={option.value}
                  href={`/payments?period=${option.value}&method=${method}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                  className={`inline-flex h-9 items-center rounded-md px-3 text-sm font-semibold ${
                    period === option.value ? "bg-ink text-white" : "border border-line bg-white text-neutral-600"
                  }`}
                >
                  {option.label}
                </Link>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {methodOptions.map((option) => (
                <Link
                  key={option.value}
                  href={`/payments?period=${period}&method=${option.value}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                  className={`inline-flex h-9 items-center rounded-md px-3 text-sm font-semibold ${
                    method === option.value ? "bg-mint text-white" : "border border-line bg-white text-neutral-600"
                  }`}
                >
                  {option.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[920px]">
              <div className="grid grid-cols-[1fr_1.2fr_1fr_0.9fr_0.9fr_0.9fr_0.9fr] border-b border-line bg-neutral-50 px-4 py-3 text-xs font-semibold uppercase text-neutral-500">
                <span>Date</span>
                <span>Membre</span>
                <span>Formule</span>
                <span>Moyen</span>
                <span>Employe</span>
                <span>Type</span>
                <span className="text-right">Montant</span>
              </div>
              {paymentsData.payments.length > 0 ? (
                paymentsData.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="grid grid-cols-[1fr_1.2fr_1fr_0.9fr_0.9fr_0.9fr_0.9fr] items-center border-b border-line px-4 py-4 text-sm last:border-b-0"
                  >
                    <span className="text-neutral-600">{formatDateTime(payment.paid_at)}</span>
                    <span className="font-semibold">
                      {payment.member_id ? (
                        <Link href={`/members/${payment.member_id}`} className="transition hover:text-mint">
                          {payment.member_name}
                        </Link>
                      ) : (
                        payment.member_name
                      )}
                    </span>
                    <span>{payment.plan ?? payment.notes ?? "-"}</span>
                    <span>{methodLabels[payment.method]}</span>
                    <span>{payment.staff_name ?? "-"}</span>
                    <span>
                      <StatusBadge tone="neutral">
                        {payment.kind === "subscription" ? "Abonnement" : "Ajustement"}
                      </StatusBadge>
                    </span>
                    <span className="text-right font-semibold">{formatCurrency(payment.amount)}</span>
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
      </div>
    </AppShell>
  );
}
