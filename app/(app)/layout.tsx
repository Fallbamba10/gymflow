import { redirect } from "next/navigation";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { getCurrentGym } from "@/lib/supabase/queries";

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
  }

  return children;
}

