import Link from "next/link";
import {
  Activity,
  Banknote,
  CheckCircle2,
  ClipboardList,
  Dumbbell,
  ShieldCheck,
  Smartphone,
  Users,
} from "lucide-react";
import { formatCurrency } from "@/lib/demo-data";

const features = [
  {
    title: "Membres et abonnements",
    description: "Crée les membres, renouvelle les formules et garde l'historique au même endroit.",
    icon: Users,
  },
  {
    title: "Pointage rapide",
    description: "Valide les entrées en quelques secondes, depuis ordinateur ou téléphone.",
    icon: CheckCircle2,
  },
  {
    title: "Caisse claire",
    description: "Suis les paiements, les encaissements manuels et les exports CSV.",
    icon: Banknote,
  },
  {
    title: "Pilotage quotidien",
    description: "Visualise les revenus, les alertes et les formules qui fonctionnent le mieux.",
    icon: Activity,
  },
];

const previewMembers = [
  { name: "Awa Diop", plan: "Mensuel illimite", status: "Actif" },
  { name: "Moussa Fall", plan: "Pack 10 seances", status: "2 seances" },
  { name: "Fatou Ndiaye", plan: "Trimestriel", status: "J-2" },
];

export default function SitePage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <section
        className="relative min-h-[92vh] overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(23,23,23,0.88), rgba(23,23,23,0.62), rgba(23,23,23,0.18)), url('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1800&q=80')",
        }}
      >
        <header className="relative z-10 flex items-center justify-between px-4 py-5 md:px-8">
          <Link href="/site" className="flex items-center gap-3 text-white">
            <span className="flex size-10 items-center justify-center rounded-md bg-white text-ink">
              <Dumbbell size={20} />
            </span>
            <span className="text-lg font-semibold">GymFlow</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login" className="inline-flex h-10 items-center justify-center rounded-md border border-white/40 px-4 text-sm font-semibold text-white transition hover:bg-white/10">
              Connexion
            </Link>
            <Link href="/signup" className="hidden h-10 items-center justify-center rounded-md bg-mint px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 sm:inline-flex">
              Essayer
            </Link>
          </div>
        </header>

        <div className="relative z-10 grid min-h-[calc(92vh-80px)] items-center gap-8 px-4 pb-12 md:px-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="max-w-3xl py-12 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/75">Gestion salle de sport</p>
            <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-tight md:text-7xl">
              GymFlow
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/82">
              Une application simple pour gérer les membres, les abonnements, le pointage et la caisse d&apos;une salle de sport.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup" className="inline-flex h-12 items-center justify-center rounded-md bg-mint px-5 text-sm font-semibold text-white transition hover:bg-emerald-700">
                Créer un espace
              </Link>
              <Link href="/login" className="inline-flex h-12 items-center justify-center rounded-md border border-white/45 px-5 text-sm font-semibold text-white transition hover:bg-white/10">
                Se connecter
              </Link>
            </div>
          </div>

          <div className="mb-8 rounded-md border border-white/18 bg-white/94 p-4 shadow-soft backdrop-blur md:p-5">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <p className="text-sm font-semibold text-mint">Tableau de bord</p>
                <h2 className="mt-1 text-xl font-semibold">Salle Plateau</h2>
              </div>
              <span className="rounded-md bg-emerald-50 px-3 py-1 text-xs font-semibold text-mint">En ligne</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-md bg-paper p-4">
                <p className="text-xs font-semibold uppercase text-neutral-500">Revenus</p>
                <p className="mt-2 text-lg font-semibold">{formatCurrency(84500)}</p>
              </div>
              <div className="rounded-md bg-paper p-4">
                <p className="text-xs font-semibold uppercase text-neutral-500">Entrées</p>
                <p className="mt-2 text-lg font-semibold">37</p>
              </div>
              <div className="rounded-md bg-paper p-4">
                <p className="text-xs font-semibold uppercase text-neutral-500">Alertes</p>
                <p className="mt-2 text-lg font-semibold">6</p>
              </div>
            </div>
            <div className="mt-4 overflow-hidden rounded-md border border-line">
              {previewMembers.map((member) => (
                <div key={member.name} className="grid grid-cols-[1.1fr_1fr_0.7fr] items-center border-b border-line px-3 py-3 text-sm last:border-b-0">
                  <span className="font-semibold">{member.name}</span>
                  <span className="text-neutral-600">{member.plan}</span>
                  <span className="justify-self-end rounded-md bg-paper px-2 py-1 text-xs font-semibold">{member.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase text-mint">Fonctions clés</p>
            <h2 className="mt-3 text-3xl font-semibold">Tout ce qu&apos;il faut pour gérer une salle au quotidien.</h2>
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

      <section className="border-y border-line bg-white px-4 py-14 md:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
          <div className="rounded-md bg-paper p-6">
            <Smartphone className="text-mint" size={24} />
            <h3 className="mt-4 text-lg font-semibold">Mobile prêt pour le pointage</h3>
            <p className="mt-2 text-sm leading-6 text-neutral-600">L&apos;équipe peut pointer les membres directement depuis un téléphone.</p>
          </div>
          <div className="rounded-md bg-paper p-6">
            <ClipboardList className="text-mint" size={24} />
            <h3 className="mt-4 text-lg font-semibold">Exports propres</h3>
            <p className="mt-2 text-sm leading-6 text-neutral-600">Les membres et paiements sortent en CSV pour Excel ou Google Sheets.</p>
          </div>
          <div className="rounded-md bg-paper p-6">
            <ShieldCheck className="text-mint" size={24} />
            <h3 className="mt-4 text-lg font-semibold">Données isolées</h3>
            <p className="mt-2 text-sm leading-6 text-neutral-600">Chaque salle travaille dans son espace, connecté à Supabase avec RLS.</p>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 rounded-md border border-line bg-ink p-6 text-white md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Prêt à tester GymFlow ?</h2>
            <p className="mt-2 text-sm text-white/70">Crée ton espace, configure ta salle et commence avec tes premières formules.</p>
          </div>
          <Link href="/signup" className="inline-flex h-11 items-center justify-center rounded-md bg-mint px-5 text-sm font-semibold text-white transition hover:bg-emerald-700">
            Commencer
          </Link>
        </div>
      </section>
    </main>
  );
}
