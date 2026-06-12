import { NextResponse } from "next/server";
import { getCurrentGym, getNotifications } from "@/lib/supabase/queries";

export async function GET() {
  const gym = await getCurrentGym();
  if (!gym || gym.role !== "admin") {
    return NextResponse.json({ notifications: [] });
  }

  const notifications = await getNotifications(gym.id);
  return NextResponse.json({ notifications });
}
