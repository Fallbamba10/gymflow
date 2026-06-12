import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, CreditCard, RotateCcw, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { FormField } from "@/components/form-field";
import { PageHeader } from "@/components/page-header";
import { SubmitButton } from "@/components/submit-button";
import {
  activateSubscriptionType,
  deactivateSubscriptionType,
  updateSubscriptionType,
} from "@/app/(app)/subscriptions/actions";
import { requireAdminGym } from "@/lib/supabase/guards";
import { getSubscriptionType } from "@/lib/supabase/queries";

type EditSubscriptionTypePageProps = {
  params: Promise<{ id: string }>;
};

const inputCls =
  "h-11 w-full rounded-xl border border-white/10 bg-white/6 px-3.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-emerald-500/60 focus:bg-white/8";

export default async function EditSubscriptionTypePage({ params }: EditSubscriptionTypePageProps) {
  const { id } = await params;
  const gym = await requireAdminGym();
  const subscriptionType = await getSubscriptionType(gym.id, id);
  if (!subscriptionType) notFound();

  return (
    <AppShell>
      <PageHeader
        title="Modifier la formule"
        eyebrow={subscriptionType.name}
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

      <div className="grid gap-4 px-6 py-6 md:px-8 xl:grid-cols-[1fr_300px]">
        <form action={updateSubscriptionType} className="overflow-hidden rounded-2xl border border-white/8 bg-white/4">
          <input type="hidden" name="subscription_type_id" value={subscriptionType.id} />

          <div className="flex items-center gap-3 border-b border-white/8 px-6 py-5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
              <CreditCard size={17} />
            </div>
            <div>
              <h2 className="font-semibold">Détails de la formule</h2>
              <p className="mt-0.5 text-xs text-white/40">Les changements s&apos;appliquent aux prochains abonnements vendus.</p>
            </div>
          </div>

          <div className="px-6 py-6">
            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="Nom">
                <input name="name" className={inputCls} defaultValue={subscriptionType.name} required />
              </FormField>
              <FormField label="Prix">
                <input name="price" type="number" className={inputCls} defaultValue={subscriptionType.price} min="0" required />
              </FormField>
              <FormField label="Durée en jours">
                <input name="duration_days" type="number" className={inputCls} defaultValue={subscriptionType.duration_days} min="1" required />
              </FormField>
              <FormField label="Nombre de séances">
                <input name="sessions" type="number" className={inputCls} defaultValue={subscriptionType.sessions ?? ""} min="1" placeholder="Vide = illimité" />
              </FormField>
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
                pendingLabel="Enregistrement…"
              >
                <CheckCircle2 size={15} />
                Enregistrer
              </SubmitButton>
            </div>
          </div>
        </form>

        {/* Sidebar activation */}
        <aside className="overflow-hidden rounded-2xl border border-white/8 bg-white/4 xl:self-start">
          <div className="border-b border-white/8 px-5 py-4">
            <h2 className="font-semibold">
              {subscriptionType.active ? "Désactiver" : "Réactiver"}
            </h2>
            <p className="mt-1 text-xs leading-5 text-white/40">
              {subscriptionType.active
                ? "La formule ne sera plus proposée lors de l'ajout ou du renouvellement d'un membre."
                : "La formule redeviendra disponible pour les nouvelles ventes et renouvellements."}
            </p>
          </div>
          <div className="p-5">
            {subscriptionType.active ? (
              <form action={deactivateSubscriptionType}>
                <input type="hidden" name="subscription_type_id" value={subscriptionType.id} />
                <SubmitButton
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 text-sm font-semibold text-red-400 hover:bg-red-500/20"
                  pendingLabel="Désactivation…"
                >
                  <Trash2 size={15} />
                  Désactiver la formule
                </SubmitButton>
              </form>
            ) : (
              <form action={activateSubscriptionType}>
                <input type="hidden" name="subscription_type_id" value={subscriptionType.id} />
                <SubmitButton
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-sm font-semibold text-emerald-400 hover:bg-emerald-500/20"
                  pendingLabel="Réactivation…"
                >
                  <RotateCcw size={15} />
                  Réactiver la formule
                </SubmitButton>
              </form>
            )}
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
