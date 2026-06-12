/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Archive,
  ArrowLeft,
  Banknote,
  CalendarClock,
  CheckCircle2,
  Phone,
  QrCode,
  ReceiptText,
  RotateCcw,
  UserCheck,
  UserPen,
} from "lucide-react";
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

function formatDate(v: string | null) {
  if (!v) return "—";
  return new Intl.DateTimeFormat("fr-FR").format(new Date(v));
}
function formatDateTime(v: string) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(v));
}
function formatShort(v: string) {
  return new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" }).format(new Date(v));
}

const methodLabels: Record<PaymentMethod, string> = {
  cash: "Espèces",
  wave: "Wave",
  orange_money: "Orange Money",
  card: "Carte",
  other: "Autre",
};

const selectCls = "h-11 w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-3.5 text-sm text-white outline-none transition focus:border-emerald-500/60";

function getStatus(member: Awaited<ReturnType<typeof getMemberDetail>>) {
  if (member?.archived_at) return { tone: "neutral" as const, label: "Archivé" };
  const sub = member?.active_subscription;
  if (!sub) return { tone: "expired" as const, label: "Sans abonnement" };
  if (sub.status !== "active" || sub.sessions_left === 0) return { tone: "expired" as const, label: "Expiré" };
  if (sub.sessions_left !== null && sub.sessions_left <= 2)
    return { tone: "warning" as const, label: `${sub.sessions_left} séance${sub.sessions_left > 1 ? "s" : ""}` };
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

  if (!member) notFound();

  const status = getStatus(member);
  const activeSub = member.active_subscription;
  const isArchived = Boolean(member.archived_at);
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const lastPayment = payments[0] ?? null;
  const lastCheckin = checkins[0] ?? null;

  return (
    <AppShell>
      <PageHeader
        title={member.full_name}
        eyebrow={`Membre ${String(member.member_number).padStart(6, "0")}`}
        actions={
          <Link
            href="/members"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white/60 transition hover:bg-white/8 hover:text-white"
          >
            <ArrowLeft size={16} />
            Retour
          </Link>
        }
      />

      <div className="grid gap-4 px-6 py-6 md:px-8 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">

          {/* Fiche principale */}
          <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/4">
            <div className="relative overflow-hidden border-b border-white/8 px-6 py-5">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/8 text-lg font-bold text-white/60">
                    {member.photo_url ? (
                      <img src={member.photo_url} alt={member.full_name} className="size-full object-cover" />
                    ) : (
                      member.full_name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-semibold">{member.full_name}</h2>
                      <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-white/40">
                      <span className="inline-flex items-center gap-1.5">
                        <Phone size={13} />
                        {member.phone ?? "—"}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarClock size={13} />
                        Expire le {formatDate(activeSub?.expires_at ?? null)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/members/${member.id}/edit`}
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/6 px-4 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
                  >
                    <UserPen size={15} />
                    Modifier
                  </Link>
                  <form action={performMemberCheckin}>
                    <input type="hidden" name="member_id" value={member.id} />
                    <SubmitButton
                      disabled={status.tone === "expired" || isArchived}
                      className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-500 px-4 text-sm font-semibold text-white hover:bg-emerald-400 disabled:opacity-40"
                      pendingLabel="Pointage…"
                    >
                      <UserCheck size={15} />
                      Pointer
                    </SubmitButton>
                  </form>
                </div>
              </div>

              {isArchived && (
                <div className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/50">
                  Archivé depuis le {formatDate(member.archived_at)}. Restaure ce membre pour reprendre les pointages.
                </div>
              )}
            </div>

            {/* Stats rapides */}
            <div className="grid grid-cols-4 divide-x divide-white/6 px-0">
              {[
                { label: "Numéro", value: String(member.member_number).padStart(6, "0") },
                { label: "Formule", value: activeSub?.subscription_types?.name ?? "—" },
                { label: "Séances", value: activeSub?.sessions_left ?? "Illimité" },
                { label: "Dernier passage", value: lastCheckin ? formatShort(lastCheckin.checked_in_at) : "—" },
              ].map((s) => (
                <div key={s.label} className="px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/35">{s.label}</p>
                  <p className="mt-1.5 truncate text-sm font-semibold">{String(s.value)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Paiements */}
          <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/4">
            <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
              <div>
                <h2 className="font-semibold">Paiements</h2>
                <p className="mt-0.5 text-xs text-white/40">Historique financier de ce membre.</p>
              </div>
              <Banknote size={18} className="text-emerald-400" />
            </div>

            <div className="grid grid-cols-3 divide-x divide-white/6 border-b border-white/8">
              {[
                { label: "Total encaissé", value: formatCurrency(totalPaid) },
                { label: "Paiements", value: String(payments.length) },
                { label: "Dernier", value: lastPayment ? formatCurrency(lastPayment.amount) : "—" },
              ].map((s) => (
                <div key={s.label} className="px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-white/35">{s.label}</p>
                  <p className="mt-1.5 text-sm font-semibold text-emerald-400">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="divide-y divide-white/6">
              {payments.length > 0 ? (
                payments.map((p) => (
                  <div key={p.id} className="grid items-center gap-3 px-6 py-3.5 text-sm md:grid-cols-[1fr_1fr_0.7fr_0.7fr_auto]">
                    <div>
                      <p className="font-semibold">{p.kind === "subscription" ? "Abonnement" : "Ajustement"}</p>
                      <p className="mt-0.5 truncate text-xs text-white/40">
                        {p.plan ?? p.notes ?? "Paiement manuel"}{p.staff_name ? ` · ${p.staff_name}` : ""}
                      </p>
                    </div>
                    <p className="text-xs text-white/45">{formatDateTime(p.paid_at)}</p>
                    <p className="text-xs text-white/45">{methodLabels[p.method]}</p>
                    <p className="font-semibold text-emerald-400">{formatCurrency(p.amount)}</p>
                    <Link
                      href={`/payments/${p.id}/receipt`}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-semibold text-white/60 transition hover:bg-white/8 hover:text-white"
                    >
                      <ReceiptText size={13} />
                      Reçu
                    </Link>
                  </div>
                ))
              ) : (
                <p className="px-6 py-5 text-sm text-white/35">Aucun paiement lié à ce membre.</p>
              )}
            </div>
          </div>

          {/* Entrées */}
          <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/4">
            <div className="border-b border-white/8 px-6 py-4">
              <h2 className="font-semibold">Historique des entrées</h2>
              <p className="mt-0.5 text-xs text-white/40">Derniers pointages de ce membre.</p>
            </div>
            <div className="divide-y divide-white/6">
              {checkins.length > 0 ? (
                checkins.map((c) => (
                  <div key={c.id} className="flex items-center justify-between gap-4 px-6 py-3.5 text-sm">
                    <div>
                      <p className="font-semibold">{c.plan ?? "Abonnement"}</p>
                      <p className="mt-0.5 text-xs text-white/40">
                        Entrée validée{c.staff_name ? ` par ${c.staff_name}` : ""}
                      </p>
                    </div>
                    <span className="font-mono text-xs text-white/45">{formatShort(c.checked_in_at)}</span>
                  </div>
                ))
              ) : (
                <p className="px-6 py-5 text-sm text-white/35">Aucune entrée récente.</p>
              )}
            </div>
          </div>

          {/* Abonnements */}
          <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/4">
            <div className="border-b border-white/8 px-6 py-4">
              <h2 className="font-semibold">Abonnements</h2>
              <p className="mt-0.5 text-xs text-white/40">Historique des formules du membre.</p>
            </div>
            <div className="divide-y divide-white/6">
              {subscriptions.map((s) => (
                <div key={s.id} className="grid gap-2 px-6 py-3.5 text-sm md:grid-cols-4">
                  <p className="font-semibold">{s.subscription_types?.name ?? "Formule"}</p>
                  <p className="text-white/45 text-xs">{formatDate(s.starts_at)} → {formatDate(s.expires_at)}</p>
                  <p className="text-white/45 text-xs">{s.sessions_left ?? "Illimité"} séances</p>
                  <p className="font-semibold text-emerald-400">{formatCurrency(s.price_paid)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">

          {/* Renouveler */}
          <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/4">
            <div className="flex items-center gap-3 border-b border-white/8 px-5 py-4">
              <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                <RotateCcw size={15} />
              </div>
              <div>
                <h2 className="font-semibold">Renouveler</h2>
                <p className="mt-0.5 text-xs text-white/40">Crée un nouvel abonnement.</p>
              </div>
            </div>

            <form className="space-y-4 p-5" action={renewMemberSubscription}>
              <input type="hidden" name="member_id" value={member.id} />
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-white/70">Formule</span>
                <select name="subscription_type_id" className={selectCls}>
                  {subscriptionTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} — {formatCurrency(t.price)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-white/70">Mode de paiement</span>
                <select name="payment_method" className={selectCls} defaultValue="wave">
                  <option value="cash">Cash</option>
                  <option value="wave">Wave</option>
                  <option value="orange_money">Orange Money</option>
                  <option value="card">Carte bancaire</option>
                  <option value="other">Autre</option>
                </select>
              </label>
              <div className="rounded-xl border border-white/8 bg-white/4 p-4 text-xs text-white/40">
                L&apos;abonnement actif sera marqué expiré automatiquement.
              </div>
              <SubmitButton
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 text-sm font-semibold text-white hover:bg-emerald-400 disabled:opacity-40"
                disabled={subscriptionTypes.length === 0 || isArchived}
                pendingLabel="Renouvellement…"
              >
                <CheckCircle2 size={15} />
                Renouveler maintenant
              </SubmitButton>
            </form>

            <div className="border-t border-white/8 p-5">
              {isArchived ? (
                <form action={restoreMember}>
                  <input type="hidden" name="member_id" value={member.id} />
                  <SubmitButton
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-sm font-semibold text-emerald-400 hover:bg-emerald-500/20"
                    pendingLabel="Restauration…"
                  >
                    <RotateCcw size={15} />
                    Restaurer le membre
                  </SubmitButton>
                </form>
              ) : (
                <form action={archiveMember}>
                  <input type="hidden" name="member_id" value={member.id} />
                  <SubmitButton
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 text-sm font-semibold text-red-400 hover:bg-red-500/20"
                    pendingLabel="Archivage…"
                  >
                    <Archive size={15} />
                    Archiver le membre
                  </SubmitButton>
                </form>
              )}
            </div>
          </div>

          {/* QR Code */}
          <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/4">
            <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
              <div className="flex items-center gap-2">
                <QrCode size={16} className="text-emerald-400" />
                <h2 className="font-semibold">Carte QR</h2>
              </div>
              <PrintButton />
            </div>
            <div className="p-5">
              <MemberQR
                memberId={member.id}
                memberNumber={member.member_number}
                memberName={member.full_name}
                gymName={gym.name}
              />
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
