"use client";

import { useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";

type Result = {
  payment_url: string | null;
  demo?: boolean;
  message?: string;
  error?: string;
};

export function BillingMobileMoneyButtons() {
  const [loading, setLoading] = useState<"wave" | "orange" | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  async function initiate(provider: "wave" | "orange") {
    setLoading(provider);
    setResult(null);
    const endpoint = provider === "wave" ? "/api/billing/wave" : "/api/billing/orange";

    try {
      const res = await fetch(endpoint, { method: "POST" });
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
      setLoading(null);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">ou payer par mobile money</p>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => initiate("wave")}
          disabled={loading !== null}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-sky-200 bg-sky-50 px-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading === "wave"
            ? <Loader2 size={15} className="animate-spin" />
            : <span className="text-base font-black text-sky-500 leading-none">W</span>
          }
          Wave
        </button>

        <button
          type="button"
          onClick={() => initiate("orange")}
          disabled={loading !== null}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-orange-200 bg-orange-50 px-3 text-sm font-semibold text-orange-700 transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading === "orange"
            ? <Loader2 size={15} className="animate-spin" />
            : <span className="text-base font-black text-orange-500 leading-none">O</span>
          }
          Orange Money
        </button>
      </div>

      {result?.payment_url && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm">
          <p className="font-semibold text-emerald-700">Lien ouvert !</p>
          <p className="mt-1 text-emerald-600">Une fois le paiement confirmé, ton accès sera activé.</p>
          <a
            href={result.payment_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 underline"
          >
            Rouvrir le lien <ExternalLink size={11} />
          </a>
        </div>
      )}

      {result?.demo && !result.payment_url && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          <p className="font-semibold">Mode démo</p>
          <p className="mt-1">{result.message}</p>
        </div>
      )}

      {result?.error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {result.error}
        </div>
      )}
    </div>
  );
}
