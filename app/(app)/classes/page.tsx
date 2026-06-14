import Link from "next/link";
import { requireAdminGym } from "@/lib/supabase/guards";
import { getClasses, getClassSessions } from "@/lib/supabase/queries";
import { Plus, Clock, Users, ChevronRight, CalendarDays, Dumbbell } from "lucide-react";

export const metadata = { title: "Cours collectifs" };

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Planifiée",
  ongoing: "En cours",
  done: "Terminée",
  cancelled: "Annulée",
};
const STATUS_STYLES: Record<string, string> = {
  scheduled: "bg-sky-50 text-sky-700",
  ongoing: "bg-emerald-50 text-emerald-700",
  done: "bg-gray-100 text-gray-500",
  cancelled: "bg-red-50 text-red-500",
};

export default async function ClassesPage() {
  const gym = await requireAdminGym();
  const [classes, upcomingSessions] = await Promise.all([
    getClasses(gym.id),
    getClassSessions(gym.id, { upcoming: true, limit: 8 }),
  ]);

  const hasData = classes.length > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Cours collectifs</h1>
          <p className="text-sm text-muted mt-0.5">
            {hasData ? `${classes.length} cours · ${upcomingSessions.length} séances à venir` : "Planifiez et gérez vos cours"}
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

          {/* Steps */}
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

      {/* Content when there's data */}
      {hasData && (
        <>
          {/* Prochaines séances */}
          <section>
            <h2 className="text-sm font-semibold text-ink mb-3 flex items-center gap-2">
              <CalendarDays size={14} className="text-muted" />
              Prochaines séances
            </h2>
            {upcomingSessions.length === 0 ? (
              <p className="text-sm text-muted rounded-md border border-dashed border-line bg-paper px-4 py-6 text-center">
                Aucune séance planifiée.{" "}
                <Link href={`/classes/${classes[0].id}/sessions/new`} className="text-emerald-600 underline underline-offset-2">
                  Planifier maintenant
                </Link>
              </p>
            ) : (
              <div className="divide-y divide-line rounded-md border border-line bg-white shadow-soft">
                {upcomingSessions.map((s) => {
                  const d = new Date(s.starts_at);
                  return (
                    <Link
                      key={s.id}
                      href={`/classes/sessions/${s.id}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-paper transition-colors"
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: s.class_color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink truncate">{s.class_name}</p>
                        <p className="text-xs text-muted">
                          {d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}
                          {" à "}
                          {d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                          {s.instructor && ` · ${s.instructor}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-muted flex items-center gap-1">
                          <Users size={11} /> {s.bookings_count}/{s.capacity}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[s.status] ?? "bg-gray-100 text-gray-500"}`}>
                          {STATUS_LABELS[s.status] ?? s.status}
                        </span>
                        <ChevronRight size={14} className="text-muted" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
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
                      className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 text-lg"
                      style={{ backgroundColor: `${c.color}1A` }}
                    >
                      🏋️
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

              {/* Add card */}
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
