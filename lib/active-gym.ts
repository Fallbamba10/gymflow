import { cookies } from "next/headers";

const COOKIE = "active_gym_id";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 jours

export async function getActiveGymId(): Promise<string | null> {
  const store = await cookies();
  return store.get(COOKIE)?.value ?? null;
}

export async function setActiveGymId(gymId: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, gymId, { path: "/", maxAge: MAX_AGE, httpOnly: true, sameSite: "lax" });
}
