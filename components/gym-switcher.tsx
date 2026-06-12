"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Building2, Check, ChevronDown, Plus, Loader2 } from "lucide-react";

type Gym = {
  id: string;
  name: string;
  role: string;
  billing_status: string;
};

export function GymSwitcher({ currentGymId }: { currentGymId: string }) {
  const router = useRouter();
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/user-gyms")
      .then((r) => r.json())
      .then((d) => setGyms(d.gyms ?? []))
      .catch(() => null);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const current = gyms.find((g) => g.id === currentGymId);

  async function switchTo(gymId: string) {
    if (gymId === currentGymId) { setOpen(false); return; }
    setSwitching(gymId);
    await fetch("/api/switch-gym", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gymId }),
    });
    router.refresh();
    setOpen(false);
    setSwitching(null);
  }

  // Si une seule salle : pas de switcher
  if (gyms.length <= 1) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 rounded-md border border-line bg-paper px-3 py-2 text-sm transition hover:bg-neutral-100"
      >
        <div className="flex min-w-0 items-center gap-2">
          <Building2 size={14} className="shrink-0 text-mint" />
          <span className="truncate font-semibold">{current?.name ?? "Sélectionner"}</span>
        </div>
        <ChevronDown size={13} className={`shrink-0 text-neutral-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-line bg-white shadow-xl">
          <div className="border-b border-line px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-400">Mes salles</p>
          </div>

          <div className="py-1">
            {gyms.map((gym) => {
              const isActive = gym.id === currentGymId;
              const isLoading = switching === gym.id;
              return (
                <button
                  key={gym.id}
                  onClick={() => switchTo(gym.id)}
                  disabled={isLoading}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-paper disabled:opacity-60"
                >
                  <div className={`flex size-7 shrink-0 items-center justify-center rounded-md text-xs font-bold ${isActive ? "bg-ink text-white" : "bg-neutral-100 text-neutral-500"}`}>
                    {gym.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{gym.name}</p>
                    <p className="text-xs text-neutral-400">{gym.role === "admin" ? "Administrateur" : "Opérateur"}</p>
                  </div>
                  {isLoading ? (
                    <Loader2 size={14} className="shrink-0 animate-spin text-mint" />
                  ) : isActive ? (
                    <Check size={14} className="shrink-0 text-mint" />
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="border-t border-line px-3 py-2">
            <a
              href="/onboarding"
              className="flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-mint"
              onClick={() => setOpen(false)}
            >
              <Plus size={13} />
              Créer une nouvelle salle
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
