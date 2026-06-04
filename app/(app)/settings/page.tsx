import { notFound } from "next/navigation";
import { Building2, CheckCircle2, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { FormField } from "@/components/form-field";
import { PageHeader } from "@/components/page-header";
import { SubmitButton } from "@/components/submit-button";
import { updateGymSettings } from "@/app/(app)/settings/actions";
import { getCurrentGym, getGymSettings } from "@/lib/supabase/queries";

type SettingsPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const params = await searchParams;
  const gym = await getCurrentGym();
  if (!gym) {
    notFound();
  }

  const settings = await getGymSettings(gym.id);
  if (!settings) {
    notFound();
  }

  return (
    <AppShell>
      <PageHeader title="Parametres" eyebrow="Salle et organisation" />

      <div className="grid gap-6 px-4 py-6 md:px-8 xl:grid-cols-[1fr_360px]">
        <form action={updateGymSettings} className="rounded-md border border-line bg-white p-5 shadow-soft">
          <div className="flex items-center gap-3 border-b border-line pb-5">
            <div className="flex size-10 items-center justify-center rounded-md bg-paper text-ink">
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Informations salle</h2>
              <p className="mt-1 text-sm text-neutral-500">Ces informations identifient ton espace GymFlow.</p>
            </div>
          </div>

          {params.success ? (
            <div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-mint">
              {params.success}
            </div>
          ) : null}

          {params.error ? (
            <div className="mt-5 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold text-danger">
              {params.error}
            </div>
          ) : null}

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <FormField label="Nom de la salle">
              <input
                name="name"
                className="h-11 w-full rounded-md border border-line bg-paper px-3 outline-none focus:border-mint"
                defaultValue={settings.name}
                required
              />
            </FormField>
            <FormField label="Telephone">
              <input
                name="phone"
                className="h-11 w-full rounded-md border border-line bg-paper px-3 outline-none focus:border-mint"
                defaultValue={settings.phone ?? ""}
                placeholder="+221 77 123 45 67"
              />
            </FormField>
            <FormField label="Adresse">
              <input
                name="address"
                className="h-11 w-full rounded-md border border-line bg-paper px-3 outline-none focus:border-mint"
                defaultValue={settings.address ?? ""}
                placeholder="Dakar Plateau"
              />
            </FormField>
            <FormField label="Devise">
              <select
                name="currency"
                className="h-11 w-full rounded-md border border-line bg-paper px-3 outline-none focus:border-mint"
                defaultValue={settings.currency}
              >
                <option value="XOF">F CFA</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </FormField>
          </div>

          <div className="mt-6 flex justify-end">
            <SubmitButton type="submit" variant="accent" className="h-11" pendingLabel="Enregistrement...">
              <CheckCircle2 size={18} />
              Enregistrer
            </SubmitButton>
          </div>
        </form>

        <aside className="rounded-md border border-line bg-white p-5 shadow-soft">
          <div className="flex items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-md bg-emerald-50 text-mint">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Acces</h2>
              <p className="mt-1 text-sm text-neutral-500">Ton role actuel dans cette salle.</p>
            </div>
          </div>

          <div className="mt-5 rounded-md bg-paper p-4">
            <p className="text-xs font-semibold uppercase text-neutral-500">Role</p>
            <p className="mt-2 font-semibold">{gym.role}</p>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
