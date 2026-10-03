import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  QrCode,
  ShieldCheck,
  Smartphone,
  UserRoundCheck,
  Users,
  Wallet,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "DooleFit · La gestion de ta salle, enfin simple",
  description:
    "Membres, abonnements, pointage et paiements réunis dans un seul outil. Essaie DooleFit gratuitement pendant 30 jours.",
};

const features = [
  {
    icon: Users,
    number: "01",
    title: "Tes membres, bien suivis",
    text: "Retrouve les fiches, les abonnements et l'historique de chaque membre sans fouiller dans les cahiers.",
  },
  {
    icon: QrCode,
    number: "02",
    title: "Un passage, un scan",
    text: "La carte QR permet de vérifier l'abonnement et d'enregistrer une entrée en quelques secondes.",
  },
  {
    icon: Wallet,
    number: "03",
    title: "Une caisse lisible",
    text: "Note les règlements, retrouve les paiements et imprime un reçu depuis le même espace.",
  },
  {
    icon: BarChart3,
    number: "04",
    title: "Les bons chiffres au bon moment",
    text: "Repère les abonnements qui arrivent à échéance et garde un œil sur l'activité de ta salle.",
  },
];

const included = [
  "Membres, formules et pointages illimités",
  "Caisse et reçus imprimables",
  "Wave, Orange Money, Free Money et Wizall",
  "Import CSV et export de tes données",
  "Alertes d'expiration et tableau de bord",
  "Utilisable sur ordinateur et téléphone",
];

const faqs = [
  {
    q: "Faut-il une carte bancaire pour essayer ?",
    a: "Non. Tu peux créer ton espace et essayer DooleFit pendant 30 jours sans saisir de carte bancaire.",
  },
  {
    q: "Comment régler l'abonnement ?",
    a: "L'abonnement peut être réglé par carte bancaire ou par mobile money selon les moyens de paiement disponibles.",
  },
  {
    q: "Puis-je arrêter quand je veux ?",
    a: "Oui. L'abonnement est sans engagement. Tu peux aussi exporter les données de ta salle.",
  },
  {
    q: "Est-ce que mon équipe peut l'utiliser sur téléphone ?",
    a: "Oui. DooleFit s'utilise depuis le navigateur du téléphone et peut être ajouté à l'écran d'accueil.",
  },
];

function Brand() {
  return (
    <Link href="/site" className="flex items-center gap-2.5" aria-label="DooleFit, accueil">
      <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-400 text-[#07130f] shadow-lg shadow-emerald-500/20">
        <Zap size={18} fill="currentColor" />
      </span>
      <span className="text-lg font-bold tracking-[-0.04em]">Doole<span className="text-emerald-400">Fit</span></span>
    </Link>
  );
}

function DashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[590px] lg:mr-0">
      <div className="absolute -inset-8 rounded-[2.5rem] bg-emerald-400/10 blur-3xl" />
      <div className="absolute -right-5 -top-7 hidden h-32 w-32 rounded-full border border-emerald-300/15 sm:block" />
      <div className="relative overflow-hidden rounded-[1.6rem] border border-white/15 bg-[#101714] shadow-[0_35px_100px_-35px_rgba(0,0,0,0.9)]">
        <div className="flex items-center justify-between border-b border-white/8 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-400/15 text-emerald-300"><Zap size={15} fill="currentColor" /></span>
            <div><p className="text-xs font-semibold">Espace de gestion</p><p className="mt-0.5 text-[10px] text-white/40">Exemple d&apos;interface DooleFit</p></div>
          </div>
          <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-[10px] font-medium text-emerald-200">En ligne</span>
        </div>
        <div className="grid min-h-[330px] sm:grid-cols-[132px_1fr]">
          <aside className="hidden border-r border-white/8 p-4 sm:block">
            <p className="mb-3 px-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/30">Menu</p>
            <div className="space-y-1 text-[11px]">
              <div className="flex items-center gap-2 rounded-lg bg-emerald-300/10 px-2.5 py-2 text-emerald-200"><BarChart3 size={13} /> Vue d&apos;ensemble</div>
              <div className="flex items-center gap-2 px-2.5 py-2 text-white/50"><Users size={13} /> Membres</div>
              <div className="flex items-center gap-2 px-2.5 py-2 text-white/50"><CreditCard size={13} /> Paiements</div>
              <div className="flex items-center gap-2 px-2.5 py-2 text-white/50"><UserRoundCheck size={13} /> Pointages</div>
            </div>
            <div className="mt-8 rounded-xl border border-white/8 bg-white/[0.03] p-3">
              <p className="text-[10px] font-medium text-white/75">Besoin d&apos;aide ?</p>
              <p className="mt-1 text-[9px] leading-4 text-white/40">Ton espace reste accessible sur mobile.</p>
            </div>
          </aside>
          <div className="min-w-0 p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div><p className="text-[10px] text-white/40">VUE D&apos;ENSEMBLE</p><h3 className="mt-1 text-base font-semibold sm:text-lg">Bonjour, ton équipe 👋</h3></div>
              <span className="flex size-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[10px] font-semibold">DF</span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2.5">
              {[
                { label: "Membres", icon: Users, note: "Fiches centralisées" },
                { label: "Abonnements", icon: CreditCard, note: "Statuts à jour" },
                { label: "Présences", icon: QrCode, note: "Pointage par QR" },
                { label: "Encaissements", icon: Wallet, note: "Historique clair" },
              ].map(({ label, icon: Icon, note }) => (
                <div key={label} className="rounded-xl border border-white/8 bg-white/[0.035] p-3 sm:p-3.5">
                  <div className="flex items-center justify-between"><span className="text-[10px] text-white/50">{label}</span><Icon size={13} className="text-emerald-300" /></div>
                  <p className="mt-3 text-xs font-semibold sm:text-sm">Tout au même endroit</p>
                  <p className="mt-1 text-[9px] text-white/35">{note}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-xl border border-white/8 bg-white/[0.035] p-3.5">
              <div className="flex items-center justify-between"><p className="text-[10px] font-semibold">À suivre cette semaine</p><ArrowDownRight size={14} className="text-emerald-300" /></div>
              <div className="mt-3 flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-lg bg-amber-300/10 text-amber-200"><ShieldCheck size={15} /></span>
                <div className="min-w-0 flex-1"><p className="truncate text-[10px] font-medium">Abonnements bientôt expirés</p><p className="mt-0.5 text-[9px] text-white/40">Repère les renouvellements à relancer</p></div>
                <ArrowRight size={13} className="text-white/35" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-5 -left-4 hidden items-center gap-3 rounded-2xl border border-white/10 bg-[#121a16]/95 px-4 py-3 shadow-xl backdrop-blur sm:flex">
        <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-300/10 text-emerald-300"><Smartphone size={17} /></span>
        <div><p className="text-[11px] font-semibold">Aussi sur téléphone</p><p className="mt-0.5 text-[10px] text-white/45">Au bureau ou à l&apos;accueil</p></div>
        <Check size={14} className="ml-2 text-emerald-300" />
      </div>
    </div>
  );
}

export default function SitePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#080b09] text-white selection:bg-emerald-300 selection:text-black">
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.07] bg-[#080b09]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Brand />
          <div className="hidden items-center gap-8 text-[13px] font-medium text-white/55 md:flex">
            <Link href="#fonctionnalites" className="transition hover:text-white">Fonctionnalités</Link>
            <Link href="#comment-ca-marche" className="transition hover:text-white">Comment ça marche</Link>
            <Link href="#tarifs" className="transition hover:text-white">Tarif</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden text-sm font-medium text-white/65 transition hover:text-white sm:block">Connexion</Link>
            <Link href="/signup" className="inline-flex h-10 items-center gap-2 rounded-full bg-emerald-300 px-4 text-xs font-bold text-[#07130f] transition hover:bg-emerald-200 sm:px-5 sm:text-sm">Essai gratuit <ArrowRight size={15} /></Link>
          </div>
        </div>
      </nav>

      <section className="relative isolate px-5 pb-20 pt-32 sm:px-8 sm:pt-36 lg:px-10 lg:pb-28 lg:pt-40">
        <div className="absolute inset-0 -z-20 bg-cover bg-[center_40%] opacity-[0.22]" style={{ backgroundImage: "url('/gym-hero.jpg')" }} />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#080b09] via-[#080b09]/95 to-[#080b09]/65" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#080b09]/10 via-transparent to-[#080b09]" />
        <div className="absolute -left-36 top-40 -z-10 size-[440px] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[0.92fr_1.08fr] lg:gap-12">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200/20 bg-emerald-200/[0.07] px-3.5 py-2 text-[11px] font-semibold tracking-wide text-emerald-100 sm:text-xs"><span className="size-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_#6ee7b7]" /> L&apos;outil de gestion pensé pour ta salle</p>
            <h1 className="mt-7 max-w-[680px] text-[clamp(3rem,7vw,5.8rem)] font-semibold leading-[0.98] tracking-[-0.065em]">Ta salle avance.<br /><span className="text-emerald-300">Ta gestion aussi.</span></h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-white/60 sm:text-lg sm:leading-8">Membres, abonnements, pointages et paiements : garde l&apos;essentiel sous les yeux et simplifie le quotidien de ton équipe.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/signup" className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-emerald-300 px-7 text-sm font-bold text-[#07130f] shadow-[0_10px_40px_-14px_rgba(110,231,183,0.75)] transition hover:-translate-y-0.5 hover:bg-emerald-200">Créer mon espace gratuitement <ArrowRight size={17} /></Link>
              <Link href="#fonctionnalites" className="inline-flex h-14 items-center justify-center rounded-full border border-white/15 px-6 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:bg-white/[0.04]">Découvrir DooleFit</Link>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-medium text-white/45 sm:text-xs">
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-300" /> 30 jours gratuits</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-300" /> Sans carte bancaire</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-300" /> Sans engagement</span>
            </div>
            <p className="mt-12 max-w-lg border-t border-white/10 pt-5 text-xs leading-5 text-white/50">Conçu pour les réalités des salles et des paiements en Afrique de l&apos;Ouest.</p>
          </div>
          <DashboardPreview />
        </div>
      </section>

      <section className="border-y border-white/[0.07] bg-white/[0.018] px-5 py-7 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/40 sm:justify-between sm:text-xs">
          <span className="text-white/55">Une seule plateforme pour</span><span>Membres</span><span>Abonnements</span><span>Pointages</span><span>Paiements</span><span>Rapports</span>
        </div>
      </section>

      <section className="px-5 py-24 sm:px-8 sm:py-28 lg:px-10" id="fonctionnalites">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-[0.85fr_1.15fr] md:items-end">
            <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Moins de paperasse, plus de visibilité</p><h2 className="mt-4 max-w-xl text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">Le quotidien de ta salle, enfin au même endroit.</h2></div>
            <p className="max-w-xl text-sm leading-7 text-white/50 md:justify-self-end md:text-base">Tu sais qui est à jour, qui est passé et ce qui a été encaissé. Ton équipe retrouve les informations sans changer d&apos;outil.</p>
          </div>
          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, number, title, text }) => (
              <article key={number} className="group relative overflow-hidden rounded-2xl border border-white/[0.09] bg-gradient-to-b from-white/[0.045] to-white/[0.015] p-6 transition duration-300 hover:-translate-y-1 hover:border-emerald-300/30">
                <div className="flex items-start justify-between"><span className="flex size-11 items-center justify-center rounded-xl border border-emerald-300/15 bg-emerald-300/[0.08] text-emerald-200"><Icon size={19} /></span><span className="text-xs font-semibold tracking-widest text-white/25">{number}</span></div>
                <h3 className="mt-8 text-base font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-white/50">{text}</p>
                <div className="absolute -bottom-12 -right-10 size-28 rounded-full bg-emerald-300/[0.05] blur-2xl transition group-hover:bg-emerald-300/[0.12]" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-24 sm:px-8 lg:px-10" id="comment-ca-marche">
        <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#101512] lg:grid-cols-2">
          <div className="relative min-h-[330px] overflow-hidden sm:min-h-[420px]">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/gym-landing.jpg')" }} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b100d] via-[#0b100d]/25 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/15 bg-[#080b09]/70 p-5 backdrop-blur-lg sm:bottom-8 sm:left-8 sm:right-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-emerald-200">À l&apos;accueil comme au bureau</p><p className="mt-2 text-lg font-semibold">Les informations utiles, sans chercher.</p>
            </div>
          </div>
          <div className="p-7 sm:p-10 lg:p-12">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Simple à prendre en main</p><h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl">Tu démarres en quelques étapes.</h2><p className="mt-4 text-sm leading-7 text-white/50">Configure ta salle une fois, puis laisse DooleFit t&apos;aider à suivre les opérations du quotidien.</p>
            <ol className="mt-8 space-y-5">
              {["Crée ton espace et tes formules", "Ajoute tes membres ou importe ton fichier", "Pointe les entrées et suis les paiements"].map((step, index) => (
                <li key={step} className="flex gap-4"><span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-emerald-300/25 bg-emerald-300/10 text-sm font-bold text-emerald-200">0{index + 1}</span><div className="pt-1.5"><p className="text-sm font-semibold">{step}</p><p className="mt-1 text-xs leading-5 text-white/40">{index === 0 ? "Définis les informations de ta salle." : index === 1 ? "Garde tes données organisées au même endroit." : "Retrouve l'activité et l'historique facilement."}</p></div></li>
              ))}
            </ol>
            <Link href="/signup" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-emerald-200 transition hover:text-white">Créer mon espace <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      <section className="border-y border-white/[0.07] bg-[#0b100d] px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Pensé pour le terrain</p><h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">Même quand tu n&apos;es pas derrière le comptoir.</h2><p className="mt-5 max-w-lg text-sm leading-7 text-white/50 sm:text-base">Ouvre ton espace sur ordinateur ou téléphone. Ton équipe peut retrouver les informations dont elle a besoin à l&apos;accueil.</p>
            <div className="mt-7 space-y-3">{["Interface adaptée au téléphone", "Paiements mobile money", "Cartes membres avec QR code"].map((item) => <p key={item} className="flex items-center gap-3 text-sm font-medium text-white/75"><span className="flex size-6 items-center justify-center rounded-full bg-emerald-300/10 text-emerald-200"><Check size={13} /></span>{item}</p>)}</div>
          </div>
          <div className="relative min-h-[350px] overflow-hidden rounded-[1.75rem] border border-white/10 sm:min-h-[470px]">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/gym-cta.jpg')" }} /><div className="absolute inset-0 bg-gradient-to-br from-emerald-950/55 via-[#080b09]/30 to-[#080b09]/80" />
            <div className="absolute inset-0 flex items-center justify-center p-5 sm:p-8">
              <div className="w-full max-w-sm rounded-[1.7rem] border border-white/15 bg-[#111713]/90 p-5 shadow-2xl backdrop-blur-xl sm:p-6">
                <div className="flex items-center justify-between"><div className="flex items-center gap-2.5"><span className="flex size-9 items-center justify-center rounded-xl bg-emerald-300/15 text-emerald-200"><Smartphone size={17} /></span><div><p className="text-xs font-semibold">Carte membre</p><p className="text-[10px] text-white/40">Accès rapide</p></div></div><span className="rounded-full bg-emerald-300/10 px-2.5 py-1 text-[9px] font-semibold text-emerald-200">ACTIVE</span></div>
                <div className="mt-5 rounded-2xl border border-white/8 bg-white/[0.035] p-4"><div className="flex items-center gap-3"><span className="flex size-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald-200 to-teal-600 text-sm font-bold text-[#08110d]">AM</span><div><p className="text-sm font-semibold">Profil membre</p><p className="mt-0.5 text-[10px] text-white/45">Abonnement en cours</p></div></div><div className="mt-4 flex items-center justify-between border-t border-white/8 pt-3 text-[10px]"><span className="text-white/45">Carte QR personnelle</span><QrCode size={22} className="text-emerald-200" /></div></div>
                <p className="mt-4 text-center text-[10px] text-white/40">Un aperçu illustratif de l&apos;espace membre</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-24 sm:px-8 sm:py-28 lg:px-10" id="tarifs">
        <div className="mx-auto max-w-6xl">
          <div className="text-center"><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Un tarif, sans surprise</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">Toute ta salle. Un seul plan.</h2><p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/50">Commence par l&apos;essai gratuit, puis décide quand tu as vu l&apos;outil en action.</p></div>
          <div className="mx-auto mt-10 grid max-w-4xl overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#101512] md:grid-cols-[1fr_0.9fr]">
            <div className="p-7 sm:p-10"><div className="flex items-center gap-2 text-xs font-semibold text-emerald-200"><ShieldCheck size={15} /> DOOLEFIT POUR TA SALLE</div><h3 className="mt-4 text-2xl font-semibold">Tout l&apos;essentiel inclus.</h3><ul className="mt-7 grid gap-x-5 gap-y-4 sm:grid-cols-2">{included.map((item) => <li key={item} className="flex gap-2.5 text-xs leading-5 text-white/65"><CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-300" />{item}</li>)}</ul></div>
            <div className="flex flex-col justify-center border-t border-white/10 bg-gradient-to-br from-emerald-950/35 to-[#0b100d] p-7 sm:p-10 md:border-l md:border-t-0"><p className="text-sm font-medium text-white/50">Après l&apos;essai gratuit</p><p className="mt-3 flex items-baseline gap-2"><span className="text-4xl font-semibold tracking-tight">9 900</span><span className="text-sm text-white/45">FCFA / mois</span></p><p className="mt-2 text-xs text-white/40">Par salle · sans engagement</p><Link href="/signup" className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-300 px-5 text-sm font-bold text-[#07130f] transition hover:bg-emerald-200">Essayer 30 jours gratuitement <ArrowRight size={16} /></Link><p className="mt-3 text-center text-[10px] text-white/35">Pas de carte bancaire pour commencer</p></div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/[0.07] bg-[#0b100d] px-5 py-20 sm:px-8 lg:px-10" id="faq">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.7fr_1.3fr]"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Questions fréquentes</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Tu veux en savoir plus ?</h2><p className="mt-4 text-sm leading-6 text-white/45">Voici les réponses aux questions avant de démarrer.</p></div><div className="space-y-2">{faqs.map(({ q, a }) => <details key={q} className="group rounded-xl border border-white/[0.08] bg-white/[0.025] px-5 open:bg-white/[0.045]"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-sm font-semibold marker:hidden">{q}<ChevronDown size={16} className="shrink-0 text-white/45 transition group-open:rotate-180" /></summary><p className="max-w-2xl pb-5 text-sm leading-6 text-white/50">{a}</p></details>)}</div></div>
      </section>

      <section className="relative isolate overflow-hidden px-5 py-24 text-center sm:px-8 sm:py-28 lg:px-10">
        <div className="absolute inset-0 -z-20 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('/gym-hero.jpg')" }} /><div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#080b09]/80 via-[#080b09]/55 to-[#080b09]" /><div className="absolute left-1/2 top-0 -z-10 h-64 w-[min(90vw,800px)] -translate-x-1/2 rounded-full bg-emerald-400/10 blur-[100px]" />
        <ShieldCheck className="mx-auto text-emerald-200" size={27} /><h2 className="mx-auto mt-5 max-w-3xl text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">Prêt à mieux gérer ta salle ?</h2><p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/55 sm:text-base">Crée ton espace DooleFit et découvre une gestion plus claire pendant 30 jours.</p><Link href="/signup" className="mt-8 inline-flex h-14 items-center gap-2 rounded-full bg-emerald-300 px-7 text-sm font-bold text-[#07130f] transition hover:-translate-y-0.5 hover:bg-emerald-200">Commencer gratuitement <ArrowRight size={17} /></Link>
        <footer className="mx-auto mt-20 flex max-w-7xl flex-col items-center justify-between gap-5 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row"><Brand /><div className="flex flex-wrap justify-center gap-5"><Link href="#fonctionnalites" className="hover:text-white">Fonctionnalités</Link><Link href="#tarifs" className="hover:text-white">Tarif</Link><Link href="#faq" className="hover:text-white">FAQ</Link><Link href="/login" className="hover:text-white">Connexion</Link></div><span>© 2026 DooleFit</span></footer>
      </section>
    </main>
  );
}
