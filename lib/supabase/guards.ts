import { redirect } from "next/navigation";
import { getCurrentGym, type CurrentGym } from "@/lib/supabase/queries";

export async function requireCurrentGym(): Promise<CurrentGym> {
  const gym = await getCurrentGym();
  if (!gym) {
    redirect("/onboarding");
  }

  return gym;
}

export async function requireAdminGym(): Promise<CurrentGym> {
  const gym = await requireCurrentGym();
  if (gym.role !== "admin") {
    redirect("/");
  }

  return gym;
}
