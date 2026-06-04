import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, CreditCard, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { FormField } from "@/components/form-field";
import { PageHeader } from "@/components/page-header";
import { SubmitButton } from "@/components/submit-button";
import {
  deactivateSubscriptionType,
  updateSubscriptionType,
} from "@/app/(app)/subscriptions/actions";
import { getCurrentGym, getSubscriptionType } from "@/lib/supabase/queries";

type EditSubscriptionTypePageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function EditSubscriptionTypePage({
  params,
  searchParams,
}: EditSubscriptionTypePageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const gym = await getCurrentGym();
  const subscriptionType = gym ? await getSubscriptionType(gym.id, id) : null;

  if (!subscriptionType) {
    notFound();
  }

  return (
    <AppShell>
      <PageHeader
        title="Modifier la formule"
        eyebrow={subscriptionType.name}
        actions={
          <Link href="/subscriptions" className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-semibold shadow-sm">
            <ArrowLeft size={18} />
            Retour
          </Link>
        }
      />

      <div className="grid gap-6 px-4 py-6 md:px-8 xl:grid-cols-[1fr_360px]">
        <form action={updateSubscriptionType} className="rounded-md border border-line bg-white p-5 shadow-soft">
          <input type="hidden" name="subscription_type_id" value={subscriptionType.id} />

          <div className="flex items-center gap-3 border-b border-line pb-5">
            <div className="flex size-10 items-center justify-center rounded-md bg-paper text-ink">
              <CreditCard size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Details de la formule</h2>
              <p className="mt-1 text-sm text-neutral-500">Les changements s&apos;appliquent aux prochains abonnements vendus.</p>
            </div>
          </div>

          {query.error ? (
            <div className="mt-5 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold text-danger">
              {query.error}
            </div>
          ) : null}

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <FormField label="Nom">
              <input
                name="name"
                className="h-11 w-full rounded-md border border-line bg-paper px-3 outline-none focus:border-mint"
                defaultValue={subscriptionType.name}
                required
              />
            </FormField>
            <FormField label="Prix">
              <input
                name="price"
                type="number"
                className="h-11 w-full rounded-md border border-line bg-paper px-3 outline-none focus:border-mint"
                defaultValue={subscriptionType.price}
                min="0"
                required
              />
            </FormField>
            <FormField label="Duree en jours">
              <input
                name="duration_days"
                type="number"
                className="h-11 w-full rounded-md border border-line bg-paper px-3 outline-none focus:border-mint"
                defaultValue={subscriptionType.duration_days}
                min="1"
                required
              />
            </FormField>
            <FormField label="Nombre de seances">
              <input
                name="sessions"
                type="number"
                className="h-11 w-full rounded-md border border-line bg-paper px-3 outline-none focus:border-mint"
                defaultValue={subscriptionType.sessions ?? ""}
                min="1"
                placeholder="Vide = illimite"
              />
            </FormField>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Link href="/subscriptions" className="inline-flex h-11 items-center justify-center rounded-md border border-line bg-white px-4 text-sm font-semibold">
              Annuler
            </Link>
            <SubmitButton type="submit" variant="accent" className="h-11" pendingLabel="Enregistrement...">
              <CheckCircle2 size={18} />
              Enregistrer
            </SubmitButton>
          </div>
        </form>

        <aside className="rounded-md border border-line bg-white p-5 shadow-soft">
          <div className="flex items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-md bg-red-50 text-danger">
              <Trash2 size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Desactiver</h2>
              <p className="mt-1 text-sm text-neutral-500">
                La formule ne sera plus proposee lors de l&apos;ajout ou du renouvellement d&apos;un membre.
              </p>
            </div>
          </div>

          <form action={deactivateSubscriptionType} className="mt-5">
            <input type="hidden" name="subscription_type_id" value={subscriptionType.id} />
            <SubmitButton
              type="submit"
              variant="secondary"
              className="h-11 w-full border-red-200 text-danger hover:bg-red-50"
              disabled={!subscriptionType.active}
              pendingLabel="Desactivation..."
            >
              <Trash2 size={18} />
              {subscriptionType.active ? "Desactiver la formule" : "Deja desactivee"}
            </SubmitButton>
          </form>
        </aside>
      </div>
    </AppShell>
  );
}
