"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Smartphone } from "lucide-react";
import { SubmitButton } from "@/components/submit-button";
import { renewMemberSubscription } from "@/app/(app)/members/actions";
import { formatCurrency } from "@/lib/demo-data";
import type { IntechService } from "@/lib/intech";

const INTECH_PROVIDERS: { service: IntechService; label: string; color: string }[] = [
  { service: "WAVE_SN_API_CASH_IN", label: "Wave", color: "sky" },
  { service: "ORANGE_SN_API_CASH_IN", label: "Orange Money", color: "orange" },
  { service: "FREE_SN_WALLET_CASH_IN", label: "Free Money", color: "red" },
  { service: "WIZALL_SN_API_CASH_IN", label: "Wizall", color: "purple" },
];

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
  success?: boolean;
  demo?: boolean;
  message?: string;
  error?: string;
};

export function RenewWithMobileMoney({ memberId, subscriptionTypes, memberPhone, isArchived }: Props) {
  const [selectedTypeId, setSelectedTypeId] = useState(subscriptionTypes[0]?.id ?? "");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [mmLoading, setMmLoading] = useState<IntechService | null>(null);
  const [mmResult, setMmResult] = useState<MobileResult | null>(null);

  const selectedType = subscriptionTypes.find((t) => t.id === selectedTypeId);

  async function initiateIntech(service: IntechService) {
    if (!selectedTypeId || !memberPhone) return;
    setMmLoading(service);
    setMmResult(null);

    try {
      const res = await fetch("/api/payments/intech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ member_id: memberId, subscription_type_id: selectedTypeId, service }),
      });
      const data = (await res.json()) as MobileResult;

      if (!res.ok || data.error) {
        setMmResult({ error: data.error ?? "Erreur serveur" });
      } else {
        setMmResult(data);
      }
    } catch {
      setMmResult({ error: "Erreur réseau" });
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

      {/* Boutons Intech — Wave / Orange / Free Money / Wizall */}
      <div className="space-y-2">
        <p className="text-xs text-neutral-500 flex items-center gap-1">
          <Smartphone size={12} className="text-mint" />
          La demande est envoyée directement sur le téléphone du membre.
        </p>
        {selectedType && memberPhone && (
          <p className="text-xs text-neutral-400">
            {formatCurrency(selectedType.price)} · {memberPhone}
          </p>
        )}
        {!memberPhone && (
          <p className="text-xs text-amber-600">
            Ce membre n&apos;a pas de numéro — ajoutez-en un pour activer le mobile money.
          </p>
        )}
        <div className="grid grid-cols-2 gap-2">
          {INTECH_PROVIDERS.map(({ service, label, color }) => (
            <button
              key={service}
              type="button"
              onClick={() => initiateIntech(service)}
              disabled={mmLoading !== null || isArchived || !selectedTypeId || !memberPhone}
              className={[
                "inline-flex h-10 items-center justify-center gap-1.5 rounded-md border px-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
                color === "sky" ? "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100" : "",
                color === "orange" ? "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100" : "",
                color === "red" ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100" : "",
                color === "purple" ? "border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100" : "",
              ].join(" ")}
            >
              {mmLoading === service && <Loader2 size={13} className="animate-spin" />}
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Résultat */}
      {mmResult?.success && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm">
          <p className="font-semibold text-emerald-700">Demande envoyée !</p>
          <p className="mt-1 text-emerald-600">
            Une notification a été envoyée sur le téléphone du membre. L&apos;abonnement s&apos;activera automatiquement après confirmation.
          </p>
        </div>
      )}

      {mmResult?.demo && (
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
