"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentGym } from "@/lib/supabase/queries";

export async function performMemberCheckin(formData: FormData) {
  const memberId = formData.get("member_id");
  if (typeof memberId !== "string" || !memberId) {
    redirect("/checkin?error=Membre invalide");
  }

  const gym = await getCurrentGym();
  if (!gym) {
    redirect("/onboarding");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.rpc("perform_checkin", {
    target_gym_id: gym.id,
    target_member_id: memberId,
    target_operator_id: user?.id,
  });

  if (error) {
    const message =
      error.message === "no_active_subscription"
        ? "Aucun abonnement actif"
        : error.message;
    redirect(`/checkin?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/checkin");
  revalidatePath("/members");
  redirect("/checkin?success=Entree validee");
}

