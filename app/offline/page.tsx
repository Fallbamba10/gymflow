"use client";

import Link from "next/link";
import { WifiOff } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-paper px-4 text-center">
      <BrandMark className="size-14" />
      <div className="mt-8 flex size-16 items-center justify-center rounded-full bg-neutral-100">
        <WifiOff size={28} className="text-neutral-400" />
      </div>
      <h1 className="mt-6 text-2xl font-semibold">Pas de connexion</h1>
      <p className="mt-3 max-w-sm text-sm leading-6 text-neutral-500">
        GymFlow est hors ligne. Les pages déjà visitées sont disponibles en cache. Reconnecte-toi pour accéder aux données en direct.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/checkin"
          className="inline-flex h-11 items-center gap-2 rounded-md bg-ink px-5 text-sm font-semibold text-white"
        >
          Essayer le pointage
        </Link>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex h-11 items-center gap-2 rounded-md border border-line bg-white px-5 text-sm font-semibold"
        >
          Réessayer
        </button>
      </div>
      <p className="mt-12 text-xs text-neutral-400">GymFlow · Mode hors ligne</p>
    </main>
  );
}
