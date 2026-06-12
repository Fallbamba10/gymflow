import Link from "next/link";
import { ArrowLeft, CheckCircle2, UserPlus } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { FormField } from "@/components/form-field";
import { PageHeader } from "@/components/page-header";
import { SubmitButton } from "@/components/submit-button";
import { createMember } from "@/app/(app)/members/actions";
import { formatCurrency } from "@/lib/demo-data";
import { requireAdminGym } from "@/lib/supabase/guards";
import { getSubscriptionTypes } from "@/lib/supabase/queries";

const inputCls =
  "h-11 w-full rounded-xl border border-white/10 bg-white/6 px-3.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-emerald-500/60 focus:bg-white/8";

const selectCls =
  "h-11 w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-3.5 text-sm text-white outline-none transition focus:border-emerald-500/60";

export default async function NewMemberPage() {
  const gym = await requireAdminGym();
  const subscriptionTypes = await getSubscriptionTypes(gym.id);

  return (
    <AppShell>
      <PageHeader
        title="Nouveau membre"
        eyebrow="Ajout rapide"
        actions={
          <Link
            href="/members"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white/60 transition hover:bg-white/8 hover:text-white"
          >
            <ArrowLeft size={16} />
            Retour
          </Link>
        }
      />

      <div className="grid gap-4 px-6 py-6 md:px-8 xl:grid-cols-[1fr_320px]">
        <form action={createMember} className="overflow-hidden rounded-2xl border border-white/8 bg-white/4">
          <div className="flex items-center gap-3 border-b border-white/8 px-6 py-5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
              <UserPlus size={18} />
            </div>
            <div>
              <h2 className="font-semibold">Informations membre</h2>
              <p className="mt-0.5 text-xs text-white/40">Création du membre et de son premier abonnement.</p>
            </div>
          </div>

          <div className="px-6 py-6">
            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="Nom complet">
                <input name="full_name" className={inputCls} placeholder="Bamba Fall" required />
              </FormField>
              <FormField label="Téléphone">
                <input name="phone" className={inputCls} placeholder="+221 77 123 45 67" />
              </FormField>
              <FormField label="Formule">
                <select name="subscription_type_id" className={selectCls} required>
                  {subscriptionTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} — {formatCurrency(t.price)}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Mode de paiement">
                <select name="payment_method" className={selectCls} defaultValue="wave">
                  <option value="cash">Cash</option>
                  <option value="wave">Wave</option>
                  <option value="orange_money">Orange Money</option>
                  <option value="card">Carte bancaire</option>
                  <option value="other">Autre</option>
                </select>
              </FormField>
              <FormField label="Date de début">
                <input name="starts_at" type="date" className={inputCls} />
              </FormField>
            </div>

            <div className="mt-5">
              <FormField label="Notes internes">
                <textarea
                  name="notes"
                  className="min-h-24 w-full rounded-xl border border-white/10 bg-white/6 p-3.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-emerald-500/60 focus:bg-white/8"
                  placeholder="Objectif, remarques médicales, préférence coach…"
                />
              </FormField>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Link
                href="/members"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white/60 transition hover:bg-white/8 hover:text-white"
              >
                Annuler
              </Link>
              <SubmitButton
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 text-sm font-semibold text-white hover:bg-emerald-400 disabled:opacity-50"
                disabled={subscriptionTypes.length === 0}
                pendingLabel="Création…"
              >
                <CheckCircle2 size={16} />
                Créer le membre
              </SubmitButton>
            </div>
          </div>
        </form>

        <aside className="overflow-hidden rounded-2xl border border-white/8 bg-white/4 xl:self-start">
          <div className="border-b border-white/8 px-5 py-4">
            <h2 className="font-semibold">Avant de créer</h2>
          </div>
          <div className="space-y-3 p-5">
            <div className="rounded-xl border border-white/6 bg-white/4 p-4">
              <p className="text-sm font-semibold">Formule requise</p>
              <p className="mt-1 text-xs leading-5 text-white/40">
                Crée au moins une formule d&apos;abonnement avant d&apos;ajouter un membre.
              </p>
            </div>
            <div className="rounded-xl border border-white/6 bg-white/4 p-4">
              <p className="text-sm font-semibold">Abonnement automatique</p>
              <p className="mt-1 text-xs leading-5 text-white/40">
                GymFlow crée automatiquement l&apos;abonnement et le paiement associé.
              </p>
            </div>
            {subscriptionTypes.length === 0 && (
              <Link
                href="/subscriptions/new"
                className="flex items-center justify-center rounded-xl bg-emerald-500/15 px-4 py-3 text-sm font-semibold text-emerald-400 transition hover:bg-emerald-500/25"
              >
                Créer une formule d&apos;abord →
              </Link>
            )}
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
