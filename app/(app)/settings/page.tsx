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
  AtSign,
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

const inputCls =
  "h-11 w-full rounded-xl border border-white/10 bg-white/6 px-3.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-emerald-500/60 focus:bg-white/8";

const selectCls =
  "h-11 w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-3.5 text-sm text-white outline-none transition focus:border-emerald-500/60";

export default async function SettingsPage() {
  const gym = await requireAdminGym();
  const settings = await getGymSettings(gym.id);
  if (!settings) notFound();

  const checklist = [
    { label: "Nom de salle", complete: Boolean(settings.name) },
    { label: "Téléphone", complete: Boolean(settings.phone) },
    { label: "Adresse", complete: Boolean(settings.address) },
    { label: "Devise", complete: Boolean(settings.currency) },
    { label: "Vitrine publique", complete: Boolean(settings.public_description || settings.cover_image_url) },
  ];
  const completedItems = checklist.filter((item) => item.complete).length;
  const setupPercent = Math.round((completedItems / checklist.length) * 100);

  const publicCover =
    settings.cover_image_url ||
    "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1200&q=80";
  const publicDescription =
    settings.public_description ||
    "Ajoute une description courte pour présenter l'ambiance et la promesse de ta salle.";
  const publicHours = settings.public_hours || "Horaires à compléter";
  const publicContact = settings.whatsapp_phone || settings.phone || "Contact à compléter";

  return (
    <AppShell>
      <PageHeader title="Paramètres" eyebrow="Salle et organisation" />

      <div className="grid gap-4 px-6 py-6 md:px-8 xl:grid-cols-[1fr_340px]">
        <section className="space-y-4">

          {/* Hero cockpit */}
          <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/4">
            <div className="relative overflow-hidden border-b border-white/8 bg-gradient-to-br from-emerald-500/8 via-transparent to-transparent px-6 py-5">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-white/60">
                    <Building2 size={12} />
                    Centre de contrôle
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-semibold">{settings.name}</h2>
                    <StatusBadge tone="active">Actif</StatusBadge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-white/50">
                    <span className="inline-flex items-center gap-2">
                      <Phone size={14} />
                      {settings.phone || "Téléphone à compléter"}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <MapPin size={14} />
                      {settings.address || "Adresse à compléter"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  {[
                    { label: "Config.", value: `${setupPercent}%` },
                    { label: "Rôle", value: gym.role },
                    { label: "Devise", value: settings.currency },
                  ].map((s) => (
                    <div key={s.label} className="border-l border-white/10 pl-5 first:border-l-0 first:pl-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-white/35">{s.label}</p>
                      <p className="mt-1.5 text-lg font-semibold capitalize">{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire infos salle */}
          <form action={updateGymSettings} className="overflow-hidden rounded-2xl border border-white/8 bg-white/4">
            <div className="flex items-center gap-3 border-b border-white/8 px-6 py-5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                <Building2 size={17} />
              </div>
              <div>
                <h2 className="font-semibold">Informations salle</h2>
                <p className="mt-0.5 text-xs text-white/40">Ces informations identifient ton espace GymFlow.</p>
              </div>
            </div>

            <div className="px-6 py-6">
              <div className="grid gap-5 md:grid-cols-2">
                <FormField label="Nom de la salle">
                  <input name="name" className={inputCls} defaultValue={settings.name} required />
                </FormField>
                <FormField label="Téléphone">
                  <input name="phone" className={inputCls} defaultValue={settings.phone ?? ""} placeholder="+221 77 123 45 67" />
                </FormField>
                <FormField label="Adresse">
                  <input name="address" className={inputCls} defaultValue={settings.address ?? ""} placeholder="Dakar Plateau" />
                </FormField>
                <FormField label="Devise">
                  <select name="currency" className={selectCls} defaultValue={settings.currency}>
                    <option value="XOF">F CFA</option>
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                  </select>
                </FormField>
              </div>

              {/* Vitrine publique */}
              <div className="mt-7 border-t border-white/8 pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400">
                    <Sparkles size={17} />
                  </div>
                  <div>
                    <h3 className="font-semibold">Vitrine publique</h3>
                    <p className="mt-0.5 text-xs text-white/40">Ces éléments apparaissent sur la page client de ta salle.</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <FormField label="Description courte">
                    <textarea
                      name="public_description"
                      className="min-h-28 w-full rounded-xl border border-white/10 bg-white/6 p-3.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-emerald-500/60 focus:bg-white/8"
                      defaultValue={settings.public_description ?? ""}
                      placeholder="Une salle premium au cœur de Dakar, pensée pour progresser avec régularité."
                    />
                  </FormField>
                  <FormField label="Horaires publics">
                    <textarea
                      name="public_hours"
                      className="min-h-28 w-full rounded-xl border border-white/10 bg-white/6 p-3.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-emerald-500/60 focus:bg-white/8"
                      defaultValue={settings.public_hours ?? ""}
                      placeholder="Lun - Sam : 06h00 - 22h00"
                    />
                  </FormField>
                  <FormField label="WhatsApp public">
                    <div className="relative">
                      <MessageCircle className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" size={16} />
                      <input
                        name="whatsapp_phone"
                        className="h-11 w-full rounded-xl border border-white/10 bg-white/6 pl-10 pr-3.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-emerald-500/60 focus:bg-white/8"
                        defaultValue={settings.whatsapp_phone ?? ""}
                        placeholder="+221 77 123 45 67"
                      />
                    </div>
                  </FormField>
                  <FormField label="Instagram">
                    <div className="relative">
                      <AtSign className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" size={16} />
                      <input
                        name="instagram_url"
                        type="url"
                        className="h-11 w-full rounded-xl border border-white/10 bg-white/6 pl-10 pr-3.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-emerald-500/60 focus:bg-white/8"
                        defaultValue={settings.instagram_url ?? ""}
                        placeholder="https://instagram.com/ta_salle"
                      />
                    </div>
                  </FormField>
                  <FormField label="TikTok">
                    <div className="relative">
                      <Music2 className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" size={16} />
                      <input
                        name="tiktok_url"
                        type="url"
                        className="h-11 w-full rounded-xl border border-white/10 bg-white/6 pl-10 pr-3.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-emerald-500/60 focus:bg-white/8"
                        defaultValue={settings.tiktok_url ?? ""}
                        placeholder="https://www.tiktok.com/@ta_salle"
                      />
                    </div>
                  </FormField>
                  <FormField label="Image de couverture">
                    <CoverImageUpload gymId={gym.id} inputName="cover_image_url" initialUrl={settings.cover_image_url} />
                  </FormField>
                  <div className="rounded-xl border border-white/8 bg-white/3 p-4">
                    <p className="text-sm font-semibold">À savoir</p>
                    <div className="mt-3 space-y-2 text-xs text-white/40">
                      <p className="inline-flex items-center gap-2"><MessageCircle size={13} /> WhatsApp prioritaire si renseigné</p>
                      <p className="inline-flex items-center gap-2"><Clock3 size={13} /> Horaires visibles sur la page salle</p>
                      <p className="inline-flex items-center gap-2"><ImageIcon size={13} /> Photo utilisée en hero si disponible</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <SubmitButton
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 text-sm font-semibold text-white hover:bg-emerald-400"
                  pendingLabel="Enregistrement…"
                >
                  <CheckCircle2 size={15} />
                  Enregistrer
                </SubmitButton>
              </div>
            </div>
          </form>

          {/* Exports */}
          <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/4">
            <div className="flex items-center gap-3 border-b border-white/8 px-6 py-5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
                <DatabaseBackup size={17} />
              </div>
              <div>
                <h2 className="font-semibold">Exports et sauvegarde</h2>
                <p className="mt-0.5 text-xs text-white/40">Récupère les données importantes de la salle.</p>
              </div>
            </div>

            <div className="grid gap-3 p-6 md:grid-cols-3">
              {[
                { href: "/members/export", icon: Download, label: "Membres CSV", desc: "Liste exploitable dans Excel." },
                { href: "/payments/export?period=all", icon: Download, label: "Caisse CSV", desc: "Historique complet des paiements." },
                { href: "/settings/export", icon: DatabaseBackup, label: "Sauvegarde JSON", desc: "Archive complète sans secrets." },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex min-h-28 flex-col justify-between rounded-xl border border-white/8 bg-white/3 p-4 text-sm transition hover:border-white/14 hover:bg-white/6"
                >
                  <item.icon size={18} className="text-white/50" />
                  <span>
                    <span className="block font-semibold">{item.label}</span>
                    <span className="mt-1 block text-xs text-white/40">{item.desc}</span>
                  </span>
                </Link>
              ))}
            </div>

            <div className="mx-6 mb-6 rounded-xl border border-white/6 bg-white/3 px-4 py-3 text-xs text-white/35">
              Les données restent stockées dans Supabase. Ces exports servent de copie locale pour contrôle, comptabilité ou sauvegarde ponctuelle.
            </div>
          </div>
        </section>

        {/* Sidebar */}
        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">

          {/* Aperçu vitrine */}
          <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/4">
            <div
              className="min-h-44 bg-cover bg-center p-5"
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(8,8,8,0.2), rgba(8,8,8,0.85)), url('${publicCover}')`,
              }}
            >
              <div className="flex h-full min-h-36 flex-col justify-between">
                <span className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-white/70 backdrop-blur-sm">
                  <Sparkles size={12} />
                  Aperçu vitrine
                </span>
                <div>
                  <h3 className="text-xl font-semibold">{settings.name}</h3>
                  <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-white/60">{publicDescription}</p>
                </div>
              </div>
            </div>
            <div className="space-y-3 p-5">
              {[
                { icon: Clock3, label: "Horaires", value: publicHours },
                { icon: MessageCircle, label: "Contact", value: publicContact },
                ...(settings.instagram_url ? [{ icon: AtSign, label: "Instagram", value: settings.instagram_url }] : []),
                ...(settings.tiktok_url ? [{ icon: Music2, label: "TikTok", value: settings.tiktok_url }] : []),
              ].map((row) => (
                <div key={row.label} className="rounded-xl border border-white/6 bg-white/3 p-3">
                  <p className="inline-flex items-center gap-2 text-xs font-semibold text-white/60">
                    <row.icon size={13} className="text-emerald-400" />
                    {row.label}
                  </p>
                  <p className="mt-1 truncate text-xs text-white/40">{row.value}</p>
                </div>
              ))}
              <Link
                href={`/g/${gym.id}`}
                className="mt-1 flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 text-sm font-semibold text-white transition hover:bg-emerald-400"
              >
                Ouvrir la vitrine
                <ExternalLink size={14} />
              </Link>
            </div>
          </div>

          {/* Checklist */}
          <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/4">
            <div className="border-b border-white/8 px-5 py-4">
              <h2 className="font-semibold">Checklist production</h2>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/8">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${setupPercent}%` }} />
              </div>
              <p className="mt-1.5 text-xs text-white/35">{completedItems}/{checklist.length} éléments complétés</p>
            </div>
            <div className="space-y-1.5 p-4">
              {checklist.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5">
                  <span className="text-sm font-semibold">{item.label}</span>
                  <StatusBadge tone={item.complete ? "active" : "warning"}>
                    {item.complete ? "OK" : "À faire"}
                  </StatusBadge>
                </div>
              ))}
            </div>
          </div>

          {/* Accès */}
          <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/4">
            <div className="flex items-center gap-3 border-b border-white/8 px-5 py-4">
              <ShieldCheck size={16} className="text-emerald-400" />
              <h2 className="font-semibold">Accès</h2>
            </div>
            <div className="grid grid-cols-2 divide-x divide-white/6 p-4">
              <div className="pr-4">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-white/35">Rôle</p>
                <p className="mt-1.5 font-semibold capitalize">{gym.role}</p>
              </div>
              <div className="pl-4">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-white/35">Devise</p>
                <p className="mt-1.5 font-semibold">{settings.currency}</p>
              </div>
            </div>
          </div>

          {/* Liens rapides */}
          <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/4">
            <div className="border-b border-white/8 px-5 py-4">
              <h2 className="font-semibold">Liens rapides</h2>
            </div>
            <div className="space-y-1.5 p-4">
              {[
                { href: "/team", icon: UsersRound, label: "Équipe et PIN" },
                { href: "/subscriptions", icon: CreditCard, label: "Formules" },
                { href: "/site", icon: Building2, label: "Page publique" },
                { href: `/g/${gym.id}`, icon: ExternalLink, label: "Vitrine salle" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex h-10 items-center justify-between rounded-xl border border-white/8 bg-white/3 px-3 text-sm font-semibold transition hover:bg-white/6 hover:text-white"
                >
                  <span className="inline-flex items-center gap-2 text-white/70">
                    <link.icon size={15} className="text-white/40" />
                    {link.label}
                  </span>
                  <ExternalLink size={13} className="text-white/25" />
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
