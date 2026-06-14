import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminGym } from "@/lib/supabase/guards";
import { getClass, getClassSessions } from "@/lib/supabase/queries";
import { Plus, Clock, Users, ChevronRight, CalendarPlus, Pencil } from "lucide-react";

export const metadata = { title: "Cours" };

function statusBadge(status: string) {
  const map: Record<string, string> = {
    scheduled: "bg-sky-50 text-sky-700",
    ongoing: "bg-emerald-50 text-emerald-700",
    done: "bg-gray-100 text-gray-500",
    cancelled: "bg-red-50 text-red-500",
  };
  const labels: Record<string, string> = {
    scheduled: "Planifiée", ongoing: "En cours", done: "Terminée", cancelled: "Annulée",
  };
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${map[status] ?? "bg-gray-100 text-gray-500"}`}>
      {labels[status] ?? status}
    </span>
  );
}

export default async function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const gym = await requireAdminGym();
  const [cls, sessions] = await Promise.all([
    getClass(id, gym.id),
    getClassSessions(gym.id, { classId: id, limit: 20 }),
  ]);

  if (!cls) notFound();

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-start gap-4">
        <span
          className="h-12 w-12 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${cls.color}20` }}
        >
          <span className="text-2xl">🏋️</span>
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-ink">{cls.name}</h1>
            {!cls.active && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-400">Inactif</span>
            )}
          </div>
          {cls.instructor && <p className="text-sm text-muted">{cls.instructor}</p>}
          <div className="flex items-center gap-4 text-xs text-muted mt-1">
            <span className="flex items-center gap-1"><Clock size={11} /> {cls.duration_minutes} min</span>
            <span className="flex items-center gap-1"><Users size={11} /> max {cls.capacity}</span>
          </div>
        </div>
        <Link
          href={`/classes/${id}/edit`}
          className="flex items-center gap-1.5 rounded-md border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink hover:bg-paper transition-colors"
        >
          <Pencil size={12} /> Modifier
        </Link>
      </div>

      {cls.description && (
        <p className="text-sm text-muted rounded-md bg-paper border border-line px-4 py-3">{cls.description}</p>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink">Séances</h2>
        <Link
          href={`/classes/${id}/sessions/new`}
          className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors"
        >
          <CalendarPlus size={12} /> Planifier une séance
        </Link>
      </div>

      {sessions.length === 0 ? (
        <div className="rounded-md border border-dashed border-line bg-paper p-8 text-center">
          <CalendarPlus size={28} className="mx-auto mb-3 text-muted/50" />
          <p className="text-sm font-medium text-ink">Aucune séance planifiée</p>
          <p className="text-xs text-muted mt-1 mb-4">Planifiez votre première séance pour ce cours.</p>
          <Link
            href={`/classes/${id}/sessions/new`}
            className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
          >
            <Plus size={14} /> Planifier
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-line rounded-md border border-line bg-white shadow-soft">
          {sessions.map((s) => {
            const booked = s.bookings_count ?? 0;
            const cap = s.capacity ?? cls.capacity;
            const d = new Date(s.starts_at);
            return (
              <Link
                key={s.id}
                href={`/classes/sessions/${s.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-paper transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink">
                    {d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                  </p>
                  <p className="text-xs text-muted">
                    {d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    {s.instructor && ` · ${s.instructor}`}
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
    </div>
  );
}
