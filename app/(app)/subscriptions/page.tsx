import Link from "next/link";
import { CreditCard, Plus, RotateCcw } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDuration, formatSessions } from "@/lib/demo-data";
import { getCurrentGym, getSubscriptionTypes } from "@/lib/supabase/queries";

export default async function SubscriptionsPage() {
  const gym = await getCurrentGym();
  const subscriptionTypes = gym ? await getSubscriptionTypes(gym.id) : [];

  return (
    <AppShell>
      <PageHeader
        title="Abonnements"
        eyebrow="Formules reelles Supabase"
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
              <p className="mt-1 text-sm text-neutral-500">Prix, duree et nombre de seances depuis Supabase.</p>
            </div>
            <CreditCard className="text-mint" size={22} />
          </div>

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
                  <Button variant="secondary" className="h-9 justify-self-start px-3 md:justify-self-end">
                    Modifier
                  </Button>
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
              <p className="mt-1 text-sm text-neutral-500">Les renouvellements reels seront branches avec les membres.</p>
            </div>
            <RotateCcw className="text-amber" size={22} />
          </div>
          <div className="p-5 text-sm text-neutral-500">
            Prochaine etape: connecter les membres et les abonnements actifs.
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

