import { notFound } from "next/navigation";
import Link from "next/link";
import { Building2, CheckCircle2, CreditCard, DatabaseBackup, Download, ExternalLink, MapPin, Phone, ShieldCheck, UsersRound } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { FormField } from "@/components/form-field";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/submit-button";
import { updateGymSettings } from "@/app/(app)/settings/actions";
import { requireAdminGym } from "@/lib/supabase/guards";
import { getGymSettings } from "@/lib/supabase/queries";

type SettingsPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const params = await searchParams;
  const gym = await requireAdminGym();

  const settings = await getGymSettings(gym.id);
  if (!settings) {
    notFound();
  }

  const checklist = [
    {
      label: "Nom de salle",
      complete: Boolean(settings.name),
    },
    {
      label: "Telephone",
      complete: Boolean(settings.phone),
    },
    {
      label: "Adresse",
      complete: Boolean(settings.address),
    },
    {
      label: "Devise",
      complete: Boolean(settings.currency),
    },
  ];
  const completedItems = checklist.filter((item) => item.complete).length;
  const setupPercent = Math.round((completedItems / checklist.length) * 100);

  return (
    <AppShell>
      <PageHeader title="Parametres" eyebrow="Salle et organisation" />

      <div className="grid gap-6 px-4 py-6 md:px-8 xl:grid-cols-[1fr_360px]">
        <section className="space-y-6">
          <article className="rounded-md border border-line bg-white p-5 shadow-soft">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-md bg-ink text-white">
                  <Building2 size={24} />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-xl font-semibold">{settings.name}</h2>
                    <StatusBadge tone="active">Espace actif</StatusBadge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-3 text-sm text-neutral-500">
                    <span className="inline-flex items-center gap-1.5">
                      <Phone size={15} />
                      {settings.phone || "Telephone a completer"}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={15} />
                      {settings.address || "Adresse a completer"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="rounded-md border border-line bg-paper px-4 py-3">
                <p className="text-xs font-semibold uppercase text-neutral-500">Configuration</p>
                <p className="mt-1 text-xl font-semibold">{setupPercent}%</p>
              </div>
            </div>
          </article>

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

          <section className="rounded-md border border-line bg-white p-5 shadow-soft">
            <div className="flex items-center gap-3 border-b border-line pb-5">
              <div className="flex size-10 items-center justify-center rounded-md bg-paper text-ink">
                <DatabaseBackup size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Exports et sauvegarde</h2>
                <p className="mt-1 text-sm text-neutral-500">Recupere les donnees importantes de la salle.</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <Link
                href="/members/export"
                className="flex min-h-28 flex-col justify-between rounded-md border border-line bg-paper p-4 text-sm transition hover:bg-neutral-100"
              >
                <Download size={19} />
                <span>
                  <span className="block font-semibold">Membres CSV</span>
                  <span className="mt-1 block text-neutral-500">Liste exploitable dans Excel.</span>
                </span>
              </Link>
              <Link
                href="/payments/export?period=all"
                className="flex min-h-28 flex-col justify-between rounded-md border border-line bg-paper p-4 text-sm transition hover:bg-neutral-100"
              >
                <Download size={19} />
                <span>
                  <span className="block font-semibold">Caisse CSV</span>
                  <span className="mt-1 block text-neutral-500">Historique complet des paiements.</span>
                </span>
              </Link>
              <Link
                href="/settings/export"
                className="flex min-h-28 flex-col justify-between rounded-md border border-line bg-paper p-4 text-sm transition hover:bg-neutral-100"
              >
                <DatabaseBackup size={19} />
                <span>
                  <span className="block font-semibold">Sauvegarde JSON</span>
                  <span className="mt-1 block text-neutral-500">Archive complete sans PIN secrets.</span>
                </span>
              </Link>
            </div>

            <div className="mt-5 rounded-md border border-line bg-paper p-4 text-sm text-neutral-600">
              Les donnees restent stockees dans Supabase. Ces exports servent de copie locale pour controle, comptabilite ou sauvegarde ponctuelle.
            </div>
          </section>
        </section>

        <aside className="space-y-6">
          <section className="rounded-md border border-line bg-white p-5 shadow-soft">
            <div className="flex items-start gap-3">
              <div className="flex size-10 items-center justify-center rounded-md bg-emerald-50 text-mint">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Acces</h2>
                <p className="mt-1 text-sm text-neutral-500">Ton role actuel dans cette salle.</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              <div className="rounded-md bg-paper p-4">
                <p className="text-xs font-semibold uppercase text-neutral-500">Role</p>
                <p className="mt-2 font-semibold">{gym.role}</p>
              </div>
              <div className="rounded-md bg-paper p-4">
                <p className="text-xs font-semibold uppercase text-neutral-500">Devise</p>
                <p className="mt-2 font-semibold">{settings.currency}</p>
              </div>
            </div>
          </section>

          <section className="rounded-md border border-line bg-white p-5 shadow-soft">
            <h2 className="text-lg font-semibold">Checklist production</h2>
            <div className="mt-4 space-y-3">
              {checklist.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-3 rounded-md bg-paper px-3 py-2 text-sm">
                  <span className="font-semibold">{item.label}</span>
                  <StatusBadge tone={item.complete ? "active" : "warning"}>
                    {item.complete ? "OK" : "A faire"}
                  </StatusBadge>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-md border border-line bg-white p-5 shadow-soft">
            <h2 className="text-lg font-semibold">Raccourcis</h2>
            <div className="mt-4 grid gap-2">
              <Link href="/team" className="flex h-11 items-center justify-between rounded-md border border-line px-3 text-sm font-semibold hover:bg-neutral-50">
                <span className="inline-flex items-center gap-2"><UsersRound size={16} /> Equipe et PIN</span>
                <ExternalLink size={15} />
              </Link>
              <Link href="/subscriptions" className="flex h-11 items-center justify-between rounded-md border border-line px-3 text-sm font-semibold hover:bg-neutral-50">
                <span className="inline-flex items-center gap-2"><CreditCard size={16} /> Formules</span>
                <ExternalLink size={15} />
              </Link>
              <Link href="/site" className="flex h-11 items-center justify-between rounded-md border border-line px-3 text-sm font-semibold hover:bg-neutral-50">
                <span className="inline-flex items-center gap-2"><Building2 size={16} /> Page publique</span>
                <ExternalLink size={15} />
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}
