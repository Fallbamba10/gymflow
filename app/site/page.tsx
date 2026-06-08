import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Banknote,
  CheckCircle2,
  ClipboardList,
  ShieldCheck,
  Smartphone,
  Users,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";

const features = [
  {
    title: "Pointage comptoir",
    description: "Abonnes, passages matin/soir et seances simples depuis le meme ecran.",
    icon: CheckCircle2,
  },
  {
    title: "Caisse propre",
    description: "Paiements, recus, exports et repartition par moyen sans feuille volante.",
    icon: Banknote,
  },
  {
    title: "Membres lisibles",
    description: "Statuts, seances restantes, renouvellements et historique en un coup d'oeil.",
    icon: Users,
  },
  {
    title: "Espace employe",
    description: "Une vue simple pour l'equipe terrain, separee du pilotage gerant.",
    icon: Smartphone,
  },
];

export default function SitePage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <section
        className="relative min-h-[92vh] overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(12,12,12,0.92), rgba(12,12,12,0.62), rgba(12,12,12,0.16)), url('https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=2200&q=85')",
        }}
      >
        <header className="relative z-10 flex items-center justify-between px-4 py-5 md:px-8">
          <Link href="/site" className="flex items-center gap-3 text-white">
            <BrandMark inverse />
            <span className="text-lg font-semibold">GymFlow</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login" className="inline-flex h-10 items-center justify-center rounded-md border border-white/35 px-4 text-sm font-semibold text-white transition hover:bg-white/10">
              Connexion
            </Link>
            <Link href="/signup" className="hidden h-10 items-center justify-center rounded-md bg-mint px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 sm:inline-flex">
              Essayer
            </Link>
          </div>
        </header>

        <div className="relative z-10 flex min-h-[calc(92vh-80px)] flex-col justify-end px-4 pb-10 md:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_430px] lg:items-end">
            <div className="max-w-4xl py-12 text-white">
              <p className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/75">
                <ShieldCheck size={14} />
                Gestion premium pour salles de sport
              </p>
              <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-tight md:text-7xl">
                GymFlow
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/82">
                Une application claire pour piloter les membres, les abonnements, le pointage, les seances simples et la caisse.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/signup" className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-mint px-5 text-sm font-semibold text-white transition hover:bg-emerald-700">
                  Creer un espace
                  <ArrowRight size={17} />
                </Link>
                <Link href="/login" className="inline-flex h-12 items-center justify-center rounded-md border border-white/45 px-5 text-sm font-semibold text-white transition hover:bg-white/10">
                  Se connecter
                </Link>
              </div>
            </div>

            <div className="mb-4 rounded-md border border-white/18 bg-white/95 p-5 text-ink shadow-soft backdrop-blur">
              <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
                <div>
                  <p className="text-sm font-semibold text-mint">Interface signature</p>
                  <h2 className="mt-1 text-xl font-semibold">Pilotage de salle</h2>
                </div>
                <span className="rounded-md bg-ink px-3 py-1 text-xs font-semibold text-white">Premium</span>
              </div>

              <div className="mt-5 space-y-4">
                <div className="rounded-md border border-line bg-paper p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">Gerant</p>
                      <p className="mt-2 text-lg font-semibold">Dashboard clair</p>
                    </div>
                    <Activity className="text-mint" size={22} />
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="h-2 rounded-full bg-ink" />
                    <div className="h-2 rounded-full bg-mint" />
                    <div className="h-2 rounded-full bg-amber" />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-md border border-line bg-white p-4">
                    <CheckCircle2 className="text-mint" size={20} />
                    <p className="mt-3 text-sm font-semibold">Pointage fluide</p>
                    <p className="mt-1 text-xs leading-5 text-neutral-500">Abonnes et seances simples au comptoir.</p>
                  </div>
                  <div className="rounded-md border border-line bg-white p-4">
                    <Banknote className="text-mint" size={20} />
                    <p className="mt-3 text-sm font-semibold">Caisse maitrisee</p>
                    <p className="mt-1 text-xs leading-5 text-neutral-500">Paiements, recus et exports propres.</p>
                  </div>
                </div>

                <div className="rounded-md bg-ink p-4 text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-white/45">Experience</p>
                  <p className="mt-2 text-sm font-semibold">Une salle geree avec calme, precision et style.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase text-mint">Pourquoi GymFlow</p>
              <h2 className="mt-3 text-3xl font-semibold md:text-4xl">Moins d&apos;ecrans compliques. Plus de controle au quotidien.</h2>
            </div>
            <p className="text-sm leading-7 text-neutral-600">
              GymFlow se concentre sur les gestes reels d&apos;une salle : accueillir, pointer, encaisser, renouveler, suivre. Le gerant garde les chiffres, l&apos;equipe garde une interface simple.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => (
              <article key={feature.title} className="rounded-md border border-line bg-white p-5 shadow-soft">
                <div className="flex size-10 items-center justify-center rounded-md bg-paper text-ink">
                  <feature.icon size={20} />
                </div>
                <h3 className="mt-5 font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-neutral-600">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-white px-4 py-16 md:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div
            className="min-h-[420px] rounded-md bg-cover bg-center shadow-soft"
            style={{
              backgroundImage:
                "linear-gradient(180deg, rgba(23,23,23,0.08), rgba(23,23,23,0.46)), url('https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&w=1600&q=85')",
            }}
          />
          <div>
            <p className="text-sm font-semibold uppercase text-mint">Terrain</p>
            <h2 className="mt-3 text-3xl font-semibold">Construit pour les salles qui travaillent vite.</h2>
            <div className="mt-6 space-y-4">
              <div className="flex gap-3">
                <Activity className="mt-1 shrink-0 text-mint" size={20} />
                <p className="text-sm leading-7 text-neutral-600">Dashboard gerant avec revenus, entrees, alertes et priorites clients.</p>
              </div>
              <div className="flex gap-3">
                <ClipboardList className="mt-1 shrink-0 text-mint" size={20} />
                <p className="text-sm leading-7 text-neutral-600">Exports propres pour les membres, la caisse et la sauvegarde complete.</p>
              </div>
              <div className="flex gap-3">
                <ShieldCheck className="mt-1 shrink-0 text-mint" size={20} />
                <p className="text-sm leading-7 text-neutral-600">Roles separes : le proprietaire gere, l&apos;employe pointe.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 rounded-md border border-neutral-900 bg-ink p-6 text-white md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Pret a lancer ta salle sur GymFlow ?</h2>
            <p className="mt-2 text-sm text-white/70">Cree ton espace, ajoute tes formules et teste le pointage en quelques minutes.</p>
          </div>
          <Link href="/signup" className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-mint px-5 text-sm font-semibold text-white transition hover:bg-emerald-700">
            Commencer
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </main>
  );
}
