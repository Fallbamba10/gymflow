"use client";

import { useState } from "react";
import { CreditCard, RefreshCw } from "lucide-react";

type BtnProps = {
  label?: string;
  fullWidth?: boolean;
};

export function CheckoutButton({ label, fullWidth }: BtnProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setLoading(false);
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-md bg-mint text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60 ${fullWidth ? "w-full" : ""}`}
    >
      <CreditCard size={17} />
      {loading ? "Chargement…" : (label ?? "Souscrire")}
    </button>
  );
}

export function PortalButton({ label, fullWidth }: BtnProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setLoading(false);
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-md border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/20 disabled:opacity-60 ${fullWidth ? "w-full" : ""}`}
    >
      <RefreshCw size={17} />
      {loading ? "Chargement…" : (label ?? "Gérer l'abonnement")}
    </button>
  );
}
