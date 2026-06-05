import Link from "next/link";
import { notFound } from "next/navigation";
import { Archive, ArrowLeft, Banknote, CalendarClock, CheckCircle2, Phone, RotateCcw, UserCheck, UserPen } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { StaffPinFields } from "@/components/staff-pin-fields";
import { StatusBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/submit-button";
import { performMemberCheckin } from "@/app/(app)/checkin/actions";
import { archiveMember, renewMemberSubscription } from "@/app/(app)/members/actions";
import { formatCurrency } from "@/lib/demo-data";
import {
  getCurrentGym,
  getGymStaff,
  getMemberCheckins,
  getMemberDetail,
  getMemberPayments,
  getMemberSubscriptions,
  getSubscriptionTypes,
  type PaymentMethod,
} from "@/lib/supabase/queries";

type MemberDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
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

export default async function MemberDetailPage({
  params,
  searchParams,
}: MemberDetailPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const gym = await getCurrentGym();
  if (!gym) {
    notFound();
  }

  const [member, subscriptionTypes, subscriptions, checkins, payments, staff] = await Promise.all([
    getMemberDetail(gym.id, id),
    getSubscriptionTypes(gym.id),
    getMemberSubscriptions(gym.id, id),
    getMemberCheckins(gym.id, id),
    getMemberPayments(gym.id, id),
    getGymStaff(gym.id),
  ]);

  if (!member) {
    notFound();
  }

  const status = getStatus(member);
  const activeSubscription = member.active_subscription;
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const lastPayment = payments[0] ?? null;

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

      <div className="grid gap-6 px-4 py-6 md:px-8 xl:grid-cols-[1fr_420px]">
        <section className="space-y-6">
          <article className="rounded-md border border-line bg-white p-5 shadow-soft">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-semibold">{member.full_name}</h2>
                  <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                </div>
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-neutral-600">
                  <span className="inline-flex items-center gap-2">
                    <Phone size={16} />
                    {member.phone ?? "-"}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <CalendarClock size={16} />
                    Expire le {formatDate(activeSubscription?.expires_at ?? null)}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Link href={`/members/${member.id}/edit`} className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-semibold shadow-sm">
                  <UserPen size={18} />
                  Modifier
                </Link>
                <form action={performMemberCheckin}>
                  <input type="hidden" name="member_id" value={member.id} />
                  <div className="space-y-3">
                    <StaffPinFields staff={staff} />
                    <SubmitButton disabled={status.tone === "expired"} className="h-11 w-full sm:w-auto" pendingLabel="Pointage...">
                      <UserCheck size={18} />
                      Pointer
                    </SubmitButton>
                  </div>
                </form>
              </div>
            </div>

            {query.success ? (
              <div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-mint">
                {query.success}
              </div>
            ) : null}
            {query.error ? (
              <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-danger">
                {query.error}
              </div>
            ) : null}

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <div className="rounded-md bg-paper p-4">
                <p className="text-xs font-semibold uppercase text-neutral-500">Formule</p>
                <p className="mt-2 font-semibold">{activeSubscription?.subscription_types?.name ?? "-"}</p>
              </div>
              <div className="rounded-md bg-paper p-4">
                <p className="text-xs font-semibold uppercase text-neutral-500">Seances</p>
                <p className="mt-2 font-semibold">{activeSubscription?.sessions_left ?? "Illimite"}</p>
              </div>
              <div className="rounded-md bg-paper p-4">
                <p className="text-xs font-semibold uppercase text-neutral-500">Statut</p>
                <p className="mt-2 font-semibold">{status.label}</p>
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
                  <div key={payment.id} className="grid gap-3 p-5 text-sm md:grid-cols-[1fr_1fr_0.8fr_0.8fr] md:items-center">
                    <div>
                      <p className="font-semibold">
                        {payment.kind === "subscription" ? "Abonnement" : "Ajustement"}
                      </p>
                      <p className="mt-1 text-neutral-500">
                        {payment.plan ?? payment.notes ?? "Paiement manuel"}{payment.staff_name ? ` · ${payment.staff_name}` : ""}
                      </p>
                    </div>
                    <p className="text-neutral-600">{formatDateTime(payment.paid_at)}</p>
                    <p>{methodLabels[payment.method]}</p>
                    <p className="font-semibold md:text-right">{formatCurrency(payment.amount)}</p>
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
                  <div key={entry.id} className="flex items-center justify-between p-5 text-sm">
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
                <div key={subscription.id} className="grid gap-2 p-5 text-sm md:grid-cols-4">
                  <p className="font-semibold">{subscription.subscription_types?.name ?? "Formule"}</p>
                  <p>{formatDate(subscription.starts_at)} - {formatDate(subscription.expires_at)}</p>
                  <p>{subscription.sessions_left ?? "Illimite"} seances</p>
                  <p className="font-semibold">{formatCurrency(subscription.price_paid)}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <aside className="rounded-md border border-line bg-white p-5 shadow-soft">
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

            <div className="rounded-md border border-line bg-white p-4">
              <p className="text-sm font-semibold">Employe responsable</p>
              <p className="mt-1 text-sm text-neutral-500">Selectionne un employe PIN si le renouvellement est encaisse par l&apos;equipe terrain.</p>
              <div className="mt-4">
                <StaffPinFields staff={staff} />
              </div>
            </div>

            <SubmitButton
              type="submit"
              variant="accent"
              className="h-11 w-full"
              disabled={subscriptionTypes.length === 0}
              pendingLabel="Renouvellement..."
            >
              <CheckCircle2 size={18} />
              Renouveler maintenant
            </SubmitButton>
          </form>

          <div className="mt-6 border-t border-line pt-5">
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
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
