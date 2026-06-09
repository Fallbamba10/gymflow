import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  Clock3,
  CreditCard,
  DatabaseBackup,
  Download,
  ExternalLink,
  Image as ImageIcon,
  Instagram,
  MapPin,
  MessageCircle,
  Music2,
  Phone,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { CoverImageUpload } from "@/components/cover-image-upload";
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
    {
      label: "Vitrine publique",
      complete: Boolean(settings.public_description || settings.cover_image_url),
    },
  ];
  const completedItems = checklist.filter((item) => item.complete).length;
  const setupPercent = Math.round((completedItems / checklist.length) * 100);
  const publicCover =
    settings.cover_image_url ||
    "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1200&q=80";
  const publicDescription =
    settings.public_description ||
    "Ajoute une description courte pour presenter l'ambiance et la promesse de ta salle.";
  const publicHours = settings.public_hours || "Horaires a completer";
  const publicContact = settings.whatsapp_phone || settings.phone || "Contact a completer";

  return (
    <AppShell>
      <PageHeader title="Parametres" eyebrow="Salle et organisation" />

      <div className="grid gap-6 px-4 py-6 md:px-8 xl:grid-cols-[1fr_360px]">
        <section className="space-y-6">
          <article className="rounded-md border border-neutral-900 bg-ink p-5 text-white shadow-soft md:p-6">
            <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr] xl:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-white/70">
                  <Building2 size={14} />
                  Centre de controle
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-semibold md:text-3xl">{settings.name}</h2>
                  <StatusBadge tone="active">Espace actif</StatusBadge>
                </div>
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-white/65">
                  <span className="inline-flex items-center gap-2">
                    <Phone size={16} />
                    {settings.phone || "Telephone a completer"}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <MapPin size={16} />
                    {settings.address || "Adresse a completer"}
                  </span>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="border-l border-white/15 pl-4">
                  <p className="text-xs font-medium uppercase tracking-[0.08em] text-white/45">Configuration</p>
                  <p className="mt-2 text-xl font-semibold">{setupPercent}%</p>
                </div>
                <div className="border-l border-white/15 pl-4">
                  <p className="text-xs font-medium uppercase tracking-[0.08em] text-white/45">Role</p>
                  <p className="mt-2 text-xl font-semibold capitalize">{gym.role}</p>
                </div>
                <div className="border-l border-white/15 pl-4">
                  <p className="text-xs font-medium uppercase tracking-[0.08em] text-white/45">Devise</p>
                  <p className="mt-2 text-xl font-semibold">{settings.currency}</p>
                </div>
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

            <div className="mt-7 border-t border-line pt-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-md bg-emerald-50 text-mint">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Vitrine publique</h3>
                  <p className="mt-1 text-sm text-neutral-500">Ces elements apparaissent sur la page client de ta salle.</p>
                </div>
              </div>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <FormField label="Description courte">
                  <textarea
                    name="public_description"
                    className="min-h-28 w-full rounded-md border border-line bg-paper px-3 py-3 outline-none focus:border-mint"
                    defaultValue={settings.public_description ?? ""}
                    placeholder="Une salle premium au coeur de Dakar, pensee pour progresser avec regularite."
                  />
                </FormField>
                <FormField label="Horaires publics">
                  <textarea
                    name="public_hours"
                    className="min-h-28 w-full rounded-md border border-line bg-paper px-3 py-3 outline-none focus:border-mint"
                    defaultValue={settings.public_hours ?? ""}
                    placeholder="Lun - Sam : 06h00 - 22h00"
                  />
                </FormField>
                <FormField label="WhatsApp public">
                  <div className="relative">
                    <MessageCircle className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={17} />
                    <input
                      name="whatsapp_phone"
                      className="h-11 w-full rounded-md border border-line bg-paper pl-10 pr-3 outline-none focus:border-mint"
                      defaultValue={settings.whatsapp_phone ?? ""}
                      placeholder="+221 77 123 45 67"
                    />
                  </div>
                </FormField>
                <FormField label="Instagram">
                  <div className="relative">
                    <Instagram className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={17} />
                    <input
                      name="instagram_url"
                      type="url"
                      className="h-11 w-full rounded-md border border-line bg-paper pl-10 pr-3 outline-none focus:border-mint"
                      defaultValue={settings.instagram_url ?? ""}
                      placeholder="https://instagram.com/ta_salle"
                    />
                  </div>
                </FormField>
                <FormField label="TikTok">
                  <div className="relative">
                    <Music2 className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={17} />
                    <input
                      name="tiktok_url"
                      type="url"
                      className="h-11 w-full rounded-md border border-line bg-paper pl-10 pr-3 outline-none focus:border-mint"
                      defaultValue={settings.tiktok_url ?? ""}
                      placeholder="https://www.tiktok.com/@ta_salle"
                    />
                  </div>
                </FormField>
                <FormField label="Image de couverture">
                  <CoverImageUpload gymId={gym.id} inputName="cover_image_url" initialUrl={settings.cover_image_url} />
                </FormField>
                <div className="rounded-md border border-line bg-paper p-4">
                  <p className="text-sm font-semibold">Apercu public</p>
                  <div className="mt-3 space-y-2 text-sm text-neutral-600">
                    <p className="inline-flex items-center gap-2"><MessageCircle size={15} /> WhatsApp prioritaire si renseigne</p>
                    <p className="inline-flex items-center gap-2"><Clock3 size={15} /> Horaires visibles sur la page salle</p>
                    <p className="inline-flex items-center gap-2"><ImageIcon size={15} /> Photo utilisee en hero si disponible</p>
                  </div>
                </div>
              </div>
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
                className="flex min-h-32 flex-col justify-between rounded-md border border-line bg-paper p-4 text-sm shadow-sm transition hover:border-mint/40 hover:bg-neutral-100"
              >
                <Download size={19} />
                <span>
                  <span className="block font-semibold">Membres CSV</span>
                  <span className="mt-1 block text-neutral-500">Liste exploitable dans Excel.</span>
                </span>
              </Link>
              <Link
                href="/payments/export?period=all"
                className="flex min-h-32 flex-col justify-between rounded-md border border-line bg-paper p-4 text-sm shadow-sm transition hover:border-mint/40 hover:bg-neutral-100"
              >
                <Download size={19} />
                <span>
                  <span className="block font-semibold">Caisse CSV</span>
                  <span className="mt-1 block text-neutral-500">Historique complet des paiements.</span>
                </span>
              </Link>
              <Link
                href="/settings/export"
                className="flex min-h-32 flex-col justify-between rounded-md border border-line bg-paper p-4 text-sm shadow-sm transition hover:border-mint/40 hover:bg-neutral-100"
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

        <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <section className="overflow-hidden rounded-md border border-line bg-white shadow-soft">
            <div
              className="min-h-44 bg-cover bg-center p-4 text-white"
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(10,10,10,0.18), rgba(10,10,10,0.78)), url('${publicCover}')`,
              }}
            >
              <div className="flex h-full min-h-36 flex-col justify-between">
                <span className="inline-flex w-fit items-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-white/70 backdrop-blur">
                  <Sparkles size={13} />
                  Apercu vitrine
                </span>
                <div>
                  <h2 className="text-2xl font-semibold leading-tight">{settings.name}</h2>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/72">{publicDescription}</p>
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="grid gap-3">
                <div className="rounded-md bg-paper p-3">
                  <p className="inline-flex items-center gap-2 text-sm font-semibold">
                    <Clock3 size={16} className="text-mint" />
                    Horaires
                  </p>
                  <p className="mt-1 text-sm leading-6 text-neutral-600">{publicHours}</p>
                </div>
                <div className="rounded-md bg-paper p-3">
                  <p className="inline-flex items-center gap-2 text-sm font-semibold">
                    <MessageCircle size={16} className="text-mint" />
                    Contact public
                  </p>
                  <p className="mt-1 text-sm leading-6 text-neutral-600">{publicContact}</p>
                </div>
                {settings.instagram_url ? (
                  <div className="rounded-md bg-paper p-3">
                    <p className="inline-flex items-center gap-2 text-sm font-semibold">
                      <Instagram size={16} className="text-mint" />
                      Instagram
                    </p>
                    <p className="mt-1 truncate text-sm text-neutral-600">{settings.instagram_url}</p>
                  </div>
                ) : null}
                {settings.tiktok_url ? (
                  <div className="rounded-md bg-paper p-3">
                    <p className="inline-flex items-center gap-2 text-sm font-semibold">
                      <Music2 size={16} className="text-mint" />
                      TikTok
                    </p>
                    <p className="mt-1 truncate text-sm text-neutral-600">{settings.tiktok_url}</p>
                  </div>
                ) : null}
              </div>

              <Link href={`/g/${gym.id}`} className="mt-4 flex h-11 items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white hover:bg-neutral-800">
                Ouvrir la vitrine
                <ExternalLink size={15} />
              </Link>
            </div>
          </section>

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
            <h2 className="text-lg font-semibold">Liens importants</h2>
            <p className="mt-1 text-sm text-neutral-500">Acces rapide aux reglages les plus utilises.</p>
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
              <Link href={`/g/${gym.id}`} className="flex h-11 items-center justify-between rounded-md border border-line px-3 text-sm font-semibold hover:bg-neutral-50">
                <span className="inline-flex items-center gap-2"><ExternalLink size={16} /> Vitrine salle</span>
                <ExternalLink size={15} />
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}
