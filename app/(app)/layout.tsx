import { redirect } from "next/navigation";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { getCurrentGym } from "@/lib/supabase/queries";
import { isActiveSubscription } from "@/lib/stripe";

export default async function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (hasSupabaseEnv()) {
    const gym = await getCurrentGym();
    if (!gym) {
      redirect("/onboarding");
    }
    if (!isActiveSubscription(gym.billing_status)) {
      redirect("/billing");
    }
  }

  return children;
}

