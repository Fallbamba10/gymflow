"use client";

import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
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

        <div className="mt-8 flex justify-center">
          <div className="flex size-14 items-center justify-center rounded-md border border-danger/30 bg-danger/10">
            <AlertTriangle className="text-danger" size={24} />
          </div>
        </div>

        <p className="mt-6 font-mono text-sm font-semibold uppercase tracking-[0.18em] text-white/40">
          Erreur inattendue
        </p>

        <h1 className="mt-4 text-4xl font-semibold leading-tight md:text-5xl">
          Quelque chose s&apos;est mal passé.
        </h1>

        <p className="mt-5 text-base leading-8 text-white/62">
          Une erreur s&apos;est produite. Réessayez ou retournez au tableau de bord.
        </p>

        {error.digest ? (
          <p className="mt-3 font-mono text-xs text-white/30">
            Référence : {error.digest}
          </p>
        ) : null}

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-mint px-5 text-sm font-semibold transition hover:bg-emerald-700"
          >
            <RefreshCw size={17} />
            Réessayer
          </button>
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-white/30 px-5 text-sm font-semibold transition hover:bg-white/10"
          >
            <Home size={17} />
            Tableau de bord
          </Link>
        </div>

        <p className="mt-10 text-xs text-white/28">
          GymFlow · Gestion de salle premium
        </p>
      </div>
    </main>
  );
}
