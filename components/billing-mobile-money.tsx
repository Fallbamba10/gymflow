"use client";

import { useState } from "react";
import { Loader2, Smartphone } from "lucide-react";
import type { IntechService } from "@/lib/intech";

const PROVIDERS: { service: IntechService; label: string }[] = [
  { service: "WAVE_SN_API_CASH_IN", label: "Wave" },
  { service: "ORANGE_SN_API_CASH_IN", label: "Orange Money" },
  { service: "FREE_SN_WALLET_CASH_IN", label: "Free Money" },
  { service: "WIZALL_SN_API_CASH_IN", label: "Wizall" },
];

type Result = {
  success?: boolean;
  demo?: boolean;
  message?: string;
  error?: string;
};

export function BillingMobileMoneyButtons({ phone }: { phone?: string | null }) {
  const [loading, setLoading] = useState<IntechService | null>(null);
  const [inputPhone, setInputPhone] = useState(phone ?? "");
  const [result, setResult] = useState<Result | null>(null);

  async function initiate(service: IntechService) {
    if (!inputPhone) return;
    setLoading(service);
    setResult(null);

    try {
      const res = await fetch("/api/billing/intech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service, phone: inputPhone }),
      });
      const data = (await res.json()) as Result;

      if (!res.ok || data.error) {
        setResult({ error: data.error ?? "Erreur serveur" });
      } else {
        setResult(data);
      }
    } catch {
      setResult({ error: "Erreur réseau" });
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative flex items-center gap-3">
        <div className="h-px flex-1 bg-white/15" />
        <span className="text-xs font-semibold text-white/50">ou mobile money</span>
        <div className="h-px flex-1 bg-white/15" />
      </div>

      {/* Numéro de téléphone */}
      <input
        type="tel"
        value={inputPhone}
        onChange={(e) => { setInputPhone(e.target.value); setResult(null); }}
        placeholder="Numéro de téléphone (ex: +221 77 000 00 00)"
        className="h-10 w-full rounded-md border border-white/15 bg-white/10 px-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/30"
      />

      {/* Boutons providers */}
      <div className="grid grid-cols-2 gap-2">
        {PROVIDERS.map(({ service, label }) => (
          <button
            key={service}
            type="button"
            onClick={() => initiate(service)}
            disabled={loading !== null || !inputPhone}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-md border border-white/15 bg-white/10 px-3 text-sm font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading === service
              ? <Loader2 size={14} className="animate-spin" />
              : <Smartphone size={14} />
            }
            {label}
          </button>
        ))}
      </div>

      {result?.success && (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
          <p className="font-semibold">Demande envoyée !</p>
          <p className="mt-1 opacity-80">Confirme le paiement sur ton téléphone. L&apos;accès s&apos;activera automatiquement.</p>
        </div>
      )}

      {result?.demo && (
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
