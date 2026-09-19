import Link from "next/link";
import { requireAdminGym } from "@/lib/supabase/guards";
import { getClasses, getClassSessions } from "@/lib/supabase/queries";
import { WeekNav } from "@/components/week-nav";
import { Plus, Clock, Users, Dumbbell, CalendarDays } from "lucide-react";

export const metadata = { title: "Cours collectifs" };

const DAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const STATUS_STYLES: Record<string, string> = {
  scheduled: "border-sky-200 bg-sky-50 text-sky-700",
  ongoing: "border-emerald-200 bg-emerald-50 text-emerald-700",
  done: "border-gray-200 bg-gray-100 text-gray-500",
  cancelled: "border-red-200 bg-red-50 text-red-500",
};

function getMondayOf(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

type PageProps = {
  searchParams: Promise<{ week?: string }>;
};

export default async function ClassesPage({ searchParams }: PageProps) {
  const { week } = await searchParams;
  const gym = await requireAdminGym();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekStart = week ? getMondayOf(new Date(week)) : getMondayOf(today);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const [classes, weekSessions] = await Promise.all([
    getClasses(gym.id),
    getClassSessions(gym.id, {
      from: weekStart.toISOString(),
      to: weekEnd.toISOString(),
    }),
  ]);

  const hasData = classes.length > 0;

  // Group sessions by day-of-week index (0=Mon … 6=Sun)
  const byDay: typeof weekSessions[] = Array.from({ length: 7 }, () => []);
  for (const s of weekSessions) {
    const d = new Date(s.starts_at);
    const dow = d.getDay(); // 0=Sun
    const idx = dow === 0 ? 6 : dow - 1; // convert to Mon=0
    byDay[idx].push(s);
  }

  const weekStartStr = weekStart.toISOString().slice(0, 10);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink">Cours collectifs</h1>
          <p className="text-sm text-muted mt-0.5">
            {hasData
              ? `${classes.length} cours · ${weekSessions.length} séance${weekSessions.length !== 1 ? "s" : ""} cette semaine`
              : "Planifiez et gérez vos cours"}
          </p>
        </div>
        <Link
          href="/classes/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 transition-colors"
        >
          <Plus size={15} />
          Nouveau cours
        </Link>
      </div>

      {/* Empty state */}
      {!hasData && (
        <div className="rounded-xl border border-dashed border-line bg-paper py-16 px-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
            <Dumbbell size={26} className="text-emerald-600" />
          </div>
          <h2 className="text-base font-semibold text-ink">Créez votre premier cours</h2>
          <p className="mt-1 text-sm text-muted max-w-xs mx-auto">
            Définissez un cours (Zumba, Yoga, CrossFit…) puis planifiez des séances avec inscriptions et pointage.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/classes/new"
              className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
            >
              <Plus size={14} /> Créer un cours
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-lg mx-auto">
            {[
              { n: "1", title: "Créez un cours", desc: "Nom, durée, capacité, couleur" },
              { n: "2", title: "Planifiez des séances", desc: "Date, heure, intervenant" },
              { n: "3", title: "Gérez les inscrits", desc: "Inscription et pointage en temps réel" },
            ].map((step) => (
              <div key={step.n} className="rounded-lg border border-line bg-white p-3 shadow-soft">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                  {step.n}
                </span>
                <p className="mt-2 text-sm font-medium text-ink">{step.title}</p>
                <p className="text-xs text-muted mt-0.5">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasData && (
        <>
          {/* Planning semaine */}
          <section>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
                <CalendarDays size={14} className="text-muted" />
                Planning de la semaine
              </h2>
              <WeekNav weekStart={weekStartStr} />
            </div>

            {/* Desktop: grille 7 colonnes */}
            <div className="hidden sm:grid sm:grid-cols-7 gap-px rounded-lg border border-line bg-line overflow-hidden shadow-soft">
              {byDay.map((sessions, i) => {
                const dayDate = new Date(weekStart);
                dayDate.setDate(dayDate.getDate() + i);
                const isToday = dayDate.toDateString() === today.toDateString();
                const isPast = dayDate < today;

                return (
                  <div
                    key={i}
                    className={`min-h-[160px] bg-white flex flex-col ${isPast ? "opacity-60" : ""}`}
                  >
                    {/* Entête jour */}
                    <div
                      className={`px-2 py-1.5 text-center border-b border-line ${isToday ? "bg-emerald-50" : "bg-paper"}`}
                    >
                      <p className={`text-xs font-semibold uppercase tracking-wide ${isToday ? "text-emerald-700" : "text-muted"}`}>
                        {DAY_LABELS[i]}
                      </p>
                      <p className={`text-sm font-bold ${isToday ? "text-emerald-700" : "text-ink"}`}>
                        {dayDate.getDate()}
                      </p>
                    </div>

                    {/* Séances */}
                    <div className="flex flex-col gap-1 p-1.5 flex-1">
                      {sessions.length === 0 ? (
                        <p className="text-[10px] text-muted text-center mt-3">—</p>
                      ) : (
                        sessions.map((s) => (
                          <Link
                            key={s.id}
                            href={`/classes/sessions/${s.id}`}
                            className={`rounded border px-1.5 py-1 text-[11px] leading-tight hover:opacity-80 transition-opacity ${STATUS_STYLES[s.status] ?? "border-gray-200 bg-gray-50 text-gray-600"}`}
                          >
                            <p className="font-semibold truncate">{s.class_name}</p>
                            <p className="opacity-75">
                              {new Date(s.starts_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                              {" · "}{s.bookings_count}/{s.capacity}
                            </p>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile: liste par jour */}
            <div className="sm:hidden space-y-3">
              {byDay.map((sessions, i) => {
                const dayDate = new Date(weekStart);
                dayDate.setDate(dayDate.getDate() + i);
                const isToday = dayDate.toDateString() === today.toDateString();
                if (sessions.length === 0) return null;

                return (
                  <div key={i} className="rounded-lg border border-line bg-white shadow-soft overflow-hidden">
                    <div className={`px-3 py-2 border-b border-line ${isToday ? "bg-emerald-50" : "bg-paper"}`}>
                      <p className={`text-xs font-semibold ${isToday ? "text-emerald-700" : "text-muted"}`}>
                        {DAY_LABELS[i]} {dayDate.getDate()} {dayDate.toLocaleDateString("fr-FR", { month: "short" })}
                        {isToday && " · Aujourd'hui"}
                      </p>
                    </div>
                    {sessions.map((s) => (
                      <Link
                        key={s.id}
                        href={`/classes/sessions/${s.id}`}
                        className="flex items-center gap-3 px-3 py-2.5 border-b border-line last:border-0 hover:bg-paper transition-colors"
                      >
                        <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: s.class_color }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ink truncate">{s.class_name}</p>
                          <p className="text-xs text-muted">
                            {new Date(s.starts_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                            {s.instructor && ` · ${s.instructor}`}
                          </p>
                        </div>
                        <span className="text-xs text-muted flex items-center gap-1 shrink-0">
                          <Users size={11} /> {s.bookings_count}/{s.capacity}
                        </span>
                      </Link>
                    ))}
                  </div>
                );
              })}
              {weekSessions.length === 0 && (
                <p className="text-sm text-muted text-center py-8 rounded-lg border border-dashed border-line bg-paper">
                  Aucune séance cette semaine.
                </p>
              )}
            </div>
          </section>

          {/* Catalogue */}
          <section>
            <h2 className="text-sm font-semibold text-ink mb-3 flex items-center gap-2">
              <Dumbbell size={14} className="text-muted" />
              Catalogue de cours
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {classes.map((c) => (
                <Link
                  key={c.id}
                  href={`/classes/${c.id}`}
                  className="group rounded-lg border border-line bg-white shadow-soft p-4 hover:border-emerald-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${c.color}1A` }}
                    >
                      <Dumbbell size={17} style={{ color: c.color }} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink truncate group-hover:text-emerald-700 transition-colors">{c.name}</p>
                      {c.instructor && <p className="text-xs text-muted truncate">{c.instructor}</p>}
                    </div>
                    {!c.active && (
                      <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-400">Inactif</span>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-xs text-muted border-t border-line pt-3">
                    <span className="flex items-center gap-1"><Clock size={11} /> {c.duration_minutes} min</span>
                    <span className="flex items-center gap-1"><Users size={11} /> {c.capacity} places max</span>
                  </div>
                </Link>
              ))}
              <Link
                href="/classes/new"
                className="rounded-lg border border-dashed border-line bg-paper p-4 flex items-center justify-center gap-2 text-sm text-muted hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all"
              >
                <Plus size={15} /> Ajouter un cours
              </Link>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
