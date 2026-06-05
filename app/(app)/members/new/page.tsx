import Link from "next/link";
import { ArrowLeft, CheckCircle2, UserPlus } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { FormField } from "@/components/form-field";
import { PageHeader } from "@/components/page-header";
import { StaffPinFields } from "@/components/staff-pin-fields";
import { SubmitButton } from "@/components/submit-button";
import { createMember } from "@/app/(app)/members/actions";
import { formatCurrency } from "@/lib/demo-data";
import { getCurrentGym, getGymStaff, getSubscriptionTypes } from "@/lib/supabase/queries";

type NewMemberPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewMemberPage({ searchParams }: NewMemberPageProps) {
  const params = await searchParams;
  const gym = await getCurrentGym();
  const subscriptionTypes = gym ? await getSubscriptionTypes(gym.id) : [];
  const staff = gym ? await getGymStaff(gym.id) : [];

  return (
    <AppShell>
      <PageHeader
        title="Nouveau membre"
        eyebrow="Ajout rapide"
        actions={
          <Link href="/members" className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-semibold shadow-sm">
            <ArrowLeft size={18} />
            Retour
          </Link>
        }
      />

      <div className="grid gap-6 px-4 py-6 md:px-8 xl:grid-cols-[1fr_360px]">
        <form action={createMember} className="rounded-md border border-line bg-white p-5 shadow-soft">
          <div className="flex items-center gap-3 border-b border-line pb-5">
            <div className="flex size-10 items-center justify-center rounded-md bg-paper text-ink">
              <UserPlus size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Informations membre</h2>
              <p className="mt-1 text-sm text-neutral-500">Creation du membre et de son premier abonnement.</p>
            </div>
          </div>

          {params.error ? (
            <div className="mt-5 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold text-danger">
              {params.error}
            </div>
          ) : null}

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <FormField label="Nom complet">
              <input name="full_name" className="h-11 w-full rounded-md border border-line bg-paper px-3 outline-none focus:border-mint" placeholder="Nom complet" required />
            </FormField>
            <FormField label="Telephone">
              <input name="phone" className="h-11 w-full rounded-md border border-line bg-paper px-3 outline-none focus:border-mint" placeholder="+221 77 123 45 67" />
            </FormField>
            <FormField label="Formule">
              <select name="subscription_type_id" className="h-11 w-full rounded-md border border-line bg-paper px-3 outline-none focus:border-mint" required>
                {subscriptionTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name} - {formatCurrency(type.price)}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Mode de paiement">
              <select name="payment_method" className="h-11 w-full rounded-md border border-line bg-paper px-3 outline-none focus:border-mint" defaultValue="wave">
                <option value="cash">Cash</option>
                <option value="wave">Wave</option>
                <option value="orange_money">Orange Money</option>
                <option value="card">Carte bancaire</option>
                <option value="other">Autre</option>
              </select>
            </FormField>
            <FormField label="Date de debut">
              <input name="starts_at" type="date" className="h-11 w-full rounded-md border border-line bg-paper px-3 outline-none focus:border-mint" />
            </FormField>
          </div>

          <FormField label="Notes internes">
            <textarea name="notes" className="min-h-28 w-full rounded-md border border-line bg-paper p-3 outline-none focus:border-mint" placeholder="Objectif, remarques medicales, preference coach..." />
          </FormField>

          <div className="mt-5 rounded-md border border-line bg-white p-4">
            <p className="text-sm font-semibold">Employe responsable</p>
            <p className="mt-1 text-sm text-neutral-500">Selectionne un employe PIN si l&apos;inscription est encaissee par l&apos;equipe terrain.</p>
            <div className="mt-4">
              <StaffPinFields staff={staff} />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Link href="/members" className="inline-flex h-11 items-center justify-center rounded-md border border-line bg-white px-4 text-sm font-semibold">
              Annuler
            </Link>
            <SubmitButton
              type="submit"
              variant="accent"
              className="h-11"
              disabled={subscriptionTypes.length === 0}
              pendingLabel="Creation..."
            >
              <CheckCircle2 size={18} />
              Creer le membre
            </SubmitButton>
          </div>
        </form>

        <aside className="rounded-md border border-line bg-white p-5 shadow-soft">
          <h2 className="text-lg font-semibold">Avant de creer</h2>
          <div className="mt-5 space-y-4 text-sm">
            <div className="rounded-md bg-paper p-4">
              <p className="font-semibold">Formule requise</p>
              <p className="mt-1 text-neutral-500">Cree au moins une formule d&apos;abonnement avant d&apos;ajouter un membre.</p>
            </div>
            <div className="rounded-md bg-paper p-4">
              <p className="font-semibold">Abonnement actif</p>
              <p className="mt-1 text-neutral-500">GymFlow cree automatiquement l&apos;abonnement et le paiement.</p>
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
