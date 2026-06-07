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
import { StatusBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/submit-button";
import { performMemberCheckin, performWalkInCheckin } from "@/app/(app)/checkin/actions";
import { getCheckinCandidates, getCurrentGym, getTodayCheckins } from "@/lib/supabase/queries";

type CheckinPageProps = {
  searchParams: Promise<{
    error?: string;
    q?: string;
    success?: string;
  }>;
};

const paymentMethods = [
  { value: "cash", label: "Especes" },
  { value: "wave", label: "Wave" },
  { value: "orange_money", label: "Orange Money" },
  { value: "card", label: "Carte" },
  { value: "other", label: "Autre" },
];

function formatTime(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDate(value: string | null) {
  if (!value) return "-";
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

  const activeCandidates = allCandidates.filter((member) => member.status === "active").length;
  const warningCandidates = allCandidates.filter((member) => member.status === "warning").length;
  const expiredCandidates = allCandidates.filter((member) => member.status === "expired").length;
  const repeatVisits = Array.from(checkinsByMember.values()).filter((visit) => visit.count > 1).length;
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

  const stats = [
    {
      label: "Entrees du jour",
      value: String(checkins.length),
      detail: `${memberCheckins.length} membres · ${walkInCheckins.length} seances simples`,
      icon: Activity,
    },
    {
      label: "Membres pointables",
      value: String(activeCandidates + warningCandidates),
      detail: `${warningCandidates} a surveiller`,
      icon: Users,
    },
    {
      label: "Passages multiples",
      value: String(repeatVisits),
      detail: "matin + soir possibles",
      icon: Repeat2,
    },
    {
      label: "Bloques",
      value: String(expiredCandidates),
      detail: "abonnement expire",
      icon: AlertTriangle,
    },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Pointage"
        eyebrow={`${checkins.length} entree${checkins.length > 1 ? "s" : ""} aujourd'hui`}
      />

      <div className="px-4 py-6 md:px-8">
        <section className="rounded-md border border-neutral-900 bg-ink p-5 text-white shadow-soft md:p-6">
          <div className="grid gap-6 xl:grid-cols-[1fr_0.72fr] xl:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-white/70">
                <ShieldCheck size={14} />
                Pointage comptoir
              </div>
              <h2 className="mt-4 text-2xl font-semibold md:text-3xl">Une entree, un bouton, zero confusion</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
                Choisis une seance simple ou cherche un membre abonne. Le journal se met a jour aussitot.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="border-l border-white/15 pl-4">
                <p className="text-xs font-medium uppercase tracking-[0.08em] text-white/45">Abonnes</p>
                <p className="mt-2 text-xl font-semibold">{memberCheckins.length}</p>
              </div>
              <div className="border-l border-white/15 pl-4">
                <p className="text-xs font-medium uppercase tracking-[0.08em] text-white/45">Seances</p>
                <p className="mt-2 text-xl font-semibold">{walkInCheckins.length}</p>
              </div>
              <div className="border-l border-white/15 pl-4">
                <p className="text-xs font-medium uppercase tracking-[0.08em] text-white/45">Retours</p>
                <p className="mt-2 text-xl font-semibold">{repeatVisits}</p>
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

        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_400px]">
          <section className="space-y-6">
            <form action={performWalkInCheckin} className="rounded-md border border-line bg-white shadow-soft">
              <div className="flex flex-col gap-3 border-b border-line p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Client sans abonnement</h2>
                  <p className="mt-1 text-sm text-neutral-500">Encaisse une seance puis valide l&apos;entree.</p>
                </div>
                <div className="inline-flex w-fit items-center gap-2 rounded-md bg-ink px-3 py-2 text-sm font-semibold text-white">
                  <Banknote size={16} />
                  Seance simple
                </div>
              </div>

              <div className="grid gap-5 p-5 lg:grid-cols-[1fr_360px]">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Prix de la seance">
                    <div className="relative">
                      <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                      <input
                        name="amount"
                        type="number"
                        min="1"
                        className="h-14 w-full rounded-md border border-line bg-paper pl-10 pr-3 text-lg font-semibold outline-none focus:border-mint"
                        placeholder="Ex: 3000"
                        required
                      />
                    </div>
                  </FormField>

                  <FormField label="Mode de paiement">
                    <select
                      name="method"
                      className="h-14 w-full rounded-md border border-line bg-paper px-3 text-base font-semibold outline-none focus:border-mint"
                      defaultValue="cash"
                    >
                      {paymentMethods.map((method) => (
                        <option key={method.value} value={method.value}>
                          {method.label}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <div className="sm:col-span-2">
                    <FormField label="Nom client facultatif">
                      <input
                        name="customer_name"
                        className="h-12 w-full rounded-md border border-line bg-paper px-3 outline-none focus:border-mint"
                        placeholder="Client comptoir"
                      />
                    </FormField>
                  </div>
                </div>

                <div className="rounded-md border border-line bg-paper p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-white text-ink">
                      <UserCheck size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Session connectee</p>
                      <p className="mt-1 text-sm leading-5 text-neutral-500">Le proprietaire ou l&apos;employe connecte valide directement.</p>
                    </div>
                  </div>
                  <SubmitButton
                    type="submit"
                    variant="accent"
                    className="mt-4 h-14 w-full justify-between px-5 text-base shadow-[0_14px_30px_rgba(30,138,106,0.25)]"
                    pendingLabel="Encaissement..."
                  >
                    <span className="inline-flex items-center gap-2">
                      <DoorOpen size={20} />
                      Encaisser la seance
                    </span>
                    <CheckCircle2 size={18} />
                  </SubmitButton>
                </div>
              </div>
            </form>

            <div className="rounded-md border border-line bg-white shadow-soft">
              <div className="border-b border-line p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">Membre abonne</h2>
                    <p className="mt-1 text-sm text-neutral-500">Recherche le membre, puis valide son passage.</p>
                  </div>
                  <div className="inline-flex w-fit items-center gap-2 rounded-md bg-paper px-3 py-2 text-sm font-semibold text-neutral-700">
                    <Sparkles size={16} />
                    Abonnement
                  </div>
                </div>
              </div>
              <div className="p-5">
                <form className="flex flex-col gap-3 sm:flex-row" action="/checkin">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                    <input
                      className="h-14 w-full rounded-md border border-line bg-paper pl-12 pr-4 text-base outline-none focus:border-mint"
                      name="q"
                      placeholder="Nom, telephone ou numero"
                      defaultValue={params.q ?? ""}
                    />
                  </div>
                  <button className="inline-flex h-14 items-center justify-center gap-2 rounded-md bg-ink px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800">
                    <Search size={18} />
                    Rechercher
                  </button>
                </form>

                {params.success ? (
                  <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-mint">
                    {params.success}
                  </div>
                ) : null}
                {params.error ? (
                  <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-danger">
                    {params.error}
                  </div>
                ) : null}

                <div className="mt-5 space-y-3">
                  {sortedCandidates.length > 0 ? (
                    sortedCandidates.map((member) => {
                      const visit = checkinsByMember.get(member.id);

                      return (
                        <div key={member.id} className={`rounded-md border p-4 transition ${visit ? "border-mint/30 bg-emerald-50/40" : "border-line bg-white"}`}>
                          <div className="grid gap-4 lg:grid-cols-[1fr_310px] lg:items-center">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-3">
                                <p className="text-base font-semibold">{member.full_name}</p>
                                <StatusBadge tone={member.status}>{member.status_label}</StatusBadge>
                                {visit ? (
                                  <StatusBadge tone="neutral">
                                    {visit.count} passage{visit.count > 1 ? "s" : ""} aujourd&apos;hui
                                  </StatusBadge>
                                ) : null}
                              </div>
                              <p className="mt-1 text-sm text-neutral-500">
                                {String(member.member_number).padStart(6, "0")} · {member.plan ?? "Sans formule"} · expire le {formatDate(member.expires_at)}
                              </p>
                              <p className="mt-1 text-xs text-neutral-500">
                                {member.sessions_left === null ? "Seances illimitees" : `${member.sessions_left} seance${member.sessions_left > 1 ? "s" : ""} restante${member.sessions_left > 1 ? "s" : ""}`}
                                {visit ? ` · dernier passage ${formatTime(visit.lastTime)}` : ""}
                              </p>
                            </div>
                            <form action={performMemberCheckin}>
                              <input type="hidden" name="member_id" value={member.id} />
                              <input type="hidden" name="current_q" value={params.q ?? ""} />
                              <div className="space-y-3">
                                <SubmitButton
                                  disabled={member.status === "expired"}
                                  variant={visit ? "primary" : "accent"}
                                  className="h-14 w-full justify-between px-5 text-base shadow-[0_12px_26px_rgba(23,23,23,0.12)]"
                                  pendingLabel="Validation..."
                                >
                                  <span className="inline-flex items-center gap-2">
                                    {visit ? <Repeat2 size={20} /> : <CheckCircle2 size={20} />}
                                    {visit ? "Pointer encore" : "Pointer le membre"}
                                  </span>
                                  <CheckCircle2 size={18} />
                                </SubmitButton>
                              </div>
                            </form>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="rounded-md border border-line bg-paper p-4 text-sm text-neutral-500">
                      Aucun membre trouve. Ajuste la recherche ou utilise la seance simple pour un client sans inscription.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
            <div className="rounded-md border border-line bg-white shadow-soft">
              <div className="border-b border-line p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">Journal du jour</h2>
                    <p className="mt-1 text-sm text-neutral-500">Dernieres entrees validees.</p>
                  </div>
                  <Gauge className="text-mint" size={22} />
                </div>
              </div>
              <div className="divide-y divide-line">
                {checkins.length > 0 ? (
                  checkins.slice(0, 14).map((entry, index, visibleEntries) => {
                    const previousSameMember = visibleEntries
                      .slice(index + 1)
                      .filter((item) => item.member_id && item.member_id === entry.member_id).length;
                    const visitNumber = previousSameMember + 1;
                    const isWalkIn = !entry.member_id;

                    return (
                      <div key={entry.id} className="flex items-center justify-between gap-4 p-5">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate font-semibold">{entry.member_name}</p>
                            {isWalkIn ? <StatusBadge tone="neutral">Seance</StatusBadge> : null}
                            {!isWalkIn && visitNumber > 1 ? (
                              <StatusBadge tone="neutral">Passage {visitNumber}</StatusBadge>
                            ) : null}
                          </div>
                          <p className="mt-1 truncate text-sm text-neutral-500">
                            {entry.plan ?? "Abonnement"}{entry.staff_name ? ` · ${entry.staff_name}` : ""}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="font-mono text-sm font-semibold">{formatTime(entry.checked_in_at)}</p>
                          <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-mint">
                            <Clock3 size={12} />
                            Valide
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="p-5 text-sm text-neutral-500">Aucune entree aujourd&apos;hui.</p>
                )}
              </div>
            </div>

            <div className="rounded-md border border-line bg-white p-5 shadow-soft">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-paper text-ink">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Tarif flexible</h2>
                  <p className="mt-1 text-sm leading-6 text-neutral-500">
                    Le prix de la seance est saisi au comptoir, donc chaque salle peut appliquer son propre tarif.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
