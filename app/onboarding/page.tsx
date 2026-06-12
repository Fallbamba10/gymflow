import Link from "next/link";
import { ArrowRight, Building2, CheckCircle2, CreditCard, Sparkles, Users } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { EnvWarning } from "@/components/env-warning";
import { SubmitButton } from "@/components/submit-button";
import { createGym } from "@/app/auth/actions";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type OnboardingPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

const steps = [
  { number: 1, label: "Votre salle", icon: Building2, active: true },
  { number: 2, label: "Formules", icon: CreditCard, active: false },
  { number: 3, label: "Equipe", icon: Users, active: false },
];

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const params = await searchParams;
  const enabled = hasSupabaseEnv();

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-ink px-4 py-8 text-white"
      style={{
        backgroundImage:
          "linear-gradient(115deg, rgba(10,10,10,0.96) 0%, rgba(10,10,10,0.84) 46%, rgba(10,10,10,0.52) 100%), url('https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=2200&q=85')",
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col">
        {/* Header */}
        <header className="flex items-center justify-between py-2">
          <Link href="/site" className="flex items-center gap-3">
            <BrandMark inverse />
            <div>
              <p className="text-base font-semibold leading-none">GymFlow</p>
              <p className="mt-0.5 text-xs text-white/55">Gestion de salle premium</p>
            </div>
          </Link>
          <Link href="/login" className="text-sm font-semibold text-white/60 transition hover:text-white">
            Deja un compte ?
          </Link>
        </header>

        <div className="flex flex-1 items-center">
          <section className="grid w-full gap-8 lg:grid-cols-[1fr_460px] lg:items-center">

            {/* Left — context */}
            <div className="hidden max-w-2xl lg:block">
              <p className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/70 backdrop-blur">
                <Sparkles size={14} />
                Configuration initiale
              </p>
              <h1 className="mt-6 text-5xl font-semibold leading-tight">
                Votre salle prête en 3 étapes.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-8 text-white/65">
                Commencez par nommer votre espace. Ajoutez ensuite vos formules et votre équipe depuis le tableau de bord.
              </p>

              <div className="mt-10 space-y-3">
                {steps.map((step) => (
                  <div
                    key={step.number}
                    className={`flex items-center gap-4 rounded-md border px-4 py-3 transition ${
                      step.active
                        ? "border-mint/40 bg-mint/10 text-white"
                        : "border-white/10 bg-white/5 text-white/40"
                    }`}
                  >
                    <div className={`flex size-9 shrink-0 items-center justify-center rounded-md text-sm font-semibold ${
                      step.active ? "bg-mint text-white" : "bg-white/10 text-white/40"
                    }`}>
                      {step.active ? <CheckCircle2 size={17} /> : <span>{step.number}</span>}
                    </div>
                    <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold">{step.label}</p>
                      </div>
                      {step.active && (
                        <span className="rounded-md bg-mint/20 px-2 py-0.5 text-xs font-semibold text-mint">
                          En cours
                        </span>
                      )}
                      {!step.active && (
                        <span className="text-xs text-white/30">Après</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-8 text-sm text-white/40">
                Les étapes 2 et 3 se font depuis votre tableau de bord, à votre rythme.
              </p>
            </div>

            {/* Right — form */}
            <div className="w-full rounded-md border border-white/18 bg-white p-6 text-ink shadow-soft backdrop-blur md:p-8">
              <div className="flex items-center justify-between gap-4 border-b border-line pb-5">
                <div className="flex items-center gap-3">
                  <BrandMark />
                  <div>
                    <p className="text-lg font-semibold leading-none">Votre salle</p>
                    <p className="mt-1 text-sm text-neutral-500">Etape 1 sur 3</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-8 rounded-full bg-mint" />
                  <span className="h-2 w-8 rounded-full bg-line" />
                  <span className="h-2 w-8 rounded-full bg-line" />
                </div>
              </div>

              <div className="mt-6">
                <h2 className="text-2xl font-semibold">Nommez votre espace</h2>
                <p className="mt-2 text-sm leading-6 text-neutral-500">
                  Ces informations apparaîtront sur votre vitrine publique et vos reçus.
                </p>
              </div>

              {!enabled ? <div className="mt-5"><EnvWarning /></div> : null}

              {params.error ? (
                <div className="mt-5 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold text-danger">
                  {params.error}
                </div>
              ) : null}

              <form action={createGym} className="mt-6 space-y-4">
                <label className="block">
                  <span className="text-sm font-semibold text-neutral-700">Nom de la salle <span className="text-danger">*</span></span>
                  <input
                    className="mt-2 h-11 w-full rounded-md border border-line bg-paper px-3 outline-none focus:border-mint"
                    name="name"
                    placeholder="Ex. Iron Club Dakar"
                    required
                    autoFocus
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-neutral-700">Téléphone</span>
                  <input
                    className="mt-2 h-11 w-full rounded-md border border-line bg-paper px-3 outline-none focus:border-mint"
                    name="phone"
                    placeholder="+221 77 123 45 67"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-neutral-700">Adresse</span>
                  <input
                    className="mt-2 h-11 w-full rounded-md border border-line bg-paper px-3 outline-none focus:border-mint"
                    name="address"
                    placeholder="Ex. Dakar Plateau, Avenue Pompidou"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-neutral-700">Devise</span>
                  <select
                    className="mt-2 h-11 w-full rounded-md border border-line bg-paper px-3 outline-none focus:border-mint"
                    name="currency"
                    defaultValue="XOF"
                  >
                    <option value="XOF">F CFA (XOF)</option>
                    <option value="EUR">Euro (EUR)</option>
                    <option value="USD">Dollar (USD)</option>
                  </select>
                </label>

                <SubmitButton
                  variant="accent"
                  className="mt-2 h-12 w-full gap-2"
                  disabled={!enabled}
                  pendingLabel="Configuration en cours..."
                >
                  Créer mon espace
                  <ArrowRight size={17} />
                </SubmitButton>
              </form>

              <p className="mt-5 text-center text-xs text-neutral-400">
                Vous pourrez tout modifier depuis les paramètres.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
