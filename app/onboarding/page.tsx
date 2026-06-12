import Link from "next/link";
import { ArrowRight, Building2, CheckCircle2, CreditCard, Users, Zap } from "lucide-react";
import { EnvWarning } from "@/components/env-warning";
import { SubmitButton } from "@/components/submit-button";
import { createGym } from "@/app/auth/actions";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type OnboardingPageProps = {
  searchParams: Promise<{ error?: string }>;
};

const steps = [
  {
    number: 1,
    label: "Ta salle",
    desc: "Nom, adresse, téléphone",
    icon: Building2,
    active: true,
  },
  {
    number: 2,
    label: "Formules",
    desc: "Mensuel, trimestriel...",
    icon: CreditCard,
    active: false,
  },
  {
    number: 3,
    label: "Équipe",
    desc: "Ajouter des opérateurs",
    icon: Users,
    active: false,
  },
];

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const params = await searchParams;
  const enabled = hasSupabaseEnv();

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      {/* Fond photo */}
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=2400&q=88')",
          opacity: 0.16,
        }}
      />
      {/* Dégradé */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#080808]/95 via-[#080808]/75 to-[#080808]/95" />
      {/* Glow émeraude */}
      <div className="pointer-events-none fixed left-[25%] top-[40%] h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-[130px]" />

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Nav */}
        <header className="flex items-center justify-between px-6 py-5 md:px-12">
          <Link href="/site" className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-white">
              <Zap size={15} className="text-[#080808]" fill="currentColor" />
            </div>
            <span className="text-sm font-semibold tracking-tight">GymFlow</span>
          </Link>
          <Link
            href="/login"
            className="text-xs font-semibold text-white/35 transition hover:text-white/65"
          >
            Déjà un compte ?
          </Link>
        </header>

        {/* Corps */}
        <div className="flex flex-1 items-center px-6 py-10 md:px-12">
          <div className="mx-auto grid w-full max-w-5xl gap-16 lg:grid-cols-[1fr_440px] lg:items-center">

            {/* Gauche */}
            <div className="hidden lg:block">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-white/40 backdrop-blur">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                Configuration initiale
              </div>

              <h2 className="text-[2.8rem] font-semibold leading-tight tracking-tight">
                Ta salle prête
                <br />
                <span className="text-emerald-400">en 3 étapes.</span>
              </h2>

              <p className="mt-5 max-w-sm text-base leading-8 text-white/45">
                Commence par nommer ton espace. Les formules et l&apos;équipe s&apos;ajoutent depuis le tableau de bord, à ton rythme.
              </p>

              {/* Steps */}
              <div className="mt-10 space-y-3">
                {steps.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.number} className="flex items-start gap-4">
                      {/* Connecteur vertical */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex size-10 shrink-0 items-center justify-center rounded-2xl text-sm font-bold transition ${
                            step.active
                              ? "bg-emerald-500 text-white"
                              : "border border-white/10 bg-white/5 text-white/25"
                          }`}
                        >
                          {step.active ? <CheckCircle2 size={18} /> : <Icon size={16} />}
                        </div>
                        {i < steps.length - 1 && (
                          <div className="mt-1 h-8 w-px bg-white/8" />
                        )}
                      </div>
                      <div className={`pb-2 pt-1.5 ${step.active ? "" : "opacity-40"}`}>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold">{step.label}</p>
                          {step.active && (
                            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-400">
                              Maintenant
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-white/40">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="mt-8 text-xs text-white/25">
                Les étapes 2 et 3 sont disponibles depuis les Paramètres.
              </p>
            </div>

            {/* Droite — formulaire */}
            <div className="w-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
              {/* En-tête carte */}
              <div className="relative overflow-hidden border-b border-white/8 px-8 py-6">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent" />
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex size-6 items-center justify-center rounded-md bg-white">
                      <Zap size={11} className="text-[#080808]" fill="currentColor" />
                    </div>
                    <span className="text-xs font-semibold text-white/40">GymFlow</span>
                  </div>
                  {/* Progress dots */}
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-6 rounded-full bg-emerald-500" />
                    <span className="h-1.5 w-6 rounded-full bg-white/15" />
                    <span className="h-1.5 w-6 rounded-full bg-white/15" />
                  </div>
                </div>
                <h1 className="text-xl font-semibold">Nomme ton espace</h1>
                <p className="mt-1 text-sm text-white/45">
                  Ces infos apparaissent sur ta vitrine et tes reçus.
                </p>
              </div>

              {/* Formulaire */}
              <div className="px-8 py-7">
                {!enabled ? <div className="mb-5"><EnvWarning /></div> : null}

                {params.error ? (
                  <div className="mb-5 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400">
                    {params.error}
                  </div>
                ) : null}

                <form action={createGym} className="space-y-4">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-white/70">
                      Nom de la salle <span className="text-red-400">*</span>
                    </span>
                    <input
                      className="h-11 w-full rounded-xl border border-white/10 bg-white/6 px-3.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-emerald-500/60 focus:bg-white/8"
                      name="name"
                      placeholder="Ex. Iron Club Dakar"
                      required
                      autoFocus
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-white/70">Téléphone</span>
                    <input
                      className="h-11 w-full rounded-xl border border-white/10 bg-white/6 px-3.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-emerald-500/60 focus:bg-white/8"
                      name="phone"
                      placeholder="+221 77 123 45 67"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-white/70">Adresse</span>
                    <input
                      className="h-11 w-full rounded-xl border border-white/10 bg-white/6 px-3.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-emerald-500/60 focus:bg-white/8"
                      name="address"
                      placeholder="Ex. Dakar Plateau, Avenue Pompidou"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-white/70">Devise</span>
                    <select
                      className="h-11 w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-3.5 text-sm text-white outline-none transition focus:border-emerald-500/60"
                      name="currency"
                      defaultValue="XOF"
                    >
                      <option value="XOF">F CFA (XOF)</option>
                      <option value="EUR">Euro (EUR)</option>
                      <option value="USD">Dollar (USD)</option>
                      <option value="GHS">Cedi (GHS)</option>
                      <option value="XOF">Franc malien (XOF)</option>
                    </select>
                  </label>

                  <SubmitButton
                    className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 font-semibold text-white hover:bg-emerald-400 disabled:opacity-60"
                    disabled={!enabled}
                    pendingLabel="Configuration en cours..."
                  >
                    Créer mon espace
                    <ArrowRight size={16} />
                  </SubmitButton>
                </form>

                <p className="mt-5 text-center text-xs text-white/25">
                  Tu pourras tout modifier depuis les Paramètres.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
