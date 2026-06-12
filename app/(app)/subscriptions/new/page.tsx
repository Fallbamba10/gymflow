import Link from "next/link";
import { ArrowLeft, CheckCircle2, CreditCard } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { FormField } from "@/components/form-field";
import { PageHeader } from "@/components/page-header";
import { SubmitButton } from "@/components/submit-button";
import { createSubscriptionType } from "@/app/(app)/subscriptions/actions";
import { requireAdminGym } from "@/lib/supabase/guards";

const inputCls =
  "h-11 w-full rounded-xl border border-white/10 bg-white/6 px-3.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-emerald-500/60 focus:bg-white/8";

export default async function NewSubscriptionTypePage() {
  await requireAdminGym();

  return (
    <AppShell>
      <PageHeader
        title="Nouvelle formule"
        eyebrow="Configuration abonnement"
        actions={
          <Link
            href="/subscriptions"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white/60 transition hover:bg-white/8 hover:text-white"
          >
            <ArrowLeft size={16} />
            Retour
          </Link>
        }
      />

      <div className="px-6 py-6 md:px-8">
        <form action={createSubscriptionType} className="max-w-2xl overflow-hidden rounded-2xl border border-white/8 bg-white/4">
          <div className="flex items-center gap-3 border-b border-white/8 px-6 py-5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
              <CreditCard size={17} />
            </div>
            <div>
              <h2 className="font-semibold">Détails de la formule</h2>
              <p className="mt-0.5 text-xs text-white/40">La formule sera disponible pour les prochains abonnements.</p>
            </div>
          </div>

          <div className="px-6 py-6">
            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="Nom">
                <input name="name" className={inputCls} placeholder="Mensuel illimité" required />
              </FormField>
              <FormField label="Prix">
                <input name="price" type="number" className={inputCls} placeholder="15000" min="0" required />
              </FormField>
              <FormField label="Durée en jours">
                <input name="duration_days" type="number" className={inputCls} placeholder="30" min="1" required />
              </FormField>
              <FormField label="Nombre de séances">
                <input name="sessions" type="number" className={inputCls} min="1" placeholder="Vide = illimité" />
              </FormField>
            </div>

            <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/8 px-4 py-3 text-xs text-emerald-400">
              Laisse le nombre de séances vide pour une formule illimitée sur la durée choisie.
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Link
                href="/subscriptions"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white/60 transition hover:bg-white/8 hover:text-white"
              >
                Annuler
              </Link>
              <SubmitButton
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 text-sm font-semibold text-white hover:bg-emerald-400"
                pendingLabel="Création…"
              >
                <CheckCircle2 size={15} />
                Créer la formule
              </SubmitButton>
            </div>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
