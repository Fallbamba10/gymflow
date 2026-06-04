import Link from "next/link";
import { CreditCard, Plus, RotateCcw } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { formatCurrency, formatDuration, formatSessions } from "@/lib/demo-data";
import { getCurrentGym, getSubscriptionTypes } from "@/lib/supabase/queries";

type SubscriptionsPageProps = {
  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
};

export default async function SubscriptionsPage({ searchParams }: SubscriptionsPageProps) {
  const params = await searchParams;
  const gym = await getCurrentGym();
  const subscriptionTypes = gym ? await getSubscriptionTypes(gym.id) : [];

  return (
    <AppShell>
      <PageHeader
        title="Abonnements"
        eyebrow="Formules et tarifs"
        actions={
          <Link href="/subscriptions/new" className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-mint px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700">
            <Plus size={18} />
            Nouvelle formule
          </Link>
        }
      />

      <div className="grid gap-6 px-4 py-6 md:px-8 xl:grid-cols-[1fr_380px]">
        <section className="rounded-md border border-line bg-white shadow-soft">
          <div className="flex items-center justify-between border-b border-line p-5">
            <div>
              <h2 className="text-lg font-semibold">Formules disponibles</h2>
              <p className="mt-1 text-sm text-neutral-500">Prix, duree et nombre de seances.</p>
            </div>
            <CreditCard className="text-mint" size={22} />
          </div>

          {params.success ? (
            <div className="mx-5 mt-5 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-mint">
              {params.success}
            </div>
          ) : null}

          {params.error ? (
            <div className="mx-5 mt-5 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold text-danger">
              {params.error}
            </div>
          ) : null}

          <div className="divide-y divide-line">
            {subscriptionTypes.length > 0 ? (
              subscriptionTypes.map((type) => (
                <div key={type.id} className="grid gap-4 p-5 md:grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr_0.8fr] md:items-center">
                  <div>
                    <p className="font-semibold">{type.name}</p>
                    <p className="mt-1 text-sm text-neutral-500">Formule active</p>
                  </div>
                  <p className="text-sm">{formatDuration(type.duration_days)}</p>
                  <p className="text-sm">{formatSessions(type.sessions)}</p>
                  <p className="text-sm font-semibold">{formatCurrency(type.price)}</p>
                  <Link
                    href={`/subscriptions/${type.id}/edit`}
                    className="inline-flex h-9 items-center justify-center rounded-md border border-line bg-white px-3 text-sm font-semibold transition hover:bg-neutral-50 md:justify-self-end"
                  >
                    Modifier
                  </Link>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <p className="font-semibold">Aucune formule pour le moment</p>
                <p className="mt-2 text-sm text-neutral-500">Cree ta premiere formule pour pouvoir ajouter des membres.</p>
                <Link href="/subscriptions/new" className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-mint px-4 text-sm font-semibold text-white">
                  Creer une formule
                </Link>
              </div>
            )}
          </div>
        </section>

        <aside className="rounded-md border border-line bg-white shadow-soft">
          <div className="flex items-center justify-between border-b border-line p-5">
            <div>
              <h2 className="text-lg font-semibold">Renouvellements</h2>
              <p className="mt-1 text-sm text-neutral-500">Les renouvellements se font depuis la fiche membre.</p>
            </div>
            <RotateCcw className="text-amber" size={22} />
          </div>
          <div className="space-y-4 p-5 text-sm">
            <div className="rounded-md bg-paper p-4">
              <p className="font-semibold">Modifier une formule</p>
              <p className="mt-1 text-neutral-500">Mets a jour le prix ou la duree pour les prochains abonnements.</p>
            </div>
            <div className="rounded-md bg-paper p-4">
              <p className="font-semibold">Desactiver une formule</p>
              <p className="mt-1 text-neutral-500">La formule disparait des nouvelles ventes sans casser l&apos;historique.</p>
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
