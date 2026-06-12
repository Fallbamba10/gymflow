import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Crown,
  LayoutDashboard,
  Lock,
  LogOut,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { signOut } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";
import { getCurrentGym } from "@/lib/supabase/queries";
import { isActiveSubscription, TRIAL_DAYS } from "@/lib/stripe";
import { CheckoutButton, PortalButton } from "@/components/stripe-buttons";

type BillingPageProps = {
  searchParams: Promise<{ success?: string; canceled?: string }>;
};

function formatDate(iso: string | null) {
  if (!iso) return "-";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(new Date(iso));
}

function daysLeft(iso: string | null): number {
  if (!iso) return 0;
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000));
}

const features = [
  "Membres, abonnements et pointages illimités",
  "Caisse complète avec reçus imprimables",
  "Import CSV et export de données",
  "Dashboard cockpit temps réel",
  "Scanner QR pour le pointage",
  "Notifications WhatsApp automatiques",
  "Rapport mensuel PDF",
  "Rappels d'expiration par cron",
  "Vitrine publique de la salle",
  "Support prioritaire",
];

export default async function BillingPage({ searchParams }: BillingPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const sp = await searchParams;
  const gym = await getCurrentGym();
  if (!gym) redirect("/onboarding");

  const isActive = isActiveSubscription(gym.billing_status);
  const isTrialing = gym.billing_status === "trialing";
  const isCanceled = gym.billing_status === "canceled";
  const isPastDue = gym.billing_status === "past_due";
  const trialDays = daysLeft(gym.trial_ends_at);
  const periodEndDays = daysLeft(gym.billing_period_end);

  return (
    <main className="min-h-screen bg-paper">
      {/* Header */}
      <header className="border-b border-line bg-white px-4 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <BrandMark />
            <div>
              <p className="text-base font-semibold leading-none">GymFlow</p>
              <p className="mt-0.5 text-sm text-neutral-500">{gym.name}</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            {isActive && (
              <Link
                href="/"
                className="inline-flex h-10 items-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-semibold transition hover:bg-neutral-50"
              >
                <LayoutDashboard size={16} />
                Tableau de bord
              </Link>
            )}
            <form action={signOut}>
              <button className="inline-flex h-10 items-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-50">
                <LogOut size={16} />
                Déconnexion
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-10">
        {/* Notifications */}
        {sp.success === "1" && (
          <div className="mb-6 flex items-start gap-3 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-mint">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Abonnement activé !</p>
              <p className="mt-0.5 text-neutral-600">Bienvenue. Toutes les fonctionnalités GymFlow sont maintenant disponibles.</p>
            </div>
          </div>
        )}
        {sp.canceled === "1" && (
          <div className="mb-6 flex items-start gap-3 rounded-md border border-amber/30 bg-amber/10 p-4 text-sm text-amber">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <p className="font-semibold">Paiement annulé. Tu peux réessayer quand tu veux.</p>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Colonne principale */}
          <div className="space-y-6">

            {/* Statut actuel */}
            <section className="overflow-hidden rounded-xl border border-neutral-900 bg-ink text-white">
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-white/70">
                      <ShieldCheck size={13} />
                      Abonnement GymFlow
                    </div>
                    <h1 className="mt-4 text-2xl font-semibold">
                      {isTrialing && "Période d'essai en cours"}
                      {gym.billing_status === "active" && "Abonnement actif"}
                      {isCanceled && "Abonnement annulé"}
                      {isPastDue && "Paiement en échec"}
                      {gym.billing_status === "incomplete" && "Paiement incomplet"}
                    </h1>
                    <p className="mt-2 text-sm leading-6 text-white/62">
                      {isTrialing && `Profite de ${trialDays} jour${trialDays > 1 ? "s" : ""} d'essai gratuit. Souscris avant la fin pour conserver ton accès.`}
                      {gym.billing_status === "active" && `Prochain renouvellement le ${formatDate(gym.billing_period_end)}.`}
                      {isCanceled && "Ton abonnement est résilié. Souscris à nouveau pour retrouver l'accès."}
                      {isPastDue && "Le dernier paiement a échoué. Mets à jour ton moyen de paiement."}
                      {gym.billing_status === "incomplete" && "Le paiement initial n'a pas été complété."}
                    </p>
                  </div>
                  <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl border ${
                    isActive ? "border-mint/30 bg-mint/20 text-mint" : "border-danger/30 bg-danger/10 text-danger"
                  }`}>
                    {isActive ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
                  </div>
                </div>

                {/* Barre trial */}
                {isTrialing && gym.trial_ends_at && (
                  <div className="mt-5">
                    <div className="flex items-center justify-between text-xs text-white/55 mb-2">
                      <span>Début essai</span>
                      <span>{trialDays} jour{trialDays > 1 ? "s" : ""} restant{trialDays > 1 ? "s" : ""}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-mint transition-all"
                        style={{ width: `${Math.max(5, (trialDays / TRIAL_DAYS) * 100)}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-white/45">Fin d&apos;essai le {formatDate(gym.trial_ends_at)}</p>
                  </div>
                )}

                {/* Période restante si actif */}
                {gym.billing_status === "active" && periodEndDays > 0 && (
                  <div className="mt-4 border-t border-white/10 pt-4 text-xs text-white/45">
                    Période active · {periodEndDays} jour{periodEndDays > 1 ? "s" : ""} avant renouvellement
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="border-t border-white/10 p-5">
                {isTrialing || isCanceled || isPastDue || !isActive ? (
                  <CheckoutButton label={isCanceled || isPastDue ? "Réactiver l'abonnement" : "Souscrire — 5 900 FCFA/mois"} />
                ) : (
                  <div className="flex flex-wrap gap-3">
                    <PortalButton />
                    <Link
                      href="/"
                      className="inline-flex h-11 items-center gap-2 rounded-md border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/20"
                    >
                      <LayoutDashboard size={17} />
                      Tableau de bord
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                )}
              </div>
            </section>

            {/* Features incluses */}
            <section className="rounded-xl border border-line bg-white p-6 shadow-soft">
              <h2 className="font-semibold">Tout inclus dans l&apos;abonnement</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-mint" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Sidebar prix */}
          <aside className="space-y-5">
            <div className="rounded-xl border border-line bg-white p-6 shadow-soft">
              <div className="flex items-center gap-2">
                <Crown size={18} className="text-amber" />
                <h2 className="font-semibold">GymFlow Pro</h2>
              </div>

              <div className="mt-4">
                <p className="text-4xl font-semibold">
                  5 900<span className="text-lg font-medium text-neutral-500"> FCFA/mois</span>
                </p>
                <p className="mt-1 text-sm text-neutral-500">Par salle, sans engagement</p>
              </div>

              <div className="mt-5 space-y-2.5 border-t border-line pt-5 text-sm">
                {[
                  "1 salle complète",
                  "Membres et abonnements illimités",
                  `${TRIAL_DAYS} jours d'essai gratuit`,
                  "Résiliation à tout moment",
                  "Mises à jour incluses",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-neutral-600">
                    <CheckCircle2 size={14} className="shrink-0 text-mint" />
                    {item}
                  </div>
                ))}
              </div>

              {(isTrialing || !isActive || isCanceled) && (
                <div className="mt-5">
                  <CheckoutButton label="Souscrire maintenant" fullWidth />
                </div>
              )}
              {isPastDue && (
                <div className="mt-5">
                  <PortalButton fullWidth label="Mettre à jour le paiement" />
                </div>
              )}
            </div>

            <div className="rounded-xl border border-line bg-white p-5 shadow-soft">
              <div className="flex items-start gap-3">
                <Lock size={18} className="mt-0.5 shrink-0 text-mint" />
                <div>
                  <p className="text-sm font-semibold">Paiement sécurisé</p>
                  <p className="mt-1 text-xs leading-5 text-neutral-500">
                    Paiement traité par Stripe. GymFlow ne stocke aucune donnée de carte bancaire.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-line bg-white p-5 shadow-soft">
              <div className="flex items-start gap-3">
                <Sparkles size={18} className="mt-0.5 shrink-0 text-amber" />
                <div>
                  <p className="text-sm font-semibold">Questions ?</p>
                  <p className="mt-1 text-xs leading-5 text-neutral-500">
                    Contacte-nous à{" "}
                    <a href="mailto:support@gymflow.app" className="font-semibold text-mint hover:underline">
                      support@gymflow.app
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

