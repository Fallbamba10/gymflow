import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";

export default function NotFound() {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center bg-ink px-4 py-16 text-white"
      style={{
        backgroundImage:
          "linear-gradient(115deg, rgba(10,10,10,0.97) 0%, rgba(10,10,10,0.88) 50%, rgba(10,10,10,0.72) 100%), url('https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=2200&q=85')",
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <div className="w-full max-w-lg text-center">
        <div className="flex justify-center">
          <BrandMark inverse className="size-14" />
        </div>

        <p className="mt-8 font-mono text-sm font-semibold uppercase tracking-[0.18em] text-white/40">
          Erreur 404
        </p>

        <h1 className="mt-4 text-5xl font-semibold leading-tight md:text-6xl">
          Page introuvable.
        </h1>

        <p className="mt-5 text-base leading-8 text-white/62">
          Cette page n&apos;existe pas ou a été déplacée. Retournez au tableau de bord pour continuer.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-mint px-5 text-sm font-semibold transition hover:bg-emerald-700"
          >
            <Home size={17} />
            Tableau de bord
          </Link>
          <Link
            href="/site"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-white/30 px-5 text-sm font-semibold transition hover:bg-white/10"
          >
            <ArrowLeft size={17} />
            Page d&apos;accueil
          </Link>
        </div>

        <p className="mt-10 text-xs text-white/28">
          GymFlow · Gestion de salle premium
        </p>
      </div>
    </main>
  );
}
