"use server";

import { redirect } from "next/navigation";
import { requireAdminGym } from "@/lib/supabase/guards";
import { createClient } from "@/lib/supabase/server";
import { getMonthlyReportData } from "@/lib/supabase/queries";
import { sendMonthlyReportEmail } from "@/lib/email";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function emailMonthlyReport(formData: FormData) {
  const gym = await requireAdminGym();
  const month = getString(formData, "month");

  if (!month) {
    redirect("/payments/report?error=Mois invalide");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect(`/payments/report?month=${month}&error=Email introuvable pour votre compte`);
  }

  const report = await getMonthlyReportData(gym.id, month);
  if (!report) {
    redirect(`/payments/report?month=${month}&error=Rapport introuvable`);
  }

  const topPlan = report.byPlan[0]?.name ?? null;

  await sendMonthlyReportEmail({
    to: user.email,
    gymName: report.gym.name,
    monthLabel: report.monthLabel,
    totalRevenue: report.totalRevenue,
    totalCheckins: report.totalCheckins,
    totalPayments: report.totalPayments,
    newMembers: report.newMembers,
    activeMembers: report.activeMembers,
    topPlan,
    currency: report.gym.currency,
  });

  redirect(`/payments/report?month=${month}&success=Rapport envoye a ${user.email}`);
}
