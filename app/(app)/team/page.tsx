import { KeyRound, ShieldCheck, UserPlus, UsersRound } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { FormField } from "@/components/form-field";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/submit-button";
import {
  addGymStaff,
  addGymUser,
  deactivateGymStaff,
  deactivateGymUser,
  updateGymStaffRole,
  updateGymUserRole,
} from "@/app/(app)/team/actions";
import { requireAdminGym } from "@/lib/supabase/guards";
import { getGymStaff, getGymUsers } from "@/lib/supabase/queries";

const inputCls =
  "h-11 w-full rounded-xl border border-white/10 bg-white/6 px-3.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-emerald-500/60 focus:bg-white/8";

const selectCls =
  "h-11 w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-3.5 text-sm text-white outline-none transition focus:border-emerald-500/60";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR").format(new Date(value));
}

function formatRole(role: "admin" | "operator") {
  return role === "admin" ? "Admin" : "Opérateur";
}

export default async function TeamPage() {
  const gym = await requireAdminGym();
  const [team, staff] = await Promise.all([getGymUsers(gym.id), getGymStaff(gym.id)]);

  return (
    <AppShell>
      <PageHeader title="Équipe" eyebrow="Employés et rôles" />

      <div className="grid gap-4 px-6 py-6 md:px-8 xl:grid-cols-[1fr_340px]">
        <section className="space-y-4">

          {/* Comptes connectés */}
          <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/4">
            <div className="flex items-center justify-between border-b border-white/8 px-6 py-5">
              <div>
                <h2 className="font-semibold">Comptes connectés</h2>
                <p className="mt-0.5 text-xs text-white/40">Admins et opérateurs qui se connectent avec un email.</p>
              </div>
              <UsersRound size={18} className="text-emerald-400" />
            </div>
            <div className="divide-y divide-white/6">
              {team.map((user) => (
                <div key={user.id} className="grid gap-4 px-6 py-4 text-sm xl:grid-cols-[1.2fr_0.6fr_0.8fr_1.4fr] xl:items-center">
                  <div>
                    <p className="font-semibold">{user.full_name ?? "Utilisateur"}</p>
                    <p className="mt-0.5 font-mono text-xs text-white/35 truncate">{user.user_id}</p>
                  </div>
                  <StatusBadge tone={user.active ? "active" : "neutral"}>
                    {user.active ? "Actif" : "Désactivé"}
                  </StatusBadge>
                  <div>
                    <p className="font-semibold">{formatRole(user.role)}</p>
                    <p className="mt-0.5 text-xs text-white/35">Ajouté le {formatDate(user.created_at)}</p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row xl:justify-end">
                    <form action={updateGymUserRole} className="flex gap-2">
                      <input type="hidden" name="gym_user_id" value={user.id} />
                      <select
                        name="role"
                        className="h-9 rounded-xl border border-white/10 bg-[#0f0f0f] px-3 text-xs text-white outline-none"
                        defaultValue={user.role}
                        disabled={!user.active}
                      >
                        <option value="operator">Opérateur</option>
                        <option value="admin">Admin</option>
                      </select>
                      <SubmitButton
                        className="inline-flex h-9 items-center rounded-xl bg-emerald-500 px-3 text-xs font-semibold text-white transition hover:bg-emerald-400"
                        pendingLabel="…"
                      >
                        Sauver
                      </SubmitButton>
                    </form>
                    <form action={deactivateGymUser}>
                      <input type="hidden" name="gym_user_id" value={user.id} />
                      <SubmitButton
                        className="inline-flex h-9 w-full items-center justify-center rounded-xl border border-red-500/25 bg-red-500/10 px-3 text-xs font-semibold text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                        disabled={!user.active}
                        pendingLabel="…"
                      >
                        Désactiver
                      </SubmitButton>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Employés PIN */}
          <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/4">
            <div className="flex items-center justify-between border-b border-white/8 px-6 py-5">
              <div>
                <h2 className="font-semibold">Employés PIN</h2>
                <p className="mt-0.5 text-xs text-white/40">Employés terrain sans email, identifiés par un code PIN.</p>
              </div>
              <KeyRound size={18} className="text-emerald-400" />
            </div>
            <div className="divide-y divide-white/6">
              {staff.length > 0 ? (
                staff.map((user) => (
                  <div key={user.id} className="grid gap-4 px-6 py-4 text-sm xl:grid-cols-[1.2fr_0.6fr_0.8fr_1.4fr] xl:items-center">
                    <div>
                      <p className="font-semibold">{user.full_name}</p>
                      <p className="mt-0.5 text-xs text-white/35">Connexion locale par PIN</p>
                    </div>
                    <StatusBadge tone={user.active ? "active" : "neutral"}>
                      {user.active ? "Actif" : "Désactivé"}
                    </StatusBadge>
                    <div>
                      <p className="font-semibold">{formatRole(user.role)}</p>
                      <p className="mt-0.5 text-xs text-white/35">Ajouté le {formatDate(user.created_at)}</p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row xl:justify-end">
                      <form action={updateGymStaffRole} className="flex gap-2">
                        <input type="hidden" name="staff_id" value={user.id} />
                        <select
                          name="role"
                          className="h-9 rounded-xl border border-white/10 bg-[#0f0f0f] px-3 text-xs text-white outline-none"
                          defaultValue={user.role}
                          disabled={!user.active}
                        >
                          <option value="operator">Opérateur</option>
                          <option value="admin">Admin</option>
                        </select>
                        <SubmitButton
                          className="inline-flex h-9 items-center rounded-xl bg-emerald-500 px-3 text-xs font-semibold text-white transition hover:bg-emerald-400"
                          pendingLabel="…"
                        >
                          Sauver
                        </SubmitButton>
                      </form>
                      <form action={deactivateGymStaff}>
                        <input type="hidden" name="staff_id" value={user.id} />
                        <SubmitButton
                          className="inline-flex h-9 w-full items-center justify-center rounded-xl border border-red-500/25 bg-red-500/10 px-3 text-xs font-semibold text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                          disabled={!user.active}
                          pendingLabel="…"
                        >
                          Désactiver
                        </SubmitButton>
                      </form>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center">
                  <p className="font-semibold text-white/60">Aucun employé PIN pour le moment</p>
                  <p className="mt-1 text-xs text-white/35">Ajoute un premier employé depuis le formulaire ci-contre.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Sidebar */}
        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">

          {/* Ajouter avec PIN */}
          <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/4">
            <div className="flex items-center gap-3 border-b border-white/8 px-5 py-4">
              <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                <KeyRound size={16} />
              </div>
              <div>
                <h2 className="font-semibold">Ajouter avec PIN</h2>
                <p className="mt-0.5 text-xs text-white/40">Idéal pour les employés sans email.</p>
              </div>
            </div>
            <form action={addGymStaff} className="space-y-4 p-5">
              <FormField label="Nom employé">
                <input name="full_name" className={inputCls} placeholder="Moussa" required />
              </FormField>
              <FormField label="PIN">
                <input
                  name="pin"
                  inputMode="numeric"
                  pattern="[0-9]{4,8}"
                  className={inputCls}
                  placeholder="1234"
                  required
                />
              </FormField>
              <FormField label="Rôle">
                <select name="role" className={selectCls} defaultValue="operator">
                  <option value="operator">Opérateur</option>
                  <option value="admin">Admin</option>
                </select>
              </FormField>
              <SubmitButton
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 text-sm font-semibold text-white transition hover:bg-emerald-400"
                pendingLabel="Ajout…"
              >
                <KeyRound size={15} />
                Ajouter PIN
              </SubmitButton>
            </form>
          </div>

          {/* Ajouter par email */}
          <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/4">
            <div className="flex items-center gap-3 border-b border-white/8 px-5 py-4">
              <div className="flex size-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
                <UserPlus size={16} />
              </div>
              <div>
                <h2 className="font-semibold">Ajouter un employé</h2>
                <p className="mt-0.5 text-xs text-white/40">L&apos;utilisateur doit déjà avoir un compte GymFlow.</p>
              </div>
            </div>
            <form action={addGymUser} className="space-y-4 p-5">
              <FormField label="Email du compte">
                <input
                  name="email"
                  type="email"
                  className={inputCls}
                  placeholder="employe@salle.com"
                  required
                />
              </FormField>
              <FormField label="Rôle">
                <select name="role" className={selectCls} defaultValue="operator">
                  <option value="operator">Opérateur</option>
                  <option value="admin">Admin</option>
                </select>
              </FormField>
              <SubmitButton
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 text-sm font-semibold text-white transition hover:bg-emerald-400"
                pendingLabel="Ajout…"
              >
                <UserPlus size={15} />
                Ajouter
              </SubmitButton>
            </form>

            <div className="mx-5 mb-5 rounded-xl border border-white/8 bg-white/3 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <ShieldCheck size={14} className="text-emerald-400" />
                Rôles
              </div>
              <p className="mt-2 text-xs leading-5 text-white/40">
                Un admin gère les paramètres, formules et employés. Un opérateur gère les membres, pointages et paiements.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
