import { csvResponse, toCsv } from "@/lib/csv";
import {
  getCurrentGym,
  getPaymentsData,
  type PaymentMethod,
  type PaymentsPeriod,
} from "@/lib/supabase/queries";

const methodLabels: Record<PaymentMethod, string> = {
  cash: "Especes",
  wave: "Wave",
  orange_money: "Orange Money",
  card: "Carte",
  other: "Autre",
};

function getPeriod(value: string | null): PaymentsPeriod {
  if (value === "week" || value === "month" || value === "all") {
    return value;
  }

  return "today";
}

function getMethod(value: string | null): PaymentMethod | "all" {
  if (
    value === "cash" ||
    value === "wave" ||
    value === "orange_money" ||
    value === "card" ||
    value === "other"
  ) {
    return value;
  }

  return "all";
}

export async function GET(request: Request) {
  const gym = await getCurrentGym();
  if (!gym) {
    return csvResponse("gymflow-caisse.csv", toCsv([{ erreur: "Non connecte" }]));
  }

  const url = new URL(request.url);
  const paymentsData = await getPaymentsData(gym.id, {
    period: getPeriod(url.searchParams.get("period")),
    method: getMethod(url.searchParams.get("method")),
    query: url.searchParams.get("q") ?? "",
  });
  const csv = toCsv(
    paymentsData.payments.map((payment) => ({
      date: payment.paid_at,
      membre: payment.member_name,
      formule_ou_note: payment.plan ?? payment.notes ?? "",
      moyen: methodLabels[payment.method],
      type: payment.kind === "subscription" ? "Abonnement" : "Ajustement",
      montant: payment.amount,
    })),
  );

  return csvResponse("gymflow-caisse.csv", csv);
}
