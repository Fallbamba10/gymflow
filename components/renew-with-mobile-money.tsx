"use client";

import { useState } from "react";
import { CheckCircle2, ExternalLink, Loader2, Smartphone } from "lucide-react";
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
  const [mmLoading, setMmLoading] = useState(false);
  const [mmResult, setMmResult] = useState<MobileResult | null>(null);

  const selectedType = subscriptionTypes.find((t) => t.id === selectedTypeId);

  async function initiateMobileMoney() {
    if (!selectedTypeId) return;
    setMmLoading(true);
    setMmResult(null);

    try {
      const res = await fetch("/api/payments/paydunya", {
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
      setMmLoading(false);
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

      {/* Renouvellement cash/carte */}
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

      {/* Séparateur */}
      <div className="relative flex items-center gap-3">
        <div className="h-px flex-1 bg-line" />
        <span className="text-xs font-semibold text-neutral-400">ou mobile money</span>
        <div className="h-px flex-1 bg-line" />
      </div>

      {/* Bouton PayDunya — Wave / Orange / Free Money */}
      <div className="space-y-2">
        <p className="text-xs text-neutral-500">
          Génère un lien de paiement — l&apos;abonnement s&apos;active automatiquement après confirmation.
        </p>
        {selectedType && memberPhone && (
          <p className="text-xs text-neutral-400">
            {formatCurrency(selectedType.price)} · {memberPhone}
          </p>
        )}
        <button
          type="button"
          onClick={initiateMobileMoney}
          disabled={mmLoading || isArchived || !selectedTypeId}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md border border-line bg-paper px-4 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {mmLoading
            ? <Loader2 size={16} className="animate-spin" />
            : <Smartphone size={16} className="text-mint" />
          }
          Payer par Wave / Orange / Free Money
        </button>
      </div>

      {/* Résultat */}
      {mmResult?.payment_url && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm">
          <p className="font-semibold text-emerald-700">Page de paiement ouverte</p>
          <p className="mt-1 text-emerald-600">L&apos;abonnement sera activé automatiquement après confirmation.</p>
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
