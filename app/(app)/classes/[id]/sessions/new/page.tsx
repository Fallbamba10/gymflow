import { notFound } from "next/navigation";
import { requireAdminGym } from "@/lib/supabase/guards";
import { getClass } from "@/lib/supabase/queries";
import { createClassSession } from "../../../actions";

export const metadata = { title: "Planifier une séance" };

export default async function NewSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const gym = await requireAdminGym();
  const cls = await getClass(id, gym.id);
  if (!cls) notFound();

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-ink">Planifier une séance</h1>
        <p className="text-sm text-muted mt-0.5">{cls.name}</p>
      </div>

      <form action={createClassSession} className="space-y-5 rounded-md border border-line bg-white shadow-soft p-6">
        <input type="hidden" name="class_id" value={cls.id} />
        <input type="hidden" name="duration_minutes" value={cls.duration_minutes} />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Date *</label>
            <input
              name="date"
              type="date"
              required
              defaultValue={today}
              min={today}
              className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Heure *</label>
            <input
              name="time"
              type="time"
              required
              defaultValue="09:00"
              className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">
            Intervenant <span className="text-muted font-normal">(laissez vide pour utiliser {cls.instructor ?? "celui du cours"})</span>
          </label>
          <input
            name="instructor"
            placeholder={cls.instructor ?? "Intervenant pour cette séance"}
            className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">
            Capacité <span className="text-muted font-normal">(défaut: {cls.capacity})</span>
          </label>
          <input
            name="capacity"
            type="number"
            min={1}
            max={500}
            placeholder={String(cls.capacity)}
            className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">Notes</label>
          <textarea
            name="notes"
            rows={2}
            placeholder="Instructions particulières, matériel nécessaire..."
            className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-none"
          />
        </div>

        <div className="rounded-md bg-emerald-50 border border-emerald-100 px-3 py-2 text-xs text-emerald-700">
          Durée : {cls.duration_minutes} min — la séance se terminera automatiquement {cls.duration_minutes} min après l&apos;heure de début.
        </div>

        <div className="flex gap-3 pt-2">
          <a href={`/classes/${cls.id}`} className="flex-1 rounded-md border border-line bg-paper px-4 py-2 text-center text-sm font-medium text-ink hover:bg-white transition-colors">
            Annuler
          </a>
          <button
            type="submit"
            className="flex-1 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
          >
            Planifier
          </button>
        </div>
      </form>
    </div>
  );
}
