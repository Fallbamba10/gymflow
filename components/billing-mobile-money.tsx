"use client";

import { useState } from "react";
import { ExternalLink, Loader2, Smartphone } from "lucide-react";

type Result = {
  payment_url: string | null;
  demo?: boolean;
  message?: string;
  error?: string;
};

export function BillingMobileMoneyButtons() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function initiate() {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/billing/paydunya", { method: "POST" });
      const data = (await res.json()) as Result;

      if (!res.ok || data.error) {
        setResult({ payment_url: null, error: data.error ?? "Erreur serveur" });
      } else if (data.payment_url) {
        window.open(data.payment_url, "_blank", "noopener,noreferrer");
        setResult(data);
      } else {
        setResult(data);
      }
    } catch {
      setResult({ payment_url: null, error: "Erreur réseau" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative flex items-center gap-3">
        <div className="h-px flex-1 bg-white/15" />
        <span className="text-xs font-semibold text-white/50">ou mobile money</span>
        <div className="h-px flex-1 bg-white/15" />
      </div>

      <button
        type="button"
        onClick={initiate}
        disabled={loading}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? <Loader2 size={16} className="animate-spin" />
          : <Smartphone size={16} />
        }
        Payer par Wave / Orange / Free Money
      </button>

      {result?.payment_url && (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
          <p className="font-semibold">Page de paiement ouverte</p>
          <p className="mt-1 opacity-80">Ton accès sera activé après confirmation du paiement.</p>
          <a
            href={result.payment_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold underline"
          >
            Rouvrir le lien <ExternalLink size={11} />
          </a>
        </div>
      )}

      {result?.demo && !result.payment_url && (
        <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-300">
          <p className="font-semibold">Mode démo</p>
          <p className="mt-1">{result.message}</p>
        </div>
      )}

      {result?.error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {result.error}
        </div>
      )}
    </div>
  );
}
