import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bell,
  CheckCircle2,
  CreditCard,
  FileText,
  MessageCircle,
  Minus,
  Plus,
  QrCode,
  Shield,
  Smartphone,
  Upload,
  UserCheck,
  Users,
  X,
  Zap,
} from "lucide-react";

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

const features = [
  {
    icon: UserCheck,
    title: "Pointage instantané",
    body: "Membres, passages simples et packs de séances accueillis en un geste. File d'attente inexistante.",
  },
  {
    icon: CreditCard,
    title: "Caisse maîtrisée",
    body: "Cash, Wave, Orange Money. Chaque encaissement tracé, reçu imprimable, historique propre.",
  },
  {
    icon: QrCode,
    title: "Scanner QR Code",
    body: "Chaque membre reçoit sa carte QR. L'entrée se valide avec la caméra — sans saisie, sans erreur.",
  },
  {
    icon: Bell,
    title: "Alertes en temps réel",
    body: "Abonnements qui expirent aujourd'hui, nouveaux membres, paiements en attente. Tu ne rates rien.",
  },
  {
    icon: BarChart3,
    title: "Analytics avancés",
    body: "Heures de pointe, jours forts, top membres, évolution 30 jours. Tu pilotes avec des chiffres vrais.",
  },
  {
    icon: Upload,
    title: "Import CSV",
    body: "Migre tes membres depuis Excel en 30 secondes. Détection automatique des doublons.",
  },
  {
    icon: FileText,
    title: "Rapport mensuel PDF",
    body: "Revenus, pointages, formules populaires — un rapport complet à imprimer ou partager chaque mois.",
  },
  {
    icon: MessageCircle,
    title: "Notifications WhatsApp",
    body: "Rappels d'expiration automatiques sur WhatsApp. Le membre reçoit, la salle encaisse.",
  },
  {
    icon: Users,
    title: "Gestion d'équipe",
    body: "Rôles admin et opérateur. Chaque employé a sa vue, le gérant garde le contrôle total.",
  },
];

const steps = [
  {
    num: "01",
    title: "Membre arrive",
    body: "L'équipe trouve le profil, vérifie l'abonnement, valide l'entrée en quelques secondes.",
  },
  {
    num: "02",
    title: "Caisse propre",
    body: "Encaissement enregistré avec le bon moyen de paiement. Reçu disponible immédiatement.",
  },
  {
    num: "03",
    title: "Gérant serein",
    body: "Revenus, alertes et tendances visibles depuis le tableau de bord. Rien ne t'échappe.",
  },
];

const testimonials = [
  {
    quote: "Avant GymFlow on perdait 30 minutes chaque matin à chercher qui avait payé. Maintenant c'est 3 secondes.",
    name: "Mamadou D.",
    gym: "Iron Club Dakar",
    country: "🇸🇳",
  },
  {
    quote: "Mes employés ont appris à utiliser l'appli en 10 minutes. Le pointage QR a changé notre accueil.",
    name: "Fatou S.",
    gym: "FitZone Abidjan",
    country: "🇨🇮",
  },
  {
    quote: "Les rappels WhatsApp automatiques ont multiplié mes renouvellements. Je récupère des clients que j'aurais perdus.",
    name: "Kofi A.",
    gym: "PowerGym Accra",
    country: "🇬🇭",
  },
];

const proFeatures = [
  "Membres, abonnements et pointages illimités",
  "Scanner QR à l'entrée",
  "Caisse avec reçus imprimables",
  "Import CSV et export de données",
  "Dashboard analytics temps réel",
  "Notifications WhatsApp automatiques",
  "Rapport mensuel PDF",
  "Vitrine publique de la salle",
  "Gestion d'équipe avec rôles",
  "Application mobile installable (PWA)",
  "Support prioritaire",
];

const faqs = [
  {
    q: "Est-ce que je peux importer mes membres depuis Excel ?",
    a: "Oui. GymFlow accepte les fichiers CSV avec nom, téléphone et notes. L'import prend moins de 30 secondes et les doublons sont détectés automatiquement.",
  },
  {
    q: "Est-ce que ça marche sans connexion internet ?",
    a: "Les pages récemment visitées sont disponibles hors ligne grâce à la PWA. Pour les données en temps réel (pointages, paiements), une connexion est nécessaire.",
  },
  {
    q: "Est-ce que mes employés peuvent l'utiliser ?",
    a: "Oui. Tu crées des comptes opérateurs avec accès limité au pointage et à la caisse. Les données sensibles (revenus, analytics) restent réservées à l'admin.",
  },
  {
    q: "Comment fonctionnent les paiements Wave et Orange Money ?",
    a: "GymFlow s'intègre avec PayDunya pour accepter Wave, Orange Money, Free Money et carte bancaire. Un lien de paiement est envoyé au membre, tu reçois la confirmation automatiquement.",
  },
  {
    q: "Puis-je annuler à tout moment ?",
    a: "Oui, sans engagement ni frais de résiliation. Tes données restent exportables avant toute résiliation.",
  },
  {
    q: "Est-ce que GymFlow fonctionne sur téléphone ?",
    a: "Oui. GymFlow est une application web installable sur Android et iPhone (sans passer par le Play Store). Une fois installée, elle fonctionne comme une vraie application.",
  },
];

const compareRows = [
  { label: "Pointage rapide", gymflow: true, excel: false, cahier: false },
  { label: "Caisse & reçus", gymflow: true, excel: "Partiel", cahier: false },
  { label: "Alertes expiration", gymflow: true, excel: false, cahier: false },
  { label: "Rappels WhatsApp auto", gymflow: true, excel: false, cahier: false },
  { label: "Analytics & rapports", gymflow: true, excel: "Manuel", cahier: false },
  { label: "Multi-utilisateurs", gymflow: true, excel: false, cahier: false },
  { label: "Application mobile", gymflow: true, excel: false, cahier: false },
  { label: "Scanner QR", gymflow: true, excel: false, cahier: false },
];

function Star() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-emerald-400">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function CheckCell({ value }: { value: boolean | string }) {
  if (value === true)
    return <CheckCircle2 size={18} className="mx-auto text-emerald-400" />;
  if (value === false)
    return <X size={18} className="mx-auto text-white/20" />;
  return <span className="text-xs text-white/40">{value}</span>;
}

export default function SitePage() {
  return (
    <main className="min-h-screen bg-[#080808] text-white">

      {/* ─── NAV ──────────────────────────────────────────────────── */}
      <nav
        className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-4 md:px-12"
        style={{ background: "linear-gradient(to bottom, rgba(8,8,8,0.95), transparent)" }}
      >
        <Link href="/site" className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-md bg-white">
            <Zap size={15} className="text-[#080808]" fill="currentColor" />
          </div>
          <span className="text-base font-semibold tracking-tight">GymFlow</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="#tarifs" className="hidden text-xs font-semibold text-white/50 transition hover:text-white sm:block">
            Tarifs
          </Link>
          <Link href="#faq" className="hidden text-xs font-semibold text-white/50 transition hover:text-white sm:block">
            FAQ
          </Link>
          <Link
            href="/login"
            className="hidden h-9 items-center rounded-full border border-white/20 px-4 text-xs font-semibold transition hover:bg-white/10 sm:inline-flex"
          >
            Connexion
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-emerald-500 px-4 text-xs font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400"
          >
            Essai gratuit
            <ArrowRight size={13} />
          </Link>
        </div>
      </nav>

      {/* ─── HERO ─────────────────────────────────────────────────── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center md:px-12">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=2400&q=88')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#080808]/70 via-transparent to-[#080808]" />
        <div className="absolute left-1/2 top-1/3 size-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-[140px]" />

        <div className="relative z-10 max-w-5xl">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-white/50 backdrop-blur">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            Logiciel premium pour salles ambitieuses
          </div>

          <h1 className="text-6xl font-semibold leading-[1.03] tracking-tight md:text-8xl lg:text-[6.5rem]">
            Ta salle mérite<br />
            <span className="text-emerald-400">mieux qu&apos;Excel.</span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-white/55 md:text-xl">
            GymFlow rassemble le pointage, les abonnements, la caisse et ton équipe dans une interface pensée pour les salles de sport en Afrique.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex h-14 items-center gap-3 rounded-full bg-emerald-500 px-8 text-sm font-semibold text-white shadow-xl shadow-emerald-500/30 transition hover:bg-emerald-400"
            >
              Créer mon espace — gratuit
              <ArrowRight size={17} />
            </Link>
            <Link
              href="/login"
              className="inline-flex h-14 items-center gap-3 rounded-full border border-white/15 bg-white/5 px-8 text-sm font-semibold backdrop-blur transition hover:bg-white/10"
            >
              J&apos;ai déjà un compte
            </Link>
          </div>

          <p className="mt-6 text-xs text-white/30">
            14 jours d&apos;essai gratuit · Aucune carte requise · Sans engagement
          </p>
        </div>

        {/* Stats bar */}
        <div className="absolute bottom-12 left-1/2 z-10 flex w-full max-w-2xl -translate-x-1/2 flex-wrap gap-px overflow-hidden rounded-2xl border border-white/8 backdrop-blur">
          {[
            { label: "Salles actives", value: "50+" },
            { label: "Membres gérés", value: "10 000+" },
            { label: "Pays", value: "5" },
          ].map((s) => (
            <div key={s.label} className="flex flex-1 flex-col items-center gap-1 bg-white/5 px-6 py-4">
              <p className="text-xl font-semibold">{s.value}</p>
              <p className="text-xs text-white/40">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES ─────────────────────────────────────────────── */}
      <section className="px-6 py-32 md:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-20 max-w-2xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-emerald-400">
              Tout inclus
            </p>
            <h2 className="text-5xl font-semibold leading-tight tracking-tight md:text-6xl">
              Tout ce dont une salle a besoin.<br />Rien de superflu.
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <article
                key={f.title}
                className={`relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/15 ${
                  i === 0
                    ? "border-emerald-500/30 bg-gradient-to-b from-emerald-950/40 to-[#0f0f0f]"
                    : "border-white/6 bg-white/3"
                }`}
              >
                {i === 0 && (
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
                )}
                <div
                  className={`mb-5 flex size-10 items-center justify-center rounded-xl ${
                    i === 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-white/8 text-white/50"
                  }`}
                >
                  <f.icon size={18} />
                </div>
                <h3 className="mb-2 text-base font-semibold">{f.title}</h3>
                <p className="text-sm leading-6 text-white/50">{f.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COMPARAISON ──────────────────────────────────────────── */}
      <section className="border-y border-white/6 px-6 py-32 md:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-emerald-400">
              Comparaison
            </p>
            <h2 className="text-5xl font-semibold tracking-tight md:text-6xl">
              Pourquoi pas Excel ?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-base text-white/45">
              Excel gère des chiffres. GymFlow gère une salle.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/8">
            <div className="grid grid-cols-[1fr_auto_auto_auto] border-b border-white/8 bg-white/5 px-6 py-4 text-xs font-semibold uppercase tracking-[0.1em]">
              <span className="text-white/40">Fonctionnalité</span>
              <span className="w-28 text-center text-emerald-400">GymFlow</span>
              <span className="w-28 text-center text-white/40">Excel</span>
              <span className="w-28 text-center text-white/40">Cahier</span>
            </div>
            {compareRows.map((row, i) => (
              <div
                key={row.label}
                className={`grid grid-cols-[1fr_auto_auto_auto] items-center px-6 py-4 text-sm ${
                  i % 2 === 0 ? "bg-white/2" : ""
                }`}
              >
                <span className="font-medium text-white/70">{row.label}</span>
                <span className="flex w-28 justify-center"><CheckCell value={row.gymflow} /></span>
                <span className="flex w-28 justify-center"><CheckCell value={row.excel} /></span>
                <span className="flex w-28 justify-center"><CheckCell value={row.cahier} /></span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COMMENT ÇA MARCHE ────────────────────────────────────── */}
      <section className="px-6 py-32 md:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-20 text-center">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-emerald-400">
              Le flow
            </p>
            <h2 className="text-5xl font-semibold tracking-tight md:text-6xl">
              Simple pour l&apos;équipe.<br />Puissant pour le gérant.
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.num} className="relative">
                {i < steps.length - 1 && (
                  <div className="absolute right-0 top-6 hidden h-px w-1/2 bg-gradient-to-r from-emerald-500/40 to-transparent lg:block" />
                )}
                <div className="rounded-2xl border border-white/8 bg-white/3 p-8">
                  <div className="mb-6 inline-flex items-center gap-3">
                    <span className="font-mono text-xs font-semibold text-emerald-400">{step.num}</span>
                    <div className="h-px w-8 bg-emerald-500/30" />
                  </div>
                  <h3 className="mb-3 text-2xl font-semibold">{step.title}</h3>
                  <p className="text-sm leading-7 text-white/50">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PWA ──────────────────────────────────────────────────── */}
      <section className="border-y border-white/6 px-6 py-32 md:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-emerald-400">
                Application mobile
              </p>
              <h2 className="text-5xl font-semibold leading-tight tracking-tight md:text-6xl">
                Sur ton téléphone.<br />Sans le Play Store.
              </h2>
              <p className="mt-6 text-base leading-8 text-white/50">
                GymFlow s&apos;installe sur Android et iPhone depuis le navigateur. Accès depuis l&apos;écran d&apos;accueil, pointage hors ligne, expérience native — sans passer par aucun store.
              </p>
              <div className="mt-10 space-y-4">
                {[
                  { icon: Smartphone, text: "Installable sur Android et iPhone en 2 secondes" },
                  { icon: Zap, text: "Fonctionne sur réseau 3G et hors connexion" },
                  { icon: Shield, text: "Mises à jour automatiques, rien à télécharger" },
                ].map((item) => (
                  <div
                    key={item.text}
                    className="flex items-center gap-4 rounded-2xl border border-white/8 bg-white/3 px-5 py-4"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                      <item.icon size={16} />
                    </div>
                    <p className="text-sm font-medium text-white/80">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-white/8" style={{ minHeight: 480 }}>
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&w=1400&q=88')",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                  <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                    <div className="size-2.5 rounded-full bg-emerald-400" />
                    <p className="text-sm font-semibold">Tableau de bord — Aujourd&apos;hui</p>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {[
                      { label: "Pointages", value: "47" },
                      { label: "Revenus", value: "185k" },
                      { label: "Alertes", value: "3" },
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-xl bg-white/5 p-3 text-center">
                        <p className="text-xl font-semibold">{stat.value}</p>
                        <p className="mt-1 text-xs text-white/40">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─────────────────────────────────────────── */}
      <section className="px-6 py-32 md:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-emerald-400">
              Ils utilisent GymFlow
            </p>
            <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Des gérants qui ont repris le contrôle.
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-2xl border border-white/8 bg-white/3 p-8">
                <div className="mb-6 flex gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} />)}
                </div>
                <p className="text-base leading-8 text-white/75">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-6 flex items-center gap-3 border-t border-white/8 pt-5">
                  <div className="flex size-9 items-center justify-center rounded-full bg-white/8 text-lg">
                    {t.country}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-white/40">{t.gym}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ──────────────────────────────────────────────── */}
      <section className="border-y border-white/6 px-6 py-32 md:px-12" id="tarifs">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-emerald-400">
              Tarifs
            </p>
            <h2 className="text-5xl font-semibold tracking-tight md:text-6xl">
              Simple. Transparent. Sans surprise.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-base text-white/45">
              Un seul plan. Tout inclus. Pas de modules cachés, pas de limites artificielles.
            </p>
          </div>

          <div className="mx-auto max-w-4xl">
            <div className="relative overflow-hidden rounded-3xl border border-emerald-500/25 bg-gradient-to-b from-emerald-950/30 to-[#0f0f0f]">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />

              <div className="grid lg:grid-cols-[1fr_1.2fr]">
                {/* Left */}
                <div className="border-b border-white/6 p-10 lg:border-b-0 lg:border-r">
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400">
                    <span className="size-1.5 rounded-full bg-emerald-400" />
                    GymFlow Pro
                  </div>
                  <div className="mt-6">
                    <div className="flex items-end gap-2">
                      <p className="text-5xl font-semibold">14 900</p>
                      <span className="mb-1 text-xl font-normal text-white/40">FCFA</span>
                    </div>
                    <p className="mt-1 text-sm text-white/40">par mois · par salle</p>
                    <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                      <CheckCircle2 size={11} />
                      Équivalent à 1 abonnement membre
                    </p>
                  </div>

                  <p className="mt-6 text-sm leading-7 text-white/55">
                    Tout ce dont une salle active a besoin. Sans engagement, sans surprise.
                  </p>

                  <div className="mt-8 space-y-3">
                    <Link
                      href="/signup"
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-4 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400"
                    >
                      Commencer — 14 jours gratuits
                      <ArrowRight size={16} />
                    </Link>
                    <p className="text-center text-xs text-white/30">
                      Aucune carte requise pour l&apos;essai
                    </p>
                  </div>
                </div>

                {/* Right */}
                <div className="p-10">
                  <p className="mb-6 text-xs font-semibold uppercase tracking-[0.1em] text-white/35">
                    Tout inclus dans le plan
                  </p>
                  <ul className="space-y-3">
                    {proFeatures.map((f) => (
                      <li key={f} className="flex items-center gap-3 text-sm text-white/70">
                        <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Multi-salles */}
            <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/3 px-8 py-6">
              <div>
                <p className="font-semibold">Multi-salles & Franchises</p>
                <p className="mt-1 text-sm text-white/45">Plusieurs espaces, un seul tableau de bord.</p>
              </div>
              <a
                href="mailto:support@gymflow.app"
                className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-white/15 px-5 text-xs font-semibold transition hover:bg-white/10"
              >
                Nous contacter
                <ArrowRight size={13} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ──────────────────────────────────────────────────── */}
      <section className="px-6 py-32 md:px-12" id="faq">
        <div className="mx-auto max-w-3xl">
          <div className="mb-16 text-center">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-emerald-400">
              FAQ
            </p>
            <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Questions fréquentes.
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq) => (
              <details key={faq.q} className="group rounded-2xl border border-white/8 bg-white/3">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-sm font-semibold">
                  {faq.q}
                  <span className="shrink-0 text-emerald-400">
                    <Plus size={16} className="group-open:hidden" />
                    <Minus size={16} className="hidden group-open:block" />
                  </span>
                </summary>
                <p className="px-6 pb-5 text-sm leading-7 text-white/55">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-white/6 px-6 py-40 text-center md:px-12">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1800&q=88')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#080808] via-transparent to-[#080808]" />
        <div className="absolute left-1/2 top-1/2 size-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/8 blur-[140px]" />

        <div className="relative z-10 mx-auto max-w-4xl">
          <h2 className="text-6xl font-semibold leading-tight tracking-tight md:text-8xl">
            Lance GymFlow.<br />
            <span className="text-emerald-400">Aujourd&apos;hui.</span>
          </h2>
          <p className="mx-auto mt-8 max-w-xl text-lg text-white/45">
            14 jours d&apos;essai gratuit. Aucune carte requise. Si tu n&apos;es pas convaincu, tu ne paies rien.
          </p>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex h-16 items-center gap-3 rounded-full bg-emerald-500 px-10 text-base font-semibold text-white shadow-2xl shadow-emerald-500/30 transition hover:bg-emerald-400"
            >
              Créer mon espace gratuit
              <ArrowRight size={19} />
            </Link>
            <a
              href="mailto:support@gymflow.app"
              className="inline-flex h-16 items-center gap-3 rounded-full border border-white/15 bg-white/5 px-10 text-base font-semibold backdrop-blur transition hover:bg-white/10"
            >
              Parler à l&apos;équipe
            </a>
          </div>
          <p className="mt-6 text-xs text-white/25">
            Utilisé par des salles au Sénégal, Côte d&apos;Ivoire, Mali, Guinée et Ghana.
          </p>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────────── */}
      <footer className="border-t border-white/6 px-6 py-10 md:px-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-md bg-white">
              <Zap size={15} className="text-[#080808]" fill="currentColor" />
            </div>
            <div>
              <p className="text-sm font-semibold">GymFlow</p>
              <p className="text-xs text-white/35">Logiciel de gestion de salle de sport</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-6 text-xs text-white/35">
            <Link href="/login" className="transition hover:text-white/70">Connexion</Link>
            <Link href="/signup" className="transition hover:text-white/70">Créer un compte</Link>
            <Link href="#tarifs" className="transition hover:text-white/70">Tarifs</Link>
            <Link href="#faq" className="transition hover:text-white/70">FAQ</Link>
            <a href="mailto:support@gymflow.app" className="transition hover:text-white/70">Support</a>
          </div>
          <p className="text-xs text-white/20">© 2026 GymFlow. Tous droits réservés.</p>
        </div>
      </footer>
    </main>
  );
}
