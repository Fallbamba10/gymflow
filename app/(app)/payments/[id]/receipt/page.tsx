import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Banknote, CalendarDays, CheckCircle2, Hash, MapPin, Phone, ReceiptText, UserRound } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { BrandMark } from "@/components/brand-mark";
import { PageHeader } from "@/components/page-header";
import { PrintButton } from "@/components/print-button";
import { StatusBadge } from "@/components/status-badge";
import { formatCurrency } from "@/lib/demo-data";
import { requireAdminGym } from "@/lib/supabase/guards";
import {
  getGymSettings,
  getPaymentReceipt,
  type PaymentMethod,
} from "@/lib/supabase/queries";

type ReceiptPageProps = {
  params: Promise<{
    id: string;
  }>;
};

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

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("fr-FR").format(new Date(value));
}

function receiptNumber(id: string) {
  return `GF-${id.slice(0, 8).toUpperCase()}`;
}

export default async function PaymentReceiptPage({ params }: ReceiptPageProps) {
  const { id } = await params;
  const gym = await requireAdminGym();

  const [settings, payment] = await Promise.all([
    getGymSettings(gym.id),
    getPaymentReceipt(gym.id, id),
  ]);

  if (!settings || !payment) {
    notFound();
  }

  const receiptId = receiptNumber(payment.id);
  const paymentLabel = payment.kind === "subscription" ? "Abonnement" : "Paiement comptoir";
  const description = payment.plan ?? payment.notes ?? "Encaissement";

  return (
    <AppShell>
      <PageHeader
        title="Recu de paiement"
        eyebrow={receiptId}
        actions={
          <>
            <Link href="/payments" className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-semibold shadow-sm print:hidden">
              <ArrowLeft size={18} />
              Caisse
            </Link>
            <PrintButton />
          </>
        }
      />

      <div className="px-4 py-6 md:px-8 print:bg-white print:p-0">
        <article className="mx-auto max-w-4xl overflow-hidden rounded-md border border-line bg-white shadow-soft print:max-w-none print:border-0 print:shadow-none">
          <div className="bg-ink p-6 text-white print:border-b print:border-line print:bg-white print:text-ink">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-4">
                <BrandMark inverse className="size-14 print:bg-ink print:text-white" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/45 print:text-neutral-500">Recu officiel</p>
                  <h2 className="mt-2 text-2xl font-semibold">{settings.name}</h2>
                  <div className="mt-3 space-y-1 text-sm text-white/62 print:text-neutral-600">
                    <p className="inline-flex items-center gap-2">
                      <Phone size={15} />
                      {settings.phone ?? "Telephone non renseigne"}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin size={15} />
                      {settings.address ?? "Adresse non renseignee"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-md border border-white/15 bg-white/10 p-4 text-left backdrop-blur print:border-line print:bg-paper sm:text-right">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/45 print:text-neutral-500">Reference</p>
                <p className="mt-2 text-2xl font-semibold">{receiptId}</p>
                <p className="mt-2 text-sm text-white/60 print:text-neutral-600">{formatDateTime(payment.paid_at)}</p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-[1fr_320px] md:items-end">
              <div>
                <p className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-sm font-semibold text-mint print:border print:border-line print:bg-white">
                  <CheckCircle2 size={17} />
                  Paiement confirme
                </p>
                <p className="mt-4 max-w-xl text-sm leading-7 text-white/62 print:text-neutral-600">
                  Ce recu confirme l&apos;encaissement effectue par la salle pour le client indique ci-dessous.
                </p>
              </div>
              <div className="rounded-md bg-white p-5 text-ink print:border print:border-line">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-neutral-500">Montant paye</p>
                <p className="mt-3 text-4xl font-semibold">{formatCurrency(payment.amount)}</p>
                <p className="mt-2 text-sm font-semibold text-mint">{methodLabels[payment.method]}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-md border border-line bg-paper p-4 print:bg-white">
                <UserRound className="text-mint" size={20} />
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">Client</p>
                <p className="mt-2 text-lg font-semibold">{payment.member_name}</p>
                <p className="mt-1 text-sm text-neutral-500">
                  {payment.member_number ? `Membre ${String(payment.member_number).padStart(6, "0")}` : "Client comptoir"}
                </p>
                <p className="mt-1 text-sm text-neutral-500">{payment.member_phone ?? "-"}</p>
              </div>

              <div className="rounded-md border border-line bg-paper p-4 print:bg-white">
                <Banknote className="text-mint" size={20} />
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">Paiement</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <p className="text-lg font-semibold">{methodLabels[payment.method]}</p>
                  <StatusBadge tone="active">Paye</StatusBadge>
                </div>
                <p className="mt-1 text-sm text-neutral-500">
                  {payment.staff_name ? `Encaisse par ${payment.staff_name}` : "Encaissement enregistre"}
                </p>
              </div>

              <div className="rounded-md border border-line bg-paper p-4 print:bg-white">
                <Hash className="text-mint" size={20} />
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">Reference</p>
                <p className="mt-2 text-lg font-semibold">{receiptId}</p>
                <p className="mt-1 inline-flex items-center gap-2 text-sm text-neutral-500">
                  <CalendarDays size={15} />
                  {formatDateTime(payment.paid_at)}
                </p>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-md border border-line">
              <div className="grid grid-cols-[1.3fr_0.7fr] bg-neutral-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500 print:bg-white">
                <span>Prestation</span>
                <span className="text-right">Montant</span>
              </div>
              <div className="grid grid-cols-[1.3fr_0.7fr] px-4 py-5 text-sm">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-semibold">
                    <ReceiptText size={17} />
                    {paymentLabel}
                  </p>
                  <p className="mt-2 text-neutral-500">{description}</p>
                  {payment.subscription_starts_at || payment.subscription_expires_at ? (
                    <p className="mt-2 text-xs font-semibold text-neutral-500">
                      Periode : {formatDate(payment.subscription_starts_at)} - {formatDate(payment.subscription_expires_at)}
                    </p>
                  ) : null}
                </div>
                <p className="text-right font-semibold">{formatCurrency(payment.amount)}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <div className="w-full max-w-sm rounded-md border border-line bg-paper p-4 print:bg-white">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="font-semibold">Total paye</span>
                  <span className="text-xl font-semibold">{formatCurrency(payment.amount)}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-line pt-5 text-center text-sm text-neutral-500">
              <p className="font-semibold text-ink">Merci pour votre paiement.</p>
              <p className="mt-1">Recu genere par GymFlow pour {settings.name}.</p>
            </div>
          </div>
        </article>
      </div>
    </AppShell>
  );
}
