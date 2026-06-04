import Link from "next/link";
import { ArrowLeft, Banknote, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { FormField } from "@/components/form-field";
import { PageHeader } from "@/components/page-header";
import { SubmitButton } from "@/components/submit-button";
import { createManualPayment } from "@/app/(app)/payments/actions";
import { getCurrentGym, getMembers } from "@/lib/supabase/queries";

type NewPaymentPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewPaymentPage({ searchParams }: NewPaymentPageProps) {
  const params = await searchParams;
  const gym = await getCurrentGym();
  const members = gym ? await getMembers(gym.id) : [];

  return (
    <AppShell>
      <PageHeader
        title="Nouvel encaissement"
        eyebrow="Caisse"
        actions={
          <Link href="/payments" className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-semibold shadow-sm">
            <ArrowLeft size={18} />
            Retour
          </Link>
        }
      />

      <div className="grid gap-6 px-4 py-6 md:px-8 xl:grid-cols-[1fr_360px]">
        <form action={createManualPayment} className="rounded-md border border-line bg-white p-5 shadow-soft">
          <div className="flex items-center gap-3 border-b border-line pb-5">
            <div className="flex size-10 items-center justify-center rounded-md bg-paper text-ink">
              <Banknote size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Details du paiement</h2>
              <p className="mt-1 text-sm text-neutral-500">Ajoute un encaissement hors abonnement automatique.</p>
            </div>
          </div>

          {params.error ? (
            <div className="mt-5 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold text-danger">
              {params.error}
            </div>
          ) : null}

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <FormField label="Montant">
              <input
                name="amount"
                type="number"
                className="h-11 w-full rounded-md border border-line bg-paper px-3 outline-none focus:border-mint"
                min="1"
                placeholder="5000"
                required
              />
            </FormField>
            <FormField label="Mode de paiement">
              <select
                name="method"
                className="h-11 w-full rounded-md border border-line bg-paper px-3 outline-none focus:border-mint"
                defaultValue="cash"
              >
                <option value="cash">Especes</option>
                <option value="wave">Wave</option>
                <option value="orange_money">Orange Money</option>
                <option value="card">Carte</option>
                <option value="other">Autre</option>
              </select>
            </FormField>
          </div>

          <div className="mt-5">
            <FormField label="Membre lie">
              <select
                name="member_id"
                className="h-11 w-full rounded-md border border-line bg-paper px-3 outline-none focus:border-mint"
                defaultValue=""
              >
                <option value="">Aucun membre</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.full_name} - {String(member.member_number).padStart(6, "0")}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="mt-5">
            <FormField label="Note">
              <textarea
                name="notes"
                className="min-h-28 w-full rounded-md border border-line bg-paper p-3 outline-none focus:border-mint"
                placeholder="Frais inscription, vente boisson, ajustement caisse..."
              />
            </FormField>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Link href="/payments" className="inline-flex h-11 items-center justify-center rounded-md border border-line bg-white px-4 text-sm font-semibold">
              Annuler
            </Link>
            <SubmitButton type="submit" variant="accent" className="h-11" pendingLabel="Enregistrement...">
              <CheckCircle2 size={18} />
              Enregistrer
            </SubmitButton>
          </div>
        </form>

        <aside className="rounded-md border border-line bg-white p-5 shadow-soft">
          <h2 className="text-lg font-semibold">Quand l&apos;utiliser</h2>
          <div className="mt-5 space-y-4 text-sm">
            <div className="rounded-md bg-paper p-4">
              <p className="font-semibold">Paiements divers</p>
              <p className="mt-1 text-neutral-500">Frais d&apos;inscription, vente ponctuelle, acompte ou correction.</p>
            </div>
            <div className="rounded-md bg-paper p-4">
              <p className="font-semibold">Abonnements</p>
              <p className="mt-1 text-neutral-500">Pour un abonnement, garde le renouvellement depuis la fiche membre.</p>
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
