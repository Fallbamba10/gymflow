import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, QrCode, ShieldCheck, UserCheck, Users, WalletCards, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "GymFlow · Gérez votre salle simplement",
  description: "Membres, abonnements, pointage et caisse pour les salles de sport. Essai gratuit de 30 jours.",
};

const features = [
  { icon: UserCheck, title: "Pointage rapide", text: "Retrouve un membre, scanne son QR code et valide son entrée en quelques secondes." },
  { icon: WalletCards, title: "Caisse claire", text: "Enregistre les paiements, imprime les reçus et retrouve l'historique sans cahier." },
  { icon: QrCode, title: "Cartes membres", text: "Chaque membre a une carte QR personnelle, facile à utiliser à l'accueil." },
  { icon: Users, title: "Équipe encadrée", text: "Donne à tes employés un accès adapté au pointage et à l'encaissement." },
];

const included = [
  "Membres, formules et pointages illimités",
  "Caisse et reçus imprimables",
  "Paiements Wave, Orange Money, Free Money et Wizall",
  "Import CSV et export de tes données",
  "Tableau de bord et alertes d'expiration",
  "Application installable sur téléphone",
];

const faqs = [
  { q: "Faut-il une carte pour essayer ?", a: "Non. Tu crées ton espace et tu as 30 jours pour tester GymFlow sans carte bancaire." },
  { q: "Comment puis-je payer ?", a: "Tu peux payer par carte bancaire via Stripe ou par mobile money avec Wave, Orange Money, Free Money ou Wizall." },
  { q: "Puis-je arrêter quand je veux ?", a: "Oui. Il n'y a pas d'engagement : tu peux résilier quand tu veux et exporter tes données." },
];

export default function SitePage() {
  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <nav className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-white/5 bg-[#080808]/90 px-6 py-4 backdrop-blur md:px-12">
        <Link href="/site" className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-md bg-white"><Zap size={15} className="text-[#080808]" fill="currentColor" /></span>
          <span className="font-semibold tracking-tight">GymFlow</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden text-sm font-medium text-white/65 hover:text-white sm:block">Connexion</Link>
          <Link href="/signup" className="inline-flex h-10 items-center rounded-full bg-emerald-500 px-5 text-sm font-semibold hover:bg-emerald-400">Essayer gratuitement</Link>
        </div>
      </nav>

      <section className="relative overflow-hidden px-6 pb-24 pt-40 md:px-12 md:pb-32 md:pt-48">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(16,185,129,0.18),transparent_42%)]" />
        <div className="relative mx-auto max-w-4xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-semibold text-emerald-300"><span className="size-1.5 rounded-full bg-emerald-400" /> Pensé pour les salles de sport</p>
          <h1 className="mt-7 text-5xl font-semibold leading-[1.04] tracking-tight md:text-7xl">Gère ta salle.<br /><span className="text-emerald-400">Pas ton cahier.</span></h1>
          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-white/60 md:text-xl">GymFlow réunit membres, abonnements, pointage et caisse dans un outil simple pour ton équipe.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href="/signup" className="inline-flex h-14 items-center gap-2 rounded-full bg-emerald-500 px-7 text-sm font-semibold shadow-xl shadow-emerald-500/25 hover:bg-emerald-400">Créer mon espace <ArrowRight size={17} /></Link>
            <Link href="#tarifs" className="inline-flex h-14 items-center rounded-full border border-white/15 px-7 text-sm font-semibold text-white/85 hover:bg-white/10">Voir le tarif</Link>
          </div>
          <p className="mt-5 text-sm text-white/40">30 jours gratuits · Sans carte · Sans engagement</p>
        </div>
      </section>

      <section className="border-y border-white/8 px-6 py-20 md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 max-w-xl"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-400">L&apos;essentiel, bien fait</p><h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Tout ce qu&apos;il faut pour faire tourner la salle.</h2></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, text }) => <article key={title} className="rounded-2xl border border-white/8 bg-white/[0.03] p-6"><span className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400"><Icon size={19} /></span><h3 className="mt-5 font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-white/55">{text}</p></article>)}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:px-12">
        <div className="mx-auto grid max-w-6xl gap-8 rounded-3xl border border-white/8 bg-white/[0.03] p-8 md:grid-cols-[1fr_1.2fr] md:p-12">
          <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-400">Simple à démarrer</p><h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Prêt pour le prochain passage à l&apos;accueil.</h2><p className="mt-4 leading-7 text-white/55">Crée ta salle, importe tes membres et commence à pointer. Ton équipe apprend l&apos;essentiel rapidement.</p></div>
          <ol className="space-y-4">{["Crée ta salle et tes formules", "Ajoute ou importe tes membres", "Pointe, encaisse et suis ta journée"].map((step, index) => <li key={step} className="flex items-center gap-4 rounded-2xl border border-white/8 bg-black/20 p-4"><span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-400 font-semibold text-[#080808]">{index + 1}</span><span className="font-medium text-white/85">{step}</span></li>)}</ol>
        </div>
      </section>

      <section className="border-y border-white/8 px-6 py-20 md:px-12" id="tarifs">
        <div className="mx-auto max-w-4xl text-center"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-400">Un tarif clair</p><h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Un plan. Toute ta salle.</h2>
          <div className="mx-auto mt-9 max-w-2xl rounded-3xl border border-emerald-400/25 bg-gradient-to-b from-emerald-950/35 to-white/[0.03] p-8 text-left md:p-10">
            <div className="flex flex-wrap items-end justify-between gap-5 border-b border-white/10 pb-7"><div><p className="text-lg font-semibold">GymFlow</p><p className="mt-1 text-sm text-white/55">Par salle · sans engagement</p></div><p className="text-4xl font-semibold">5 900 <span className="text-base font-medium text-white/55">FCFA/mois</span></p></div>
            <ul className="mt-7 grid gap-3 sm:grid-cols-2">{included.map((item) => <li key={item} className="flex gap-2 text-sm text-white/75"><CheckCircle2 size={17} className="shrink-0 text-emerald-400" />{item}</li>)}</ul>
            <Link href="/signup" className="mt-8 flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-4 text-sm font-semibold hover:bg-emerald-400">Commencer mes 30 jours gratuits <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:px-12" id="faq"><div className="mx-auto max-w-3xl"><h2 className="text-center text-3xl font-semibold tracking-tight">Questions fréquentes</h2><div className="mt-8 space-y-3">{faqs.map(({ q, a }) => <details key={q} className="rounded-2xl border border-white/8 bg-white/[0.03] px-6"><summary className="cursor-pointer py-5 font-semibold">{q}</summary><p className="pb-5 text-sm leading-7 text-white/55">{a}</p></details>)}</div></div></section>

      <section className="border-t border-white/8 px-6 py-20 text-center md:px-12"><ShieldCheck className="mx-auto text-emerald-400" size={28} /><h2 className="mt-5 text-3xl font-semibold tracking-tight md:text-4xl">Essaie GymFlow avec ta salle.</h2><p className="mx-auto mt-4 max-w-xl text-white/55">30 jours pour vérifier que l&apos;outil convient à ton équipe, sans carte et sans engagement.</p><Link href="/signup" className="mt-8 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-7 py-4 text-sm font-semibold hover:bg-emerald-400">Créer mon espace <ArrowRight size={16} /></Link><footer className="mt-16 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-white/40"><Link href="/login" className="hover:text-white">Connexion</Link><a href="mailto:support@gymflow.app" className="hover:text-white">Support</a><span>© 2026 GymFlow</span></footer></section>
    </main>
  );
}
