import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminGym } from "@/lib/supabase/guards";
import { getClassSession, getClassBookings, getMembers } from "@/lib/supabase/queries";
import { checkinBooking, removeBooking, bookMember, cancelClassSession } from "../../actions";
import { Users, CheckCircle2, Circle, Trash2, UserPlus, ChevronLeft, XCircle } from "lucide-react";

export const metadata = { title: "Séance" };

function statusBadge(status: string) {
  const map: Record<string, string> = {
    scheduled: "bg-sky-50 text-sky-700 border border-sky-200",
    ongoing: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    done: "bg-gray-100 text-gray-500 border border-gray-200",
    cancelled: "bg-red-50 text-red-500 border border-red-200",
  };
  const labels: Record<string, string> = {
    scheduled: "Planifiée", ongoing: "En cours", done: "Terminée", cancelled: "Annulée",
  };
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status] ?? "bg-gray-100 text-gray-500"}`}>
      {labels[status] ?? status}
    </span>
  );
}

export default async function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const gym = await requireAdminGym();
  const [session, bookings, members] = await Promise.all([
    getClassSession(id, gym.id),
    getClassBookings(gym.id, id),
    getMembers(gym.id),
  ]);

  if (!session) notFound();

  const bookedIds = new Set(bookings.map((b) => b.member_id));
  const availableMembers = members.filter((m) => !bookedIds.has(m.id));
  const checkedInCount = bookings.filter((b) => b.checked_in).length;
  const starts = new Date(session.starts_at);
  const ends = new Date(session.ends_at);
  const isCancelled = session.status === "cancelled";

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <Link href={`/classes/${session.class_id}`} className="flex items-center gap-1 text-xs text-muted hover:text-ink mb-3 w-fit">
          <ChevronLeft size={13} /> Retour au cours
        </Link>
        <div className="flex items-start gap-3">
          <span
            className="h-3 w-3 rounded-full mt-1.5 shrink-0"
            style={{ backgroundColor: session.class_color }}
          />
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-ink">{session.class_name}</h1>
            <p className="text-sm text-muted">
              {starts.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              {" · "}
              {starts.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
              {" – "}
              {ends.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </p>
            {session.instructor && <p className="text-xs text-muted mt-0.5">{session.instructor}</p>}
          </div>
          {statusBadge(session.status)}
        </div>
        {session.notes && (
          <p className="mt-3 rounded-md bg-amber-50 border border-amber-100 px-3 py-2 text-xs text-amber-700">{session.notes}</p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-md border border-line bg-white shadow-soft p-3 text-center">
          <p className="text-2xl font-bold text-ink">{bookings.length}</p>
          <p className="text-xs text-muted mt-0.5">Inscrits</p>
        </div>
        <div className="rounded-md border border-line bg-white shadow-soft p-3 text-center">
          <p className="text-2xl font-bold text-emerald-600">{checkedInCount}</p>
          <p className="text-xs text-muted mt-0.5">Présents</p>
        </div>
        <div className="rounded-md border border-line bg-white shadow-soft p-3 text-center">
          <p className="text-2xl font-bold text-ink">{session.capacity - bookings.length}</p>
          <p className="text-xs text-muted mt-0.5">Places libres</p>
        </div>
      </div>

      {/* Liste des inscrits */}
      <section>
        <h2 className="text-sm font-semibold text-ink mb-3 flex items-center gap-2">
          <Users size={15} className="text-muted" />
          Inscrits ({bookings.length}/{session.capacity})
        </h2>

        {bookings.length === 0 ? (
          <p className="text-sm text-muted">Aucune inscription pour cette séance.</p>
        ) : (
          <div className="divide-y divide-line rounded-md border border-line bg-white shadow-soft">
            {bookings.map((b) => (
              <div key={b.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink">{b.member_name}</p>
                  {b.member_phone && <p className="text-xs text-muted">{b.member_phone}</p>}
                  {b.checked_in && b.checked_in_at && (
                    <p className="text-xs text-emerald-600">
                      Pointé à {new Date(b.checked_in_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!b.checked_in && !isCancelled ? (
                    <form action={checkinBooking}>
                      <input type="hidden" name="booking_id" value={b.id} />
                      <input type="hidden" name="session_id" value={session.id} />
                      <button
                        type="submit"
                        className="flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"
                      >
                        <Circle size={12} /> Pointer
                      </button>
                    </form>
                  ) : (
                    <CheckCircle2 size={16} className="text-emerald-500" />
                  )}
                  <form action={removeBooking}>
                    <input type="hidden" name="booking_id" value={b.id} />
                    <input type="hidden" name="session_id" value={session.id} />
                    <button
                      type="submit"
                      className="p-1 rounded text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Ajouter un membre */}
      {!isCancelled && bookings.length < session.capacity && availableMembers.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-ink mb-3 flex items-center gap-2">
            <UserPlus size={15} className="text-muted" />
            Inscrire un membre
          </h2>
          <form action={bookMember} className="flex gap-2">
            <input type="hidden" name="session_id" value={session.id} />
            <select
              name="member_id"
              required
              className="flex-1 rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            >
              <option value="">Sélectionner un membre...</option>
              {availableMembers.map((m) => (
                <option key={m.id} value={m.id}>{m.full_name}</option>
              ))}
            </select>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
            >
              <UserPlus size={14} /> Inscrire
            </button>
          </form>
        </section>
      )}

      {/* Actions séance */}
      {!isCancelled && (
        <form action={cancelClassSession} className="pt-2">
          <input type="hidden" name="session_id" value={session.id} />
          <input type="hidden" name="class_id" value={session.class_id} />
          <button
            type="submit"
            onClick={(e) => { if (!confirm("Annuler cette séance ?")) e.preventDefault(); }}
            className="flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
          >
            <XCircle size={14} /> Annuler la séance
          </button>
        </form>
      )}
    </div>
  );
}
