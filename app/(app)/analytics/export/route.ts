import { csvResponse, toCsv } from "@/lib/csv";
import { requireAdminGym } from "@/lib/supabase/guards";
import { getAnalyticsData } from "@/lib/supabase/queries";

const WEEKDAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export async function GET(request: Request) {
  const gym = await requireAdminGym();

  const url = new URL(request.url);
  const sheet = url.searchParams.get("sheet") ?? "daily";

  const data = await getAnalyticsData(gym.id);

  let csv: string;
  let filename: string;

  if (sheet === "hourly") {
    csv = toCsv(
      data.byHour.map((row) => ({
        heure: `${String(row.hour).padStart(2, "0")}h`,
        entrees: row.count,
      })),
    );
    filename = "gymflow-analytics-heures.csv";
  } else if (sheet === "weekday") {
    csv = toCsv(
      data.byWeekday.map((row) => ({
        jour: WEEKDAY_LABELS[row.day] ?? row.label,
        entrees: row.count,
      })),
    );
    filename = "gymflow-analytics-jours.csv";
  } else if (sheet === "members") {
    csv = toCsv(
      data.topMembers.map((row) => ({
        membre: row.name,
        entrees_30j: row.count,
      })),
    );
    filename = "gymflow-analytics-top-membres.csv";
  } else {
    // daily (default)
    csv = toCsv(
      data.last30Days.map((row) => ({
        date: row.date,
        entrees: row.count,
        revenus: row.revenue,
      })),
    );
    filename = "gymflow-analytics-30j.csv";
  }

  return csvResponse(filename, csv);
}
