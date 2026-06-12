import Link from "next/link";
import { ArrowLeft, Banknote, CheckCircle2, Info } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { FormField } from "@/components/form-field";
import { PageHeader } from "@/components/page-header";
import { SubmitButton } from "@/components/submit-button";
import { createManualPayment } from "@/app/(app)/payments/actions";
import { requireAdminGym } from "@/lib/supabase/guards";
import { getMembers } from "@/lib/supabase/queries";

const inputCls =
  "h-11 w-full rounded-xl border border-white/10 bg-white/6 px-3.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-emerald-500/60 focus:bg-white/8";

const selectCls =
  "h-11 w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-3.5 text-sm text-white outline-none transition focus:border-emerald-500/60";

export default async function NewPaymentPage() {
  const gym = await requireAdminGym();
  const members = await getMembers(gym.id);

  return (
    <AppShell>
      <PageHeader
        title="Nouvel encaissement"
        eyebrow="Caisse"
        actions={
          <Link
            href="/payments"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white/60 transition hover:bg-white/8 hover:text-white"
          >
            <ArrowLeft size={16} />
            Retour
          </Link>
        }
      />

      <div className="grid gap-4 px-6 py-6 md:px-8 xl:grid-cols-[1fr_300px]">
        <form action={createManualPayment} className="overflow-hidden rounded-2xl border border-white/8 bg-white/4">
          <div className="flex items-center gap-3 border-b border-white/8 px-6 py-5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
              <Banknote size={17} />
            </div>
            <div>
              <h2 className="font-semibold">Détails du paiement</h2>
              <p className="mt-0.5 text-xs text-white/40">Ajoute un encaissement hors abonnement automatique.</p>
            </div>
          </div>

          <div className="px-6 py-6">
            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="Montant">
                <input
                  name="amount"
                  type="number"
                  className={inputCls}
                  min="1"
                  placeholder="5000"
                  required
                />
              </FormField>
              <FormField label="Mode de paiement">
                <select name="method" className={selectCls} defaultValue="cash">
                  <option value="cash">Espèces</option>
                  <option value="wave">Wave</option>
                  <option value="orange_money">Orange Money</option>
                  <option value="card">Carte</option>
                  <option value="other">Autre</option>
                </select>
              </FormField>
            </div>

            <div className="mt-5">
              <FormField label="Membre lié">
                <select name="member_id" className={selectCls} defaultValue="">
                  <option value="">Aucun membre</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.full_name} — {String(member.member_number).padStart(6, "0")}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            <div className="mt-5">
              <FormField label="Note">
                <textarea
                  name="notes"
                  className="min-h-28 w-full rounded-xl border border-white/10 bg-white/6 p-3.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-emerald-500/60 focus:bg-white/8"
                  placeholder="Frais d'inscription, vente boisson, ajustement caisse…"
                />
              </FormField>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Link
                href="/payments"
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

        <aside className="space-y-3 xl:sticky xl:top-24 xl:self-start">
          <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/4">
            <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
              <h2 className="font-semibold">Quand l&apos;utiliser</h2>
              <Info size={16} className="text-white/30" />
            </div>
            <div className="space-y-3 p-5">
              <div className="rounded-xl border border-white/6 bg-white/4 p-4">
                <p className="text-sm font-semibold">Paiements divers</p>
                <p className="mt-1 text-xs leading-5 text-white/40">
                  Frais d&apos;inscription, vente ponctuelle, acompte ou correction de caisse.
                </p>
              </div>
              <div className="rounded-xl border border-white/6 bg-white/4 p-4">
                <p className="text-sm font-semibold">Abonnements</p>
                <p className="mt-1 text-xs leading-5 text-white/40">
                  Pour un abonnement, préfère le renouvellement depuis la fiche membre.
                </p>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/8 p-4">
                <p className="text-xs font-semibold text-emerald-400">Bon à savoir</p>
                <p className="mt-1 text-xs leading-5 text-emerald-400/70">
                  Ce paiement apparaîtra dans le journal caisse et sur le rapport mensuel.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
