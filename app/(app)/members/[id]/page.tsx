/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import { Archive, ArrowLeft, Banknote, CalendarClock, CheckCircle2, Phone, QrCode, ReceiptText, RotateCcw, ShieldCheck, UserCheck, UserPen } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { MemberQR } from "@/components/member-qr";
import { PageHeader } from "@/components/page-header";
import { PrintButton } from "@/components/print-button";
import { StatusBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/submit-button";
import { performMemberCheckin } from "@/app/(app)/checkin/actions";
import { archiveMember, renewMemberSubscription, restoreMember } from "@/app/(app)/members/actions";
import { formatCurrency } from "@/lib/demo-data";
import { requireAdminGym } from "@/lib/supabase/guards";
import {
  getMemberCheckins,
  getMemberDetail,
  getMemberPayments,
  getMemberSubscriptions,
  getSubscriptionTypes,
  type PaymentMethod,
} from "@/lib/supabase/queries";

type MemberDetailPageProps = {
  params: Promise<{ id: string }>;
};

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("fr-FR").format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

const methodLabels: Record<PaymentMethod, string> = {
  cash: "Especes",
  wave: "Wave",
  orange_money: "Orange Money",
  card: "Carte",
  other: "Autre",
};

function getStatus(member: Awaited<ReturnType<typeof getMemberDetail>>) {
  if (member?.archived_at) {
    return { tone: "neutral" as const, label: "Archive" };
  }

  const subscription = member?.active_subscription;
  if (!subscription) {
    return { tone: "expired" as const, label: "Aucun abonnement" };
  }
  if (subscription.status !== "active" || subscription.sessions_left === 0) {
    return { tone: "expired" as const, label: "Expire" };
  }
  if (subscription.sessions_left !== null && subscription.sessions_left <= 2) {
    return { tone: "warning" as const, label: `${subscription.sessions_left} seance${subscription.sessions_left > 1 ? "s" : ""}` };
  }
  return { tone: "active" as const, label: "Actif" };
}

export default async function MemberDetailPage({ params }: MemberDetailPageProps) {
  const { id } = await params;
  const gym = await requireAdminGym();

  const [member, subscriptionTypes, subscriptions, checkins, payments] = await Promise.all([
    getMemberDetail(gym.id, id),
    getSubscriptionTypes(gym.id),
    getMemberSubscriptions(gym.id, id),
    getMemberCheckins(gym.id, id),
    getMemberPayments(gym.id, id),
  ]);

  if (!member) {
    notFound();
  }

  const status = getStatus(member);
  const activeSubscription = member.active_subscription;
  const isArchived = Boolean(member.archived_at);
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const lastPayment = payments[0] ?? null;
  const lastCheckin = checkins[0] ?? null;
  const sessionsText = activeSubscription?.sessions_left ?? "Illimite";
  const expiresText = formatDate(activeSubscription?.expires_at ?? null);

  return (
    <AppShell>
      <PageHeader
        title={member.full_name}
        eyebrow={`Membre ${String(member.member_number).padStart(6, "0")}`}
        actions={
          <Link href="/members" className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-semibold shadow-sm">
            <ArrowLeft size={18} />
            Retour
          </Link>
        }
      />

      <div className="grid gap-6 px-4 py-6 md:px-8 xl:grid-cols-[1fr_400px]">
        <section className="space-y-6">
          <article className="rounded-md border border-neutral-900 bg-ink p-5 text-white shadow-soft md:p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-white/70">
                    <ShieldCheck size={14} />
                    Fiche membre
                  </div>
                  <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                </div>
                <h2 className="mt-4 text-2xl font-semibold md:text-3xl">
                  {member.photo_url ? (
                    <span className="mr-3 inline-block size-10 overflow-hidden rounded-full border-2 border-white/20 align-middle">
                      <img src={member.photo_url} alt={member.full_name} className="size-full object-cover" />
                    </span>
                  ) : null}
                  {member.full_name}
                </h2>
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-white/65">
                  <span className="inline-flex items-center gap-2">
                    <Phone size={16} />
                    {member.phone ?? "-"}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <CalendarClock size={16} />
                    Expire le {expiresText}
                  </span>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:w-[360px]">
                <Link href={`/members/${member.id}/edit`} className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-white/15">
                  <UserPen size={18} />
                  Modifier
                </Link>
                <form action={performMemberCheckin}>
                  <input type="hidden" name="member_id" value={member.id} />
                  <SubmitButton disabled={status.tone === "expired" || isArchived} variant="accent" className="h-12 w-full" pendingLabel="Pointage...">
                    <UserCheck size={18} />
                    Pointer
                  </SubmitButton>
                </form>
              </div>
            </div>

            {isArchived ? (
              <div className="mt-5 rounded-md border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-semibold text-neutral-700">
                Ce membre est archive depuis le {formatDate(member.archived_at)}. Restaure-le pour reprendre les pointages et renouvellements.
              </div>
            ) : null}

            <div className="mt-6 grid gap-3 md:grid-cols-4">
              <div className="border-l border-white/15 pl-4">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-white/45">Numero</p>
                <p className="mt-2 font-semibold">{String(member.member_number).padStart(6, "0")}</p>
              </div>
              <div className="border-l border-white/15 pl-4">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-white/45">Formule</p>
                <p className="mt-2 truncate font-semibold">{activeSubscription?.subscription_types?.name ?? "-"}</p>
              </div>
              <div className="border-l border-white/15 pl-4">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-white/45">Seances</p>
                <p className="mt-2 font-semibold">{sessionsText}</p>
              </div>
              <div className="border-l border-white/15 pl-4">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-white/45">Derniere entree</p>
                <p className="mt-2 font-semibold">{lastCheckin ? formatTime(lastCheckin.checked_in_at) : "-"}</p>
              </div>
            </div>
          </article>

          <article className="rounded-md border border-line bg-white shadow-soft">
            <div className="flex items-center justify-between gap-4 border-b border-line p-5">
              <div>
                <h2 className="text-lg font-semibold">Paiements</h2>
                <p className="mt-1 text-sm text-neutral-500">Historique financier lie a ce membre.</p>
              </div>
              <Banknote className="text-mint" size={22} />
            </div>

            <div className="grid gap-3 border-b border-line p-5 md:grid-cols-3">
              <div className="rounded-md bg-paper p-4">
                <p className="text-xs font-semibold uppercase text-neutral-500">Total encaisse</p>
                <p className="mt-2 font-semibold">{formatCurrency(totalPaid)}</p>
              </div>
              <div className="rounded-md bg-paper p-4">
                <p className="text-xs font-semibold uppercase text-neutral-500">Paiements</p>
                <p className="mt-2 font-semibold">{payments.length}</p>
              </div>
              <div className="rounded-md bg-paper p-4">
                <p className="text-xs font-semibold uppercase text-neutral-500">Dernier paiement</p>
                <p className="mt-2 font-semibold">
                  {lastPayment ? formatCurrency(lastPayment.amount) : "-"}
                </p>
              </div>
            </div>

            <div className="divide-y divide-line">
              {payments.length > 0 ? (
                payments.map((payment) => (
                  <div key={payment.id} className="grid gap-3 p-5 text-sm transition hover:bg-neutral-50 md:grid-cols-[1fr_1fr_0.8fr_0.8fr_auto] md:items-center">
                    <div className="min-w-0">
                      <p className="font-semibold">
                        {payment.kind === "subscription" ? "Abonnement" : "Ajustement"}
                      </p>
                      <p className="mt-1 truncate text-neutral-500">
                        {payment.plan ?? payment.notes ?? "Paiement manuel"}{payment.staff_name ? ` · ${payment.staff_name}` : ""}
                      </p>
                    </div>
                    <p className="text-neutral-600">{formatDateTime(payment.paid_at)}</p>
                    <p>{methodLabels[payment.method]}</p>
                    <p className="font-semibold md:text-right">{formatCurrency(payment.amount)}</p>
                    <Link
                      href={`/payments/${payment.id}/receipt`}
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-line bg-white px-3 text-xs font-semibold transition hover:bg-neutral-50"
                    >
                      <ReceiptText size={15} />
                      Recu
                    </Link>
                  </div>
                ))
              ) : (
                <p className="p-5 text-sm text-neutral-500">Aucun paiement lie a ce membre.</p>
              )}
            </div>
          </article>

          <article className="rounded-md border border-line bg-white shadow-soft">
            <div className="border-b border-line p-5">
              <h2 className="text-lg font-semibold">Historique des entrees</h2>
              <p className="mt-1 text-sm text-neutral-500">Derniers pointages de ce membre.</p>
            </div>
            <div className="divide-y divide-line">
              {checkins.length > 0 ? (
                checkins.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between gap-4 p-5 text-sm transition hover:bg-neutral-50">
                    <div>
                      <p className="font-semibold">{entry.plan ?? "Abonnement"}</p>
                      <p className="mt-1 text-neutral-500">
                        Entree validee{entry.staff_name ? ` par ${entry.staff_name}` : ""}
                      </p>
                    </div>
                    <span className="font-mono font-semibold">{formatTime(entry.checked_in_at)}</span>
                  </div>
                ))
              ) : (
                <p className="p-5 text-sm text-neutral-500">Aucune entree recente.</p>
              )}
            </div>
          </article>

          <article className="rounded-md border border-line bg-white shadow-soft">
            <div className="border-b border-line p-5">
              <h2 className="text-lg font-semibold">Abonnements</h2>
              <p className="mt-1 text-sm text-neutral-500">Historique des formules du membre.</p>
            </div>
            <div className="divide-y divide-line">
              {subscriptions.map((subscription) => (
                <div key={subscription.id} className="grid gap-2 p-5 text-sm transition hover:bg-neutral-50 md:grid-cols-4">
                  <p className="font-semibold">{subscription.subscription_types?.name ?? "Formule"}</p>
                  <p>{formatDate(subscription.starts_at)} - {formatDate(subscription.expires_at)}</p>
                  <p>{subscription.sessions_left ?? "Illimite"} seances</p>
                  <p className="font-semibold">{formatCurrency(subscription.price_paid)}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <aside className="rounded-md border border-line bg-white p-5 shadow-soft xl:sticky xl:top-6 xl:self-start">
          <div className="flex items-center gap-3 border-b border-line pb-5">
            <div className="flex size-10 items-center justify-center rounded-md bg-paper text-ink">
              <RotateCcw size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Renouveler</h2>
              <p className="mt-1 text-sm text-neutral-500">Cree un nouvel abonnement et paiement.</p>
            </div>
          </div>

          <form className="mt-5 space-y-5" action={renewMemberSubscription}>
            <input type="hidden" name="member_id" value={member.id} />
            <label className="block">
              <span className="text-sm font-semibold text-neutral-700">Formule</span>
              <select
                className="mt-2 h-11 w-full rounded-md border border-line bg-paper px-3 outline-none focus:border-mint"
                name="subscription_type_id"
              >
                {subscriptionTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name} - {formatCurrency(type.price)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-neutral-700">Mode de paiement</span>
              <select
                className="mt-2 h-11 w-full rounded-md border border-line bg-paper px-3 outline-none focus:border-mint"
                name="payment_method"
                defaultValue="wave"
              >
                <option value="cash">Cash</option>
                <option value="wave">Wave</option>
                <option value="orange_money">Orange Money</option>
                <option value="card">Carte bancaire</option>
                <option value="other">Autre</option>
              </select>
            </label>

            <div className="rounded-md border border-line bg-paper p-4 text-sm">
              <p className="font-semibold">Renouvellement immediat</p>
              <p className="mt-1 text-neutral-500">
                L&apos;ancien abonnement actif sera marque expire.
              </p>
            </div>

            <SubmitButton
              type="submit"
              variant="accent"
              className="h-12 w-full"
              disabled={subscriptionTypes.length === 0 || isArchived}
              pendingLabel="Renouvellement..."
            >
              <CheckCircle2 size={18} />
              Renouveler maintenant
            </SubmitButton>
          </form>

          <div className="mt-6 border-t border-line pt-5">
            {isArchived ? (
              <form action={restoreMember}>
                <input type="hidden" name="member_id" value={member.id} />
                <SubmitButton
                  variant="secondary"
                  className="h-10 w-full border-emerald-200 bg-emerald-50 text-mint hover:bg-emerald-100"
                  pendingLabel="Restauration..."
                >
                  <RotateCcw size={17} />
                  Restaurer le membre
                </SubmitButton>
              </form>
            ) : (
              <form action={archiveMember}>
                <input type="hidden" name="member_id" value={member.id} />
                <SubmitButton
                  variant="secondary"
                  className="h-10 w-full border-red-200 bg-red-50 text-danger hover:bg-red-100"
                  pendingLabel="Archivage..."
                >
                  <Archive size={17} />
                  Archiver le membre
                </SubmitButton>
              </form>
            )}
          </div>

          {/* Carte QR membre */}
          <div className="mt-6 border-t border-line pt-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <QrCode size={18} className="text-mint" />
                <h2 className="text-base font-semibold">Carte QR</h2>
              </div>
              <PrintButton />
            </div>
            <MemberQR
              memberId={member.id}
              memberNumber={member.member_number}
              memberName={member.full_name}
              gymName={gym.name}
            />
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
