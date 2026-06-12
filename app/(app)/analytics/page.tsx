import { redirect } from "next/navigation";
import {
  Activity,
  Clock3,
  Crown,
  Flame,
  TrendingUp,
  UserCheck,
  Users,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { requireAdminGym } from "@/lib/supabase/guards";
import { getAnalyticsData } from "@/lib/supabase/queries";

function formatHour(h: number) {
  return `${String(h).padStart(2, "0")}h`;
}

function BarChart({
  data,
  maxValue,
  colorClass = "bg-mint",
  labelKey,
  valueKey,
}: {
  data: Record<string, unknown>[];
  maxValue: number;
  colorClass?: string;
  labelKey: string;
  valueKey: string;
}) {
  return (
    <div className="flex h-32 items-end gap-1">
      {data.map((item, i) => {
        const val = item[valueKey] as number;
        const pct = maxValue > 0 ? (val / maxValue) * 100 : 0;
        return (
          <div key={i} className="group relative flex flex-1 flex-col items-center gap-1">
            {val > 0 && (
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-ink px-1.5 py-0.5 text-[10px] font-semibold text-white opacity-0 transition group-hover:opacity-100">
                {val}
              </div>
            )}
            <div
              className={`w-full rounded-t transition-all ${colorClass} ${pct === 0 ? "opacity-20" : ""}`}
              style={{ height: `${Math.max(pct, 2)}%` }}
            />
            <span className="text-[9px] text-neutral-500">{item[labelKey] as string}</span>
          </div>
        );
      })}
    </div>
  );
}

export default async function AnalyticsPage() {
  const gym = await requireAdminGym();
  if (!gym) redirect("/");

  const data = await getAnalyticsData(gym.id);

  const maxHour = Math.max(...data.byHour.map((h) => h.count), 1);
  const maxDay = Math.max(...data.last30Days.map((d) => d.count), 1);
  const maxWeekday = Math.max(...data.byWeekday.map((d) => d.count), 1);

  const kpis = [
    {
      icon: UserCheck,
      label: "Pointages (30j)",
      value: data.totalCheckins30d,
      sub: `Moy. ${data.avgCheckinsPerDay}/jour`,
      color: "text-mint",
      bg: "bg-mint/10",
    },
    {
      icon: Flame,
      label: "Heure de pointe",
      value: formatHour(data.peakHour),
      sub: "Heure la plus chargée",
      color: "text-amber-400",
      bg: "bg-amber-400/10",
    },
    {
      icon: Zap,
      label: "Jour de pointe",
      value: data.peakDay,
      sub: "Jour le plus fréquenté",
      color: "text-violet-400",
      bg: "bg-violet-400/10",
    },
    {
      icon: Users,
      label: "Top membre",
      value: data.topMembers[0]?.count ?? 0,
      sub: data.topMembers[0]?.name ?? "-",
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Analytics"
        eyebrow="Fréquentation & tendances"
        actions={
          <div className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold text-neutral-500 shadow-soft">
            <Activity size={15} className="text-mint" />
            30 derniers jours
          </div>
        }
      />

      <div className="space-y-6 px-4 py-6 md:px-8">

        {/* KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="rounded-xl border border-line bg-white p-5 shadow-soft">
              <div className={`mb-4 flex size-10 items-center justify-center rounded-xl ${kpi.bg}`}>
                <kpi.icon size={18} className={kpi.color} />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">
                {kpi.label}
              </p>
              <p className="mt-1 text-3xl font-semibold tracking-tight">{kpi.value}</p>
              <p className="mt-1 text-xs text-neutral-400">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* Évolution 30 jours */}
        <div className="rounded-xl border border-line bg-white p-6 shadow-soft">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">
                Évolution
              </p>
              <h2 className="mt-1 text-lg font-semibold">Pointages — 30 derniers jours</h2>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-paper px-3 py-1.5">
              <TrendingUp size={14} className="text-mint" />
              <span className="text-sm font-semibold">{data.totalCheckins30d} total</span>
            </div>
          </div>

          <div className="flex h-40 items-end gap-0.5">
            {data.last30Days.map((d, i) => {
              const pct = maxDay > 0 ? (d.count / maxDay) * 100 : 0;
              const isToday = i === 29;
              return (
                <div key={d.date} className="group relative flex flex-1 flex-col items-center gap-1">
                  {d.count > 0 && (
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-ink px-1.5 py-0.5 text-[10px] font-semibold text-white opacity-0 transition group-hover:opacity-100">
                      {d.count} · {d.date.slice(5)}
                    </div>
                  )}
                  <div
                    className={`w-full rounded-t transition-all ${isToday ? "bg-mint" : "bg-mint/40"} ${pct === 0 ? "opacity-20" : ""}`}
                    style={{ height: `${Math.max(pct, 2)}%` }}
                  />
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex justify-between text-[10px] text-neutral-400">
            <span>{data.last30Days[0]?.date.slice(5)}</span>
            <span>{data.last30Days[14]?.date.slice(5)}</span>
            <span>Aujourd&apos;hui</span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Par heure */}
          <div className="rounded-xl border border-line bg-white p-6 shadow-soft">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">
                Distribution horaire
              </p>
              <h2 className="mt-1 text-lg font-semibold">Fréquentation par heure</h2>
              <p className="mt-1 text-xs text-neutral-400">
                Heure de pointe : <span className="font-semibold text-mint">{formatHour(data.peakHour)}</span>
              </p>
            </div>
            <BarChart
              data={data.byHour.map((h) => ({
                label: h.hour % 3 === 0 ? formatHour(h.hour) : "",
                count: h.count,
              }))}
              maxValue={maxHour}
              colorClass="bg-mint"
              labelKey="label"
              valueKey="count"
            />
          </div>

          {/* Par jour de semaine */}
          <div className="rounded-xl border border-line bg-white p-6 shadow-soft">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">
                Distribution hebdomadaire
              </p>
              <h2 className="mt-1 text-lg font-semibold">Fréquentation par jour</h2>
              <p className="mt-1 text-xs text-neutral-400">
                Jour de pointe : <span className="font-semibold text-violet-500">{data.peakDay}</span>
              </p>
            </div>
            <BarChart
              data={data.byWeekday.map((d) => ({
                label: d.label,
                count: d.count,
              }))}
              maxValue={maxWeekday}
              colorClass="bg-violet-400"
              labelKey="label"
              valueKey="count"
            />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Top membres */}
          <div className="rounded-xl border border-line bg-white shadow-soft">
            <div className="border-b border-line px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-amber-400/10">
                  <Crown size={16} className="text-amber-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">
                    Classement
                  </p>
                  <h2 className="text-base font-semibold">Top membres assidus</h2>
                </div>
              </div>
            </div>
            <div className="divide-y divide-line">
              {data.topMembers.length === 0 ? (
                <p className="px-6 py-8 text-center text-sm text-neutral-400">
                  Aucun pointage membre enregistré.
                </p>
              ) : (
                data.topMembers.map((m, i) => (
                  <div key={m.id} className="flex items-center gap-4 px-6 py-3.5">
                    <div
                      className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                        i === 0
                          ? "bg-amber-400 text-white"
                          : i === 1
                          ? "bg-neutral-300 text-neutral-700"
                          : i === 2
                          ? "bg-amber-700/60 text-white"
                          : "bg-paper text-neutral-400"
                      }`}
                    >
                      {i + 1}
                    </div>
                    <p className="min-w-0 flex-1 truncate text-sm font-semibold">{m.name}</p>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-1.5 rounded-full bg-amber-400"
                        style={{
                          width: `${Math.round((m.count / (data.topMembers[0]?.count || 1)) * 64)}px`,
                        }}
                      />
                      <span className="w-8 text-right text-sm font-semibold tabular-nums">
                        {m.count}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Nouveaux membres par semaine */}
          <div className="rounded-xl border border-line bg-white p-6 shadow-soft">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-blue-400/10">
                <Clock3 size={16} className="text-blue-400" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">
                  Croissance
                </p>
                <h2 className="text-base font-semibold">Nouveaux membres / semaine</h2>
              </div>
            </div>

            <div className="space-y-3">
              {data.newMembersByWeek.map((w, i) => {
                const maxW = Math.max(...data.newMembersByWeek.map((x) => x.count), 1);
                const pct = (w.count / maxW) * 100;
                const isLatest = i === data.newMembersByWeek.length - 1;
                return (
                  <div key={w.week} className="flex items-center gap-3">
                    <span className="w-12 shrink-0 text-xs text-neutral-400">{w.week}</span>
                    <div className="relative flex-1 overflow-hidden rounded-full bg-paper" style={{ height: "8px" }}>
                      <div
                        className={`h-full rounded-full transition-all ${isLatest ? "bg-blue-400" : "bg-blue-400/40"}`}
                        style={{ width: `${Math.max(pct, w.count > 0 ? 4 : 0)}%` }}
                      />
                    </div>
                    <span className="w-6 text-right text-sm font-semibold tabular-nums">{w.count}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 rounded-xl border border-line bg-paper p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">
                Total 4 semaines
              </p>
              <p className="mt-1 text-2xl font-semibold">
                {data.newMembersByWeek.reduce((s, w) => s + w.count, 0)}
                <span className="ml-2 text-sm font-normal text-neutral-400">nouveaux membres</span>
              </p>
            </div>
          </div>
        </div>

      </div>
    </AppShell>
  );
}

