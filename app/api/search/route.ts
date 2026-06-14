import { NextResponse } from "next/server";
import { getCurrentGym } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json({ members: [], payments: [] });
  }

  const gym = await getCurrentGym();
  if (!gym || gym.role !== "admin") {
    return NextResponse.json({ members: [], payments: [] });
  }

  const supabase = await createClient();
  const pattern = `%${q}%`;

  const [membersResult, paymentsResult] = await Promise.all([
    supabase
      .from("members")
      .select("id, member_number, full_name, phone, archived_at, subscriptions(status, expires_at, subscription_types(name))")
      .eq("gym_id", gym.id)
      .or(`full_name.ilike.${pattern},phone.ilike.${pattern}`)
      .is("archived_at", null)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("payments")
      .select("id, amount, paid_at, member_id, members(full_name)")
      .eq("gym_id", gym.id)
      .gte("paid_at", new Date(Date.now() - 90 * 86400000).toISOString())
      .order("paid_at", { ascending: false })
      .limit(4),
  ]);

  const memberNum = q.replace(/\D/g, "").padStart(6, "0");
  let membersByNumber: typeof membersResult.data = [];
  if (/^\d+$/.test(q)) {
    const { data } = await supabase
      .from("members")
      .select("id, member_number, full_name, phone, archived_at, subscriptions(status, expires_at, subscription_types(name))")
      .eq("gym_id", gym.id)
      .is("archived_at", null)
      .eq("member_number", parseInt(memberNum, 10))
      .limit(3);
    membersByNumber = data ?? [];
  }

  const allMembers = [
    ...(membersByNumber ?? []),
    ...(membersResult.data ?? []).filter(
      (m) => !membersByNumber?.find((n) => n.id === m.id),
    ),
  ].slice(0, 6);

  // Filter payments by member name matching query
  const filteredPayments = (paymentsResult.data ?? []).filter((p) => {
    const member = Array.isArray(p.members) ? p.members[0] : p.members;
    const name = (member as { full_name?: string } | null)?.full_name ?? "";
    return name.toLowerCase().includes(q.toLowerCase());
  });

  const members = allMembers.map((m) => {
    const sub = Array.isArray(m.subscriptions) ? m.subscriptions[0] : m.subscriptions;
    const subRaw = sub as { status?: string; subscription_types?: unknown } | null;
    const stRaw = subRaw?.subscription_types;
    const subType = Array.isArray(stRaw) ? (stRaw[0] as { name?: string } | undefined) : (stRaw as { name?: string } | null);
    return {
      id: m.id,
      member_number: m.member_number,
      full_name: m.full_name,
      phone: m.phone ?? null,
      plan: subType?.name ?? null,
      status: subRaw?.status ?? "none",
    };
  });

  const payments = filteredPayments.map((p) => {
    const member = Array.isArray(p.members) ? p.members[0] : p.members;
    return {
      id: p.id,
      amount: Number(p.amount ?? 0),
      paid_at: p.paid_at as string,
      member_id: p.member_id as string | null,
      member_name: (member as { full_name?: string } | null)?.full_name ?? "Client",
    };
  });

  return NextResponse.json({ members, payments });
}
