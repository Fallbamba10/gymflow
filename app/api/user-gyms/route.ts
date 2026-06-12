import { NextResponse } from "next/server";
import { getUserGyms } from "@/lib/supabase/queries";

export async function GET() {
  const gyms = await getUserGyms();
  return NextResponse.json({ gyms });
}
