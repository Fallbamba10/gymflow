import { notFound } from "next/navigation";
import { requireAdminGym } from "@/lib/supabase/guards";
import { getClass } from "@/lib/supabase/queries";
import { updateClass, deleteClass } from "../../actions";

export const metadata = { title: "Modifier le cours" };

const COLORS = [
  "#1E8A6A", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6",
  "#EC4899", "#14B8A6", "#F97316", "#6366F1", "#84CC16",
];

export default async function EditClassPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const gym = await requireAdminGym();
  const cls = await getClass(id, gym.id);
  if (!cls) notFound();

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-ink">Modifier le cours</h1>
        <p className="text-sm text-muted mt-0.5">{cls.name}</p>
      </div>

      <form action={updateClass} className="space-y-5 rounded-md border border-line bg-white shadow-soft p-6">
        <input type="hidden" name="class_id" value={cls.id} />

        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">Nom du cours *</label>
          <input
            name="name"
            required
            defaultValue={cls.name}
            className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">Intervenant</label>
          <input
            name="instructor"
            defaultValue={cls.instructor ?? ""}
            className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">Description</label>
          <textarea
            name="description"
            rows={3}
            defaultValue={cls.description ?? ""}
            className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Durée (min) *</label>
            <input
              name="duration_minutes"
              type="number"
              min={15}
              max={300}
              defaultValue={cls.duration_minutes}
              required
              className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Capacité max *</label>
            <input
              name="capacity"
              type="number"
              min={1}
              max={200}
              defaultValue={cls.capacity}
              required
              className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-2">Couleur</label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <label key={c} className="cursor-pointer">
                <input
                  type="radio"
                  name="color"
                  value={c}
                  defaultChecked={cls.color === c}
                  className="sr-only peer"
                />
                <span
                  className="block h-7 w-7 rounded-full border-2 border-transparent peer-checked:border-ink peer-checked:scale-110 transition-transform"
                  style={{ backgroundColor: c }}
                />
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="active"
            name="active"
            value="true"
            defaultChecked={cls.active}
            className="rounded border-line text-emerald-600 focus:ring-emerald-500/40"
          />
          <label htmlFor="active" className="text-sm text-ink">Cours actif</label>
        </div>

        <div className="flex gap-3 pt-2">
          <a href={`/classes/${cls.id}`} className="flex-1 rounded-md border border-line bg-paper px-4 py-2 text-center text-sm font-medium text-ink hover:bg-white transition-colors">
            Annuler
          </a>
          <button
            type="submit"
            className="flex-1 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
          >
            Enregistrer
          </button>
        </div>
      </form>

      <form action={deleteClass} className="mt-4">
        <input type="hidden" name="class_id" value={cls.id} />
        <button
          type="submit"
          onClick={(e) => { if (!confirm("Supprimer ce cours ? Toutes les séances seront aussi supprimées.")) e.preventDefault(); }}
          className="w-full rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
        >
          Supprimer ce cours
        </button>
      </form>
    </div>
  );
}
