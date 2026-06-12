"use client";

import { useState } from "react";
import { CheckCircle2, ExternalLink, Loader2, RotateCcw, Smartphone } from "lucide-react";
import { SubmitButton } from "@/components/submit-button";
import { renewMemberSubscription } from "@/app/(app)/members/actions";
import { formatCurrency } from "@/lib/demo-data";

type SubscriptionType = {
  id: string;
  name: string;
  price: number;
};

type Props = {
  memberId: string;
  subscriptionTypes: SubscriptionType[];
  memberPhone?: string | null;
  isArchived: boolean;
};

type MobileResult = {
  payment_url: string | null;
  demo?: boolean;
  message?: string;
  error?: string;
};

export function RenewWithMobileMoney({ memberId, subscriptionTypes, memberPhone, isArchived }: Props) {
  const [selectedTypeId, setSelectedTypeId] = useState(subscriptionTypes[0]?.id ?? "");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [mmLoading, setMmLoading] = useState<"wave" | "orange" | null>(null);
  const [mmResult, setMmResult] = useState<MobileResult | null>(null);

  const selectedType = subscriptionTypes.find((t) => t.id === selectedTypeId);

  async function initiateMobileMoney(provider: "wave" | "orange") {
    if (!selectedTypeId) return;
    setMmLoading(provider);
    setMmResult(null);

    const endpoint = provider === "wave" ? "/api/payments/wave" : "/api/payments/orange";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ member_id: memberId, subscription_type_id: selectedTypeId }),
      });
      const data = (await res.json()) as MobileResult;

      if (!res.ok || data.error) {
        setMmResult({ payment_url: null, error: data.error ?? "Erreur serveur" });
      } else if (data.payment_url) {
        window.open(data.payment_url, "_blank", "noopener,noreferrer");
        setMmResult(data);
      } else {
        setMmResult(data);
      }
    } catch {
      setMmResult({ payment_url: null, error: "Erreur réseau" });
    } finally {
      setMmLoading(null);
    }
  }

  if (subscriptionTypes.length === 0) {
    return (
      <div className="rounded-md border border-line bg-paper p-4 text-sm text-neutral-500">
        Aucune formule disponible. Crée une formule d&apos;abord.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Sélecteur formule partagé */}
      <label className="block">
        <span className="text-sm font-semibold text-neutral-700">Formule</span>
        <select
          className="mt-2 h-11 w-full rounded-md border border-line bg-paper px-3 outline-none focus:border-mint"
          value={selectedTypeId}
          onChange={(e) => { setSelectedTypeId(e.target.value); setMmResult(null); }}
        >
          {subscriptionTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name} — {formatCurrency(type.price)}
            </option>
          ))}
        </select>
      </label>

      {/* Renouvellement cash/carte classique */}
      <form action={renewMemberSubscription}>
        <input type="hidden" name="member_id" value={memberId} />
        <input type="hidden" name="subscription_type_id" value={selectedTypeId} />
        <label className="block">
          <span className="text-sm font-semibold text-neutral-700">Mode de paiement</span>
          <select
            className="mt-2 h-11 w-full rounded-md border border-line bg-paper px-3 outline-none focus:border-mint"
            name="payment_method"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="cash">Espèces</option>
            <option value="card">Carte bancaire</option>
            <option value="other">Autre</option>
          </select>
        </label>

        <div className="mt-4 rounded-md border border-line bg-paper p-4 text-sm">
          <p className="font-semibold">Renouvellement immédiat</p>
          <p className="mt-1 text-neutral-500">L&apos;ancien abonnement actif sera marqué expiré.</p>
        </div>

        <SubmitButton
          type="submit"
          variant="accent"
          className="mt-4 h-12 w-full"
          disabled={!selectedTypeId || isArchived}
          pendingLabel="Renouvellement…"
        >
          <CheckCircle2 size={18} />
          Renouveler maintenant
        </SubmitButton>
      </form>

      {/* Séparateur mobile money */}
      <div className="relative flex items-center gap-3">
        <div className="h-px flex-1 bg-line" />
        <span className="text-xs font-semibold text-neutral-400">ou payer par mobile money</span>
        <div className="h-px flex-1 bg-line" />
      </div>

      {/* Boutons Wave / Orange */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500">
          <Smartphone size={13} />
          Génère un lien de paiement — abonnement activé automatiquement
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => initiateMobileMoney("wave")}
            disabled={mmLoading !== null || isArchived || !selectedTypeId}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-sky-200 bg-sky-50 px-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {mmLoading === "wave"
              ? <Loader2 size={15} className="animate-spin" />
              : <span className="text-base font-black text-sky-500 leading-none">W</span>
            }
            Wave
          </button>

          <button
            type="button"
            onClick={() => initiateMobileMoney("orange")}
            disabled={mmLoading !== null || isArchived || !selectedTypeId}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-orange-200 bg-orange-50 px-3 text-sm font-semibold text-orange-700 transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {mmLoading === "orange"
              ? <Loader2 size={15} className="animate-spin" />
              : <span className="text-base font-black text-orange-500 leading-none">O</span>
            }
            Orange
          </button>
        </div>

        {selectedType && (
          <p className="text-xs text-neutral-400">
            Montant : <span className="font-semibold text-neutral-600">{formatCurrency(selectedType.price)}</span>
            {memberPhone ? <> · Tél : <span className="font-semibold text-neutral-600">{memberPhone}</span></> : null}
          </p>
        )}
      </div>

      {/* Résultat mobile money */}
      {mmResult?.payment_url && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm">
          <p className="font-semibold text-emerald-700">Lien ouvert !</p>
          <p className="mt-1 text-emerald-600">L&apos;abonnement sera activé automatiquement après confirmation du paiement.</p>
          <a
            href={mmResult.payment_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 underline"
          >
            Rouvrir le lien <ExternalLink size={11} />
          </a>
        </div>
      )}

      {mmResult?.demo && !mmResult.payment_url && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          <p className="font-semibold">Mode démo</p>
          <p className="mt-1">{mmResult.message}</p>
        </div>
      )}

      {mmResult?.error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {mmResult.error}
        </div>
      )}
    </div>
  );
}
