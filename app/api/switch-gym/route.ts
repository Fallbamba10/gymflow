import { NextResponse } from "next/server";
import { getUserGyms } from "@/lib/supabase/queries";
import { setActiveGymId } from "@/lib/active-gym";

export async function POST(request: Request) {
  const { gymId } = await request.json();
  if (!gymId || typeof gymId !== "string") {
    return NextResponse.json({ error: "gymId requis" }, { status: 400 });
  }

  // Vérifier que l'user a bien accès à cette salle
  const gyms = await getUserGyms();
  const match = gyms.find((g) => g.id === gymId);
  if (!match) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  await setActiveGymId(gymId);
  return NextResponse.json({ ok: true });
}
