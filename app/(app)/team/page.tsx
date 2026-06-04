import { notFound } from "next/navigation";
import { ShieldCheck, UserPlus, UsersRound } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { FormField } from "@/components/form-field";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/submit-button";
import { addGymUser, deactivateGymUser, updateGymUserRole } from "@/app/(app)/team/actions";
import { getCurrentGym, getGymUsers } from "@/lib/supabase/queries";

type TeamPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR").format(new Date(value));
}

export default async function TeamPage({ searchParams }: TeamPageProps) {
  const params = await searchParams;
  const gym = await getCurrentGym();
  if (!gym) {
    notFound();
  }

  const team = await getGymUsers(gym.id);

  return (
    <AppShell>
      <PageHeader title="Equipe" eyebrow="Employes et roles" />

      <div className="grid gap-6 px-4 py-6 md:px-8 xl:grid-cols-[1fr_380px]">
        <section className="rounded-md border border-line bg-white shadow-soft">
          <div className="flex items-center justify-between border-b border-line p-5">
            <div>
              <h2 className="text-lg font-semibold">Utilisateurs de la salle</h2>
              <p className="mt-1 text-sm text-neutral-500">Admins et operateurs ayant acces a cet espace.</p>
            </div>
            <UsersRound className="text-mint" size={22} />
          </div>

          {params.success ? (
            <div className="mx-5 mt-5 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-mint">
              {params.success}
            </div>
          ) : null}

          {params.error ? (
            <div className="mx-5 mt-5 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold text-danger">
              {params.error}
            </div>
          ) : null}

          <div className="divide-y divide-line">
            {team.map((user) => (
              <div key={user.id} className="grid gap-4 p-5 text-sm xl:grid-cols-[1.2fr_0.7fr_0.8fr_1.2fr] xl:items-center">
                <div>
                  <p className="font-semibold">{user.full_name ?? "Utilisateur"}</p>
                  <p className="mt-1 font-mono text-xs text-neutral-500">{user.user_id}</p>
                </div>
                <StatusBadge tone={user.active ? "active" : "neutral"}>
                  {user.active ? "Actif" : "Desactive"}
                </StatusBadge>
                <div>
                  <p className="font-semibold">{user.role}</p>
                  <p className="mt-1 text-xs text-neutral-500">Ajoute le {formatDate(user.created_at)}</p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row xl:justify-end">
                  <form action={updateGymUserRole} className="flex gap-2">
                    <input type="hidden" name="gym_user_id" value={user.id} />
                    <select
                      name="role"
                      className="h-10 rounded-md border border-line bg-paper px-3 text-sm outline-none focus:border-mint"
                      defaultValue={user.role}
                      disabled={!user.active}
                    >
                      <option value="operator">Operator</option>
                      <option value="admin">Admin</option>
                    </select>
                    <SubmitButton className="h-10 px-3" pendingLabel="...">
                      Sauver
                    </SubmitButton>
                  </form>
                  <form action={deactivateGymUser}>
                    <input type="hidden" name="gym_user_id" value={user.id} />
                    <SubmitButton
                      variant="secondary"
                      className="h-10 border-red-200 text-danger hover:bg-red-50"
                      disabled={!user.active}
                      pendingLabel="..."
                    >
                      Desactiver
                    </SubmitButton>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="rounded-md border border-line bg-white p-5 shadow-soft">
          <div className="flex items-center gap-3 border-b border-line pb-5">
            <div className="flex size-10 items-center justify-center rounded-md bg-paper text-ink">
              <UserPlus size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Ajouter un employe</h2>
              <p className="mt-1 text-sm text-neutral-500">L&apos;utilisateur doit deja avoir un compte GymFlow.</p>
            </div>
          </div>

          <form action={addGymUser} className="mt-5 space-y-5">
            <FormField label="Email du compte">
              <input
                name="email"
                type="email"
                className="h-11 w-full rounded-md border border-line bg-paper px-3 outline-none focus:border-mint"
                placeholder="employe@salle.com"
                required
              />
            </FormField>
            <FormField label="Role">
              <select
                name="role"
                className="h-11 w-full rounded-md border border-line bg-paper px-3 outline-none focus:border-mint"
                defaultValue="operator"
              >
                <option value="operator">Operator</option>
                <option value="admin">Admin</option>
              </select>
            </FormField>
            <SubmitButton type="submit" variant="accent" className="h-11 w-full" pendingLabel="Ajout...">
              <UserPlus size={18} />
              Ajouter
            </SubmitButton>
          </form>

          <div className="mt-6 rounded-md bg-paper p-4 text-sm">
            <div className="flex items-center gap-2 font-semibold">
              <ShieldCheck size={17} />
              Roles
            </div>
            <p className="mt-2 text-neutral-500">
              Un admin gere les parametres, formules et employes. Un operator gere les membres, pointages et paiements.
            </p>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
