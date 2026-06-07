import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ReceiptText } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { BrandMark } from "@/components/brand-mark";
import { PageHeader } from "@/components/page-header";
import { PrintButton } from "@/components/print-button";
import { StatusBadge } from "@/components/status-badge";
import { formatCurrency } from "@/lib/demo-data";
import {
  getCurrentGym,
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
  const gym = await getCurrentGym();
  if (!gym) {
    notFound();
  }

  const [settings, payment] = await Promise.all([
    getGymSettings(gym.id),
    getPaymentReceipt(gym.id, id),
  ]);

  if (!settings || !payment) {
    notFound();
  }

  return (
    <AppShell>
      <PageHeader
        title="Recu de paiement"
        eyebrow={receiptNumber(payment.id)}
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
        <article className="mx-auto max-w-3xl rounded-md border border-line bg-white p-6 shadow-soft print:max-w-none print:border-0 print:p-0 print:shadow-none">
          <div className="flex flex-col gap-6 border-b border-line pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-4">
              <BrandMark className="size-14" />
              <div>
                <h2 className="text-2xl font-semibold">{settings.name}</h2>
                <p className="mt-1 text-sm text-neutral-500">{settings.phone ?? "Telephone non renseigne"}</p>
                <p className="mt-1 text-sm text-neutral-500">{settings.address ?? "Adresse non renseignee"}</p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs font-semibold uppercase text-neutral-500">Recu</p>
              <p className="mt-1 text-xl font-semibold">{receiptNumber(payment.id)}</p>
              <p className="mt-2 text-sm text-neutral-500">{formatDateTime(payment.paid_at)}</p>
            </div>
          </div>

          <div className="grid gap-4 border-b border-line py-6 md:grid-cols-2">
            <div className="rounded-md bg-paper p-4 print:border print:border-line print:bg-white">
              <p className="text-xs font-semibold uppercase text-neutral-500">Client</p>
              <p className="mt-2 text-lg font-semibold">{payment.member_name}</p>
              <p className="mt-1 text-sm text-neutral-500">
                {payment.member_number ? `Membre ${String(payment.member_number).padStart(6, "0")}` : "Paiement comptoir"}
              </p>
              <p className="mt-1 text-sm text-neutral-500">{payment.member_phone ?? "-"}</p>
            </div>
            <div className="rounded-md bg-paper p-4 print:border print:border-line print:bg-white">
              <p className="text-xs font-semibold uppercase text-neutral-500">Paiement</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <p className="text-lg font-semibold">{methodLabels[payment.method]}</p>
                <StatusBadge tone="active">Paye</StatusBadge>
              </div>
              <p className="mt-1 text-sm text-neutral-500">
                {payment.staff_name ? `Encaisse par ${payment.staff_name}` : "Encaissement enregistre"}
              </p>
            </div>
          </div>

          <div className="py-6">
            <div className="overflow-hidden rounded-md border border-line">
              <div className="grid grid-cols-[1.4fr_0.8fr] bg-neutral-50 px-4 py-3 text-xs font-semibold uppercase text-neutral-500">
                <span>Description</span>
                <span className="text-right">Montant</span>
              </div>
              <div className="grid grid-cols-[1.4fr_0.8fr] px-4 py-4 text-sm">
                <div>
                  <div className="flex items-center gap-2 font-semibold">
                    <ReceiptText size={17} />
                    {payment.kind === "subscription" ? "Abonnement" : "Paiement manuel"}
                  </div>
                  <p className="mt-1 text-neutral-500">{payment.plan ?? payment.notes ?? "Encaissement"}</p>
                  {payment.subscription_starts_at || payment.subscription_expires_at ? (
                    <p className="mt-1 text-xs text-neutral-500">
                      Periode: {formatDate(payment.subscription_starts_at)} - {formatDate(payment.subscription_expires_at)}
                    </p>
                  ) : null}
                </div>
                <p className="text-right font-semibold">{formatCurrency(payment.amount)}</p>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <div className="w-full max-w-xs rounded-md bg-paper p-4 print:border print:border-line print:bg-white">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold">Total paye</span>
                  <span className="text-xl font-semibold">{formatCurrency(payment.amount)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-line pt-5 text-center text-sm text-neutral-500">
            <p className="font-semibold text-ink">Merci pour votre paiement.</p>
            <p className="mt-1">Recu genere par GymFlow.</p>
          </div>
        </article>
      </div>
    </AppShell>
  );
}
