import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  CheckCircle2,
  ClipboardList,
  Crown,
  Gauge,
  Layers3,
  ShieldCheck,
  Smartphone,
  Users,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";

const productPillars = [
  {
    title: "Pointage signature",
    description: "Abonnes, passages matin/soir, packs de seances et clients comptoir dans un geste simple.",
    icon: CheckCircle2,
  },
  {
    title: "Caisse maitrisee",
    description: "Chaque encaissement reste clair : moyen de paiement, recu, historique et export propre.",
    icon: Banknote,
  },
  {
    title: "Pilotage gerant",
    description: "Revenus, entrees, alertes et priorites visibles sans transformer la salle en bureau complique.",
    icon: Gauge,
  },
  {
    title: "Espace equipe",
    description: "Les employes pointent et encaissent dans une vue dediee, pendant que le proprietaire garde le controle.",
    icon: Smartphone,
  },
];

const standards = [
  "Un accueil plus rapide au comptoir",
  "Des formules visibles et faciles a vendre",
  "Une caisse lisible a la fin de la journee",
  "Une experience mobile propre pour gerants et equipe",
];

const flows = [
  {
    label: "01",
    title: "Accueil",
    text: "Le membre arrive, l'equipe retrouve son profil, valide le passage ou vend une seance.",
  },
  {
    label: "02",
    title: "Encaissement",
    text: "La vente est enregistree proprement avec le bon type de paiement et le bon contexte.",
  },
  {
    label: "03",
    title: "Pilotage",
    text: "Le gerant suit les entrees, les abonnements, les paiements et les actions a traiter.",
  },
];

export const metadata: Metadata = {
  title: "GymFlow · Logiciel de gestion de salle de sport",
  description:
    "GymFlow simplifie la gestion de votre salle de sport : membres, abonnements, pointage, caisse et équipe. Pensé pour les salles en Afrique de l'Ouest.",
  openGraph: {
    title: "GymFlow · Logiciel de gestion de salle de sport",
    description:
      "Pointage, abonnements, caisse et équipe dans une interface premium. Pensé pour les salles de sport en Afrique de l'Ouest.",
    type: "website",
    siteName: "GymFlow",
    images: [
      {
        url: "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "GymFlow - Logiciel de gestion de salle",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GymFlow · Logiciel de gestion de salle de sport",
    description: "Pointage, abonnements, caisse et équipe. Interface premium pour salles de sport.",
  },
};

export default function SitePage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <section
        className="relative overflow-hidden bg-cover bg-center text-white"
        style={{
          backgroundImage:
            "linear-gradient(105deg, rgba(10,10,10,0.96) 0%, rgba(10,10,10,0.82) 44%, rgba(10,10,10,0.36) 100%), url('https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=2400&q=88')",
        }}
      >
        <header className="relative z-10 flex items-center justify-between px-4 py-5 md:px-8">
          <Link href="/site" className="flex items-center gap-3">
            <BrandMark inverse />
            <span className="text-lg font-semibold">GymFlow</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login" className="inline-flex h-10 items-center justify-center rounded-md border border-white/35 px-4 text-sm font-semibold transition hover:bg-white/10">
              Connexion
            </Link>
            <Link href="/signup" className="hidden h-10 items-center justify-center rounded-md bg-mint px-4 text-sm font-semibold transition hover:bg-emerald-700 sm:inline-flex">
              Ouvrir un espace
            </Link>
          </div>
        </header>

        <div className="relative z-10 mx-auto grid min-h-[calc(94vh-80px)] max-w-7xl gap-8 px-4 pb-8 pt-10 md:px-8 lg:grid-cols-[1fr_430px] lg:items-end">
          <div className="max-w-4xl py-10">
            <p className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/76 backdrop-blur">
              <Crown size={14} />
              Logiciel premium pour salles ambitieuses
            </p>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-tight md:text-7xl">
              GymFlow
            </h1>
            <p className="mt-5 max-w-3xl text-2xl font-semibold leading-tight text-white md:text-4xl">
              Une salle mieux tenue. Un comptoir plus fluide. Un gerant plus serein.
            </p>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/72 md:text-lg">
              GymFlow rassemble le pointage, les seances simples, les abonnements, la caisse et l&apos;equipe dans une experience calme, moderne et classe.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup" className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-mint px-5 text-sm font-semibold transition hover:bg-emerald-700">
                Creer mon espace
                <ArrowRight size={17} />
              </Link>
              <Link href="/login" className="inline-flex h-12 items-center justify-center rounded-md border border-white/45 px-5 text-sm font-semibold transition hover:bg-white/10">
                Acceder a GymFlow
              </Link>
            </div>
          </div>

          <aside className="mb-4 rounded-md border border-white/18 bg-white p-5 text-ink shadow-soft backdrop-blur">
            <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
              <div>
                <p className="text-sm font-semibold text-mint">Interface signature</p>
                <h2 className="mt-1 text-xl font-semibold">Le geste comptoir</h2>
              </div>
              <span className="rounded-md bg-ink px-3 py-1 text-xs font-semibold text-white">Prive</span>
            </div>

            <div className="mt-5 space-y-3">
              {["Identifier", "Pointer", "Encaisser"].map((step, index) => (
                <div key={step} className="grid grid-cols-[42px_1fr_auto] items-center gap-3 rounded-md border border-line bg-paper p-3">
                  <span className="flex size-10 items-center justify-center rounded-md bg-white text-sm font-semibold">
                    {index + 1}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{step}</span>
                    <span className="mt-1 block text-xs text-neutral-500">
                      {index === 0 ? "Profil, formule ou seance simple" : index === 1 ? "Passage valide sans friction" : "Caisse propre et tracee"}
                    </span>
                  </span>
                  <CheckCircle2 className="text-mint" size={18} />
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-md bg-ink p-4 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-white/45">Standard GymFlow</p>
              <p className="mt-2 text-sm font-semibold">Simple pour l&apos;equipe. Elegant pour le gerant. Solide pour la caisse.</p>
            </div>
          </aside>
        </div>
      </section>

      <section className="px-4 py-16 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase text-mint">La promesse</p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight md:text-5xl">
                Une application qui respecte le rythme reel d&apos;une salle.
              </h2>
            </div>
            <p className="text-sm leading-7 text-neutral-600 md:text-base">
              GymFlow n&apos;essaie pas d&apos;impressionner avec des ecrans inutiles. Il rend les operations essentielles plus propres : accueillir, pointer, vendre, renouveler, verifier et suivre.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {productPillars.map((pillar) => (
              <article key={pillar.title} className="rounded-md border border-line bg-white p-5 shadow-soft">
                <div className="flex size-11 items-center justify-center rounded-md bg-ink text-white">
                  <pillar.icon size={20} />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{pillar.title}</h3>
                <p className="mt-3 text-sm leading-6 text-neutral-600">{pillar.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-white px-4 py-16 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div
            className="min-h-[500px] rounded-md bg-cover bg-center shadow-soft"
            style={{
              backgroundImage:
                "linear-gradient(180deg, rgba(23,23,23,0.08), rgba(23,23,23,0.46)), url('https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&w=1800&q=88')",
            }}
          />
          <div>
            <p className="text-sm font-semibold uppercase text-mint">Experience</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight md:text-4xl">
              Le produit doit disparaitre derriere la qualite du service.
            </h2>
            <p className="mt-5 text-sm leading-7 text-neutral-600">
              Une bonne salle ne veut pas perdre du temps a expliquer son logiciel. GymFlow donne des actions nettes, des textes clairs et une vue qui ne fatigue pas.
            </p>
            <div className="mt-7 grid gap-3">
              {standards.map((standard) => (
                <div key={standard} className="flex items-center gap-3 rounded-md border border-line bg-paper px-4 py-3">
                  <ShieldCheck className="shrink-0 text-mint" size={19} />
                  <p className="text-sm font-semibold">{standard}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ink px-4 py-16 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase text-mint">Le flow</p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight md:text-5xl">
                Trois moments. Une seule logique.
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {flows.map((flow) => (
                <article key={flow.label} className="rounded-md border border-white/12 bg-white/8 p-5">
                  <p className="font-mono text-xs font-semibold text-amber">{flow.label}</p>
                  <h3 className="mt-4 text-lg font-semibold">{flow.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/64">{flow.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase text-mint">Salles partenaires</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight md:text-4xl">
              Chaque salle garde son identite. GymFlow apporte la structure.
            </h2>
            <p className="mt-5 text-sm leading-7 text-neutral-600">
              Pages publiques, formules, telephone, adresse et presentation propre. Le client voit une salle serieuse avant meme d&apos;arriver.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-md border border-line bg-white p-5 shadow-soft">
              <Layers3 className="text-mint" size={22} />
              <h3 className="mt-4 font-semibold">Page salle claire</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-600">Une vitrine simple pour presenter les formules et faciliter le contact.</p>
            </div>
            <div className="rounded-md border border-line bg-white p-5 shadow-soft">
              <Users className="text-mint" size={22} />
              <h3 className="mt-4 font-semibold">Experience client</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-600">Le futur membre comprend vite quoi choisir et comment joindre la salle.</p>
            </div>
            <div className="rounded-md border border-line bg-white p-5 shadow-soft sm:col-span-2">
              <ClipboardList className="text-mint" size={22} />
              <h3 className="mt-4 font-semibold">Administration discrete</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-600">
                Le proprietaire configure, l&apos;equipe travaille, et la salle garde une image professionnelle.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-ink px-4 py-16 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase text-mint">Tarifs</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight md:text-5xl">
              Simple. Transparent. Sans surprise.
            </h2>
            <p className="mt-4 text-base leading-7 text-white/62">
              Un seul plan pour piloter toute votre salle. Pas de modules cachés, pas de limites artificielles.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3 lg:items-start">
            {/* Free */}
            <article className="rounded-md border border-white/12 bg-white/6 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/45">Démarrage</p>
              <p className="mt-4 text-4xl font-semibold">Gratuit</p>
              <p className="mt-2 text-sm text-white/55">Pour tester et lancer votre salle.</p>
              <div className="my-6 border-t border-white/10" />
              <ul className="space-y-3 text-sm text-white/75">
                {["Jusqu'à 30 membres", "Pointage illimité", "Caisse et reçus", "1 administrateur", "Vitrine publique"].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle2 className="shrink-0 text-mint" size={15} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-md border border-white/20 text-sm font-semibold transition hover:bg-white/10">
                Commencer gratuitement
              </Link>
            </article>

            {/* Pro — highlighted */}
            <article className="relative rounded-md border border-mint/40 bg-mint/10 p-6 shadow-[0_0_0_1px_rgba(30,138,106,0.25)]">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-mint px-4 py-1 text-xs font-semibold text-white">
                Recommandé
              </span>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-mint">Pro</p>
              <div className="mt-4 flex items-end gap-2">
                <p className="text-4xl font-semibold">9 900 <span className="text-2xl">F CFA</span></p>
                <p className="mb-1 text-sm text-white/55">/ mois</p>
              </div>
              <p className="mt-2 text-sm text-white/55">Pour les salles actives avec une équipe.</p>
              <div className="my-6 border-t border-white/10" />
              <ul className="space-y-3 text-sm text-white/85">
                {["Membres illimités", "Pointage illimité", "Caisse, reçus et exports", "Équipe avec rôles (admin / opérateur)", "Staff avec PIN", "Notifications WhatsApp", "Vitrine publique personnalisée", "Support prioritaire"].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle2 className="shrink-0 text-mint" size={15} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-mint text-sm font-semibold transition hover:bg-emerald-700">
                Démarrer l&apos;essai
                <ArrowRight size={16} />
              </Link>
            </article>

            {/* Multi-salles */}
            <article className="rounded-md border border-white/12 bg-white/6 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/45">Multi-salles</p>
              <p className="mt-4 text-4xl font-semibold">Sur devis</p>
              <p className="mt-2 text-sm text-white/55">Pour les groupes et franchises.</p>
              <div className="my-6 border-t border-white/10" />
              <ul className="space-y-3 text-sm text-white/75">
                {["Tout le plan Pro", "Plusieurs salles depuis un compte", "Tableau de bord centralisé", "Onboarding dédié", "SLA garanti"].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle2 className="shrink-0 text-mint" size={15} />
                    {f}
                  </li>
                ))}
              </ul>
              <a href="https://wa.me/221000000000" target="_blank" rel="noreferrer" className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-md border border-white/20 text-sm font-semibold transition hover:bg-white/10">
                Nous contacter
              </a>
            </article>
          </div>

          <p className="mt-8 text-center text-sm text-white/35">
            Paiement mensuel sans engagement. Annulation à tout moment.
          </p>
        </div>
      </section>

      <section className="px-4 pb-16 md:px-8">
        <div
          className="mx-auto flex max-w-7xl flex-col gap-8 rounded-md bg-cover bg-center p-6 text-white shadow-soft md:p-8 lg:flex-row lg:items-end lg:justify-between"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(10,10,10,0.92), rgba(10,10,10,0.62)), url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1800&q=88')",
          }}
        >
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase text-white/60">Commencer</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight md:text-5xl">
              Donne a ta salle une gestion qui ressemble a son ambition.
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/72">
              Cree ton espace, ajoute tes formules, puis teste le pointage et la caisse avec ton equipe.
            </p>
          </div>
          <Link href="/signup" className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-md bg-mint px-5 text-sm font-semibold transition hover:bg-emerald-700">
            Lancer GymFlow
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </main>
  );
}
