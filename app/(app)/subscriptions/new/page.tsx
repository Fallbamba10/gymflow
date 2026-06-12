import Link from "next/link";
import { ArrowLeft, CheckCircle2, CreditCard } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { FormField } from "@/components/form-field";
import { PageHeader } from "@/components/page-header";
import { SubmitButton } from "@/components/submit-button";
import { createSubscriptionType } from "@/app/(app)/subscriptions/actions";
import { requireAdminGym } from "@/lib/supabase/guards";

export default async function NewSubscriptionTypePage() {
  await requireAdminGym();

  return (
    <AppShell>
      <PageHeader
        title="Nouvelle formule"
        eyebrow="Configuration abonnement"
        actions={
          <Link href="/subscriptions" className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-semibold shadow-sm">
            <ArrowLeft size={18} />
            Retour
          </Link>
        }
      />

      <div className="px-4 py-6 md:px-8">
        <form action={createSubscriptionType} className="max-w-3xl rounded-md border border-line bg-white p-5 shadow-soft">
          <div className="flex items-center gap-3 border-b border-line pb-5">
            <div className="flex size-10 items-center justify-center rounded-md bg-paper text-ink">
              <CreditCard size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Details de la formule</h2>
              <p className="mt-1 text-sm text-neutral-500">La formule sera disponible pour les prochains abonnements.</p>
            </div>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <FormField label="Nom">
              <input name="name" className="h-11 w-full rounded-md border border-line bg-paper px-3 outline-none focus:border-mint" placeholder="Mensuel illimite" required />
            </FormField>
            <FormField label="Prix">
              <input name="price" type="number" className="h-11 w-full rounded-md border border-line bg-paper px-3 outline-none focus:border-mint" placeholder="15000" min="0" required />
            </FormField>
            <FormField label="Duree en jours">
              <input name="duration_days" type="number" className="h-11 w-full rounded-md border border-line bg-paper px-3 outline-none focus:border-mint" placeholder="30" min="1" required />
            </FormField>
            <FormField label="Nombre de seances">
              <input name="sessions" type="number" className="h-11 w-full rounded-md border border-line bg-paper px-3 outline-none focus:border-mint" min="1" placeholder="Vide = illimite" />
            </FormField>
          </div>

          <div className="mt-6 rounded-md border border-line bg-paper p-4">
            <p className="text-sm font-semibold">Astuce</p>
            <p className="mt-1 text-sm text-neutral-500">Laisse le nombre de seances vide pour une formule illimitee sur la duree choisie.</p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Link href="/subscriptions" className="inline-flex h-11 items-center justify-center rounded-md border border-line bg-white px-4 text-sm font-semibold">
              Annuler
            </Link>
            <SubmitButton type="submit" variant="accent" className="h-11" pendingLabel="Creation...">
              <CheckCircle2 size={18} />
              Creer la formule
            </SubmitButton>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
