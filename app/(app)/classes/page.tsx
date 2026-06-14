import Link from "next/link";
import { requireAdminGym } from "@/lib/supabase/guards";
import { getClasses, getClassSessions } from "@/lib/supabase/queries";
import { Plus, Dumbbell, Clock, Users, ChevronRight, CalendarDays } from "lucide-react";

export const metadata = { title: "Cours collectifs" };

function statusBadge(status: string) {
  const map: Record<string, string> = {
    scheduled: "bg-sky-50 text-sky-700",
    ongoing: "bg-emerald-50 text-emerald-700",
    done: "bg-gray-100 text-gray-500",
    cancelled: "bg-red-50 text-red-500",
  };
  const labels: Record<string, string> = {
    scheduled: "Planifiée",
    ongoing: "En cours",
    done: "Terminée",
    cancelled: "Annulée",
  };
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${map[status] ?? "bg-gray-100 text-gray-500"}`}>
      {labels[status] ?? status}
    </span>
  );
}

export default async function ClassesPage() {
  const gym = await requireAdminGym();
  const [classes, upcomingSessions] = await Promise.all([
    getClasses(gym.id),
    getClassSessions(gym.id, { upcoming: true, limit: 10 }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Cours collectifs</h1>
          <p className="text-sm text-muted mt-0.5">Gérez vos cours et planifiez des séances</p>
        </div>
        <Link
          href="/classes/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 transition-colors"
        >
          <Plus size={15} />
          Nouveau cours
        </Link>
      </div>

      {/* Prochaines séances */}
      <section>
        <h2 className="text-sm font-semibold text-ink mb-3 flex items-center gap-2">
          <CalendarDays size={15} className="text-muted" />
          Prochaines séances
        </h2>
        {upcomingSessions.length === 0 ? (
          <p className="text-sm text-muted">Aucune séance planifiée.</p>
        ) : (
          <div className="divide-y divide-line rounded-md border border-line bg-white shadow-soft">
            {upcomingSessions.map((s) => {
              const booked = s.bookings_count ?? 0;
              const cap = s.capacity ?? "?";
              const d = new Date(s.starts_at);
              return (
                <Link
                  key={s.id}
                  href={`/classes/sessions/${s.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-paper transition-colors"
                >
                  <span
                    className="h-3 w-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: s.class_color ?? "#1E8A6A" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{s.class_name ?? "—"}</p>
                    <p className="text-xs text-muted">
                      {d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })} · {d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-muted flex items-center gap-1">
                      <Users size={12} /> {booked}/{cap}
                    </span>
                    {statusBadge(s.status)}
                    <ChevronRight size={14} className="text-muted" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Catalogue de cours */}
      <section>
        <h2 className="text-sm font-semibold text-ink mb-3 flex items-center gap-2">
          <Dumbbell size={15} className="text-muted" />
          Catalogue de cours
        </h2>
        {classes.length === 0 ? (
          <div className="rounded-md border border-dashed border-line bg-paper p-8 text-center">
            <Dumbbell size={32} className="mx-auto mb-3 text-muted/50" />
            <p className="text-sm font-medium text-ink">Aucun cours configuré</p>
            <p className="text-xs text-muted mt-1 mb-4">Créez votre premier cours pour commencer à planifier des séances.</p>
            <Link
              href="/classes/new"
              className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
            >
              <Plus size={14} /> Créer un cours
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((c) => (
              <Link
                key={c.id}
                href={`/classes/${c.id}`}
                className="rounded-md border border-line bg-white shadow-soft p-4 hover:border-emerald-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-start gap-3">
                  <span
                    className="mt-0.5 h-8 w-8 rounded-md flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${c.color}20` }}
                  >
                    <Dumbbell size={16} style={{ color: c.color }} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink truncate group-hover:text-emerald-700">{c.name}</p>
                    {c.instructor && <p className="text-xs text-muted truncate">{c.instructor}</p>}
                  </div>
                  {!c.active && (
                    <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-400">Inactif</span>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-muted">
                  <span className="flex items-center gap-1"><Clock size={11} /> {c.duration_minutes} min</span>
                  <span className="flex items-center gap-1"><Users size={11} /> max {c.capacity}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
