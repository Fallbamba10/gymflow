import {
  Activity,
  AlertTriangle,
  Banknote,
  CheckCircle2,
  Clock3,
  CreditCard,
  DoorOpen,
  Gauge,
  Repeat2,
  Search,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { FormField } from "@/components/form-field";
import { PageHeader } from "@/components/page-header";
import { QrCheckinTrigger } from "@/components/qr-checkin-trigger";
import { StatusBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/submit-button";
import { performMemberCheckin, performWalkInCheckin } from "@/app/(app)/checkin/actions";
import { getCheckinCandidates, getCurrentGym, getTodayCheckins } from "@/lib/supabase/queries";

type CheckinPageProps = {
  searchParams: Promise<{ q?: string }>;
};

const paymentMethods = [
  { value: "cash", label: "Espèces" },
  { value: "wave", label: "Wave" },
  { value: "orange_money", label: "Orange Money" },
  { value: "card", label: "Carte" },
  { value: "other", label: "Autre" },
];

function formatTime(value: string) {
  return new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fr-FR").format(new Date(value));
}

export default async function CheckinPage({ searchParams }: CheckinPageProps) {
  const params = await searchParams;
  const query = params.q?.trim().toLowerCase() ?? "";
  const gym = await getCurrentGym();
  const allCandidates = gym ? await getCheckinCandidates(gym.id) : [];
  const candidates = allCandidates.filter((member) => {
    if (!query) return true;
    return (
      member.full_name.toLowerCase().includes(query) ||
      (member.phone ?? "").toLowerCase().includes(query) ||
      String(member.member_number).padStart(6, "0").includes(query)
    );
  });

  const checkins = gym ? await getTodayCheckins(gym.id) : [];
  const memberCheckins = checkins.filter((entry) => entry.member_id);
  const walkInCheckins = checkins.filter((entry) => !entry.member_id);
  const checkinsByMember = new Map<string, { count: number; lastTime: string }>();

  for (const entry of memberCheckins) {
    if (!entry.member_id) continue;
    const current = checkinsByMember.get(entry.member_id);
    checkinsByMember.set(entry.member_id, {
      count: (current?.count ?? 0) + 1,
      lastTime: current?.lastTime ?? entry.checked_in_at,
    });
  }

  const activeCandidates = allCandidates.filter((m) => m.status === "active").length;
  const warningCandidates = allCandidates.filter((m) => m.status === "warning").length;
  const expiredCandidates = allCandidates.filter((m) => m.status === "expired").length;
  const repeatVisits = Array.from(checkinsByMember.values()).filter((v) => v.count > 1).length;

  const sortedCandidates = [...candidates].sort((a, b) => {
    const aVisit = checkinsByMember.get(a.id);
    const bVisit = checkinsByMember.get(b.id);
    if (Boolean(aVisit) !== Boolean(bVisit)) return aVisit ? 1 : -1;
    if (a.status !== b.status) {
      const order = { active: 0, warning: 1, expired: 2 };
      return order[a.status] - order[b.status];
    }
    return a.full_name.localeCompare(b.full_name);
  });

  return (
    <AppShell>
      <PageHeader
        title="Pointage"
        eyebrow={`${checkins.length} entrée${checkins.length > 1 ? "s" : ""} aujourd'hui`}
      />

      <div className="px-6 py-6 md:px-8">

        {/* Hero */}
        <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/4">
          <div className="relative overflow-hidden border-b border-white/8 bg-gradient-to-br from-emerald-500/8 via-transparent to-transparent px-6 py-5">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-white/60">
                  <ShieldCheck size={12} />
                  Pointage comptoir
                </div>
                <h2 className="mt-3 text-xl font-semibold">Une entrée, un bouton, zéro confusion</h2>
                <p className="mt-1.5 max-w-xl text-sm leading-6 text-white/50">
                  Choisis une séance simple ou cherche un membre abonné. Le journal se met à jour aussitôt.
                </p>
              </div>
              <div className="flex items-center gap-6">
                {[
                  { label: "Abonnés", value: memberCheckins.length },
                  { label: "Séances", value: walkInCheckins.length },
                  { label: "Retours", value: repeatVisits },
                ].map((s) => (
                  <div key={s.label} className="border-l border-white/10 pl-5 first:border-l-0 first:pl-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-white/35">{s.label}</p>
                    <p className="mt-1.5 text-xl font-semibold">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Entrées du jour", value: String(checkins.length), detail: `${memberCheckins.length} membres · ${walkInCheckins.length} séances`, icon: Activity, accent: "text-emerald-400", bg: "bg-emerald-500/15" },
            { label: "Membres pointables", value: String(activeCandidates + warningCandidates), detail: `${warningCandidates} à surveiller`, icon: Users, accent: "text-blue-400", bg: "bg-blue-500/15" },
            { label: "Passages multiples", value: String(repeatVisits), detail: "matin + soir possibles", icon: Repeat2, accent: "text-violet-400", bg: "bg-violet-500/15" },
            { label: "Bloqués", value: String(expiredCandidates), detail: "abonnement expiré", icon: AlertTriangle, accent: "text-amber-400", bg: "bg-amber-500/15" },
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

        <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_380px]">
          <section className="space-y-4">

            {/* Séance simple */}
            <form action={performWalkInCheckin} className="overflow-hidden rounded-2xl border border-white/8 bg-white/4">
              <div className="flex flex-col gap-3 border-b border-white/8 px-6 py-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="font-semibold">Client sans abonnement</h2>
                  <p className="mt-0.5 text-xs text-white/40">Encaisse une séance puis valide l&apos;entrée.</p>
                </div>
                <div className="inline-flex w-fit items-center gap-2 rounded-xl bg-white/8 px-3 py-2 text-sm font-semibold text-white/70">
                  <Banknote size={15} />
                  Séance simple
                </div>
              </div>

              <div className="grid gap-5 p-6 lg:grid-cols-[1fr_320px]">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Prix de la séance">
                    <div className="relative">
                      <Wallet className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" size={16} />
                      <input
                        name="amount"
                        type="number"
                        min="1"
                        className="h-14 w-full rounded-xl border border-white/10 bg-white/6 pl-11 pr-3.5 text-lg font-semibold text-white placeholder-white/25 outline-none transition focus:border-emerald-500/60 focus:bg-white/8"
                        placeholder="3000"
                        required
                      />
                    </div>
                  </FormField>
                  <FormField label="Mode de paiement">
                    <select
                      name="method"
                      className="h-14 w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-3.5 text-base font-semibold text-white outline-none transition focus:border-emerald-500/60"
                      defaultValue="cash"
                    >
                      {paymentMethods.map((m) => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </FormField>
                  <div className="sm:col-span-2">
                    <FormField label="Nom client (facultatif)">
                      <input
                        name="customer_name"
                        className="h-11 w-full rounded-xl border border-white/10 bg-white/6 px-3.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-emerald-500/60 focus:bg-white/8"
                        placeholder="Client comptoir"
                      />
                    </FormField>
                  </div>
                </div>

                <div className="rounded-xl border border-white/8 bg-white/3 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                      <UserCheck size={17} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Session connectée</p>
                      <p className="mt-1 text-xs leading-5 text-white/40">Le propriétaire ou l&apos;employé connecté valide directement.</p>
                    </div>
                  </div>
                  <SubmitButton
                    className="mt-4 inline-flex h-13 w-full items-center justify-between rounded-xl bg-emerald-500 px-5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(16,185,129,0.25)] transition hover:bg-emerald-400"
                    pendingLabel="Encaissement…"
                  >
                    <span className="inline-flex items-center gap-2">
                      <DoorOpen size={18} />
                      Encaisser la séance
                    </span>
                    <CheckCircle2 size={16} />
                  </SubmitButton>
                </div>
              </div>
            </form>

            {/* Membre abonné */}
            <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/4">
              <div className="border-b border-white/8 px-6 py-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="font-semibold">Membre abonné</h2>
                    <p className="mt-0.5 text-xs text-white/40">Recherche le membre, puis valide son passage.</p>
                  </div>
                  <div className="inline-flex w-fit items-center gap-2 rounded-xl bg-white/8 px-3 py-2 text-sm font-semibold text-white/70">
                    <Sparkles size={15} />
                    Abonnement
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <form className="flex flex-1 flex-col gap-3 sm:flex-row" action="/checkin">
                    <div className="relative flex-1">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" size={16} />
                      <input
                        className="h-12 w-full rounded-xl border border-white/10 bg-white/6 pl-10 pr-3.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-emerald-500/60 focus:bg-white/8"
                        name="q"
                        placeholder="Nom, téléphone ou numéro"
                        defaultValue={params.q ?? ""}
                      />
                    </div>
                    <button className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/8 px-5 text-sm font-semibold text-white/70 transition hover:bg-white/12 hover:text-white">
                      <Search size={15} />
                      Rechercher
                    </button>
                  </form>
                  <QrCheckinTrigger />
                </div>
              </div>

              <div className="space-y-3 p-6">
                {sortedCandidates.length > 0 ? (
                  sortedCandidates.map((member) => {
                    const visit = checkinsByMember.get(member.id);
                    const isExpired = member.status === "expired";
                    return (
                      <div
                        key={member.id}
                        className={`overflow-hidden rounded-xl border transition ${visit ? "border-emerald-500/20 bg-emerald-500/6" : isExpired ? "border-red-500/15 bg-white/3" : "border-white/8 bg-white/3"}`}
                      >
                        <div className="grid gap-4 p-4 lg:grid-cols-[1fr_280px] lg:items-center">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold">{member.full_name}</p>
                              <StatusBadge tone={member.status}>{member.status_label}</StatusBadge>
                              {visit ? (
                                <StatusBadge tone="neutral">
                                  {visit.count} passage{visit.count > 1 ? "s" : ""} aujourd&apos;hui
                                </StatusBadge>
                              ) : null}
                            </div>
                            <p className="mt-1 text-xs text-white/45">
                              #{String(member.member_number).padStart(6, "0")} · {member.plan ?? "Sans formule"} · expire le {formatDate(member.expires_at)}
                            </p>
                            <p className="mt-0.5 text-xs text-white/35">
                              {member.sessions_left === null ? "Séances illimitées" : `${member.sessions_left} séance${member.sessions_left > 1 ? "s" : ""} restante${member.sessions_left > 1 ? "s" : ""}`}
                              {visit ? ` · dernier passage ${formatTime(visit.lastTime)}` : ""}
                            </p>
                          </div>
                          <form action={performMemberCheckin}>
                            <input type="hidden" name="member_id" value={member.id} />
                            <input type="hidden" name="current_q" value={params.q ?? ""} />
                            <SubmitButton
                              disabled={isExpired}
                              className={`inline-flex h-12 w-full items-center justify-between rounded-xl px-4 text-sm font-semibold transition ${isExpired ? "cursor-not-allowed border border-white/8 bg-white/3 text-white/30" : visit ? "border border-white/10 bg-white/8 text-white hover:bg-white/12" : "bg-emerald-500 text-white shadow-[0_10px_24px_rgba(16,185,129,0.25)] hover:bg-emerald-400"}`}
                              pendingLabel="Validation…"
                            >
                              <span className="inline-flex items-center gap-2">
                                {visit ? <Repeat2 size={16} /> : <CheckCircle2 size={16} />}
                                {isExpired ? "Abonnement expiré" : visit ? "Pointer encore" : "Pointer le membre"}
                              </span>
                              {!isExpired && <CheckCircle2 size={14} />}
                            </SubmitButton>
                          </form>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-xl border border-white/8 bg-white/3 px-5 py-8 text-center">
                    <p className="font-semibold text-white/60">Aucun membre trouvé</p>
                    <p className="mt-1 text-xs text-white/35">Ajuste la recherche ou utilise la séance simple pour un client sans inscription.</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Sidebar journal */}
          <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
            <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/4">
              <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
                <div>
                  <h2 className="font-semibold">Journal du jour</h2>
                  <p className="mt-0.5 text-xs text-white/40">Dernières entrées validées.</p>
                </div>
                <Gauge size={18} className="text-emerald-400" />
              </div>
              <div className="divide-y divide-white/6">
                {checkins.length > 0 ? (
                  checkins.slice(0, 14).map((entry, index, visibleEntries) => {
                    const previousSameMember = visibleEntries
                      .slice(index + 1)
                      .filter((item) => item.member_id && item.member_id === entry.member_id).length;
                    const visitNumber = previousSameMember + 1;
                    const isWalkIn = !entry.member_id;

                    return (
                      <div key={entry.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-semibold">{entry.member_name}</p>
                            {isWalkIn ? <StatusBadge tone="neutral">Séance</StatusBadge> : null}
                            {!isWalkIn && visitNumber > 1 ? (
                              <StatusBadge tone="neutral">×{visitNumber}</StatusBadge>
                            ) : null}
                          </div>
                          <p className="mt-0.5 truncate text-xs text-white/40">
                            {entry.plan ?? "Abonnement"}{entry.staff_name ? ` · ${entry.staff_name}` : ""}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="font-mono text-sm font-semibold">{formatTime(entry.checked_in_at)}</p>
                          <p className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                            <Clock3 size={11} />
                            Validé
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="px-5 py-8 text-center text-sm text-white/40">Aucune entrée aujourd&apos;hui.</p>
                )}
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/4">
              <div className="flex items-center gap-3 border-b border-white/8 px-5 py-4">
                <div className="flex size-8 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
                  <CreditCard size={15} />
                </div>
                <h2 className="font-semibold">Tarif flexible</h2>
              </div>
              <p className="px-5 py-4 text-xs leading-6 text-white/40">
                Le prix de la séance est saisi au comptoir — chaque salle peut appliquer son propre tarif sans configuration.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
