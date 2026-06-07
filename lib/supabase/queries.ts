import { createClient } from "@/lib/supabase/server";

type RelationRow = {
  full_name?: string | null;
  member_number?: number | null;
  name?: string | null;
  phone?: string | null;
  starts_at?: string | null;
  expires_at?: string | null;
  subscription_types?: RelationRow | RelationRow[] | null;
};

type QueryRow = Record<string, unknown>;

function getRelation(value: unknown): RelationRow | null {
  if (!value) return null;
  return Array.isArray(value)
    ? (value[0] as RelationRow | undefined) ?? null
    : (value as RelationRow);
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asNullableString(value: unknown) {
  return typeof value === "string" ? value : null;
}

export type CurrentGym = {
  id: string;
  name: string;
  currency: string;
  role: "admin" | "operator";
};

export type GymSettings = {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  currency: string;
};

export type GymUserRecord = {
  id: string;
  user_id: string;
  role: "admin" | "operator";
  full_name: string | null;
  active: boolean;
  created_at: string;
};

export type GymStaffRecord = {
  id: string;
  role: "admin" | "operator";
  full_name: string;
  active: boolean;
  created_at: string;
};

export type SubscriptionTypeRecord = {
  id: string;
  name: string;
  duration_days: number;
  sessions: number | null;
  price: number;
  active: boolean;
  created_at: string;
};

export type SubscriptionTypeStats = {
  subscription_type_id: string;
  sales_count: number;
  revenue: number;
  active_subscriptions: number;
  latest_sale_at: string | null;
};

export type PublicGymPage = {
  gym: {
    id: string;
    name: string;
    phone: string | null;
    address: string | null;
    currency: string;
  };
  plans: Array<{
    id: string;
    name: string;
    duration_days: number;
    sessions: number | null;
    price: number;
  }>;
};

export type MemberRecord = {
  id: string;
  member_number: number;
  full_name: string;
  phone: string | null;
  created_at: string;
  archived_at: string | null;
  active_subscription: {
    id: string;
    expires_at: string;
    sessions_left: number | null;
    status: "active" | "expired" | "cancelled";
    subscription_types: {
      name: string;
    } | null;
  } | null;
};

export type CheckinCandidate = {
  id: string;
  member_number: number;
  full_name: string;
  phone: string | null;
  plan: string | null;
  expires_at: string | null;
  sessions_left: number | null;
  status: "active" | "warning" | "expired";
  status_label: string;
};

export type TodayCheckin = {
  id: string;
  member_id: string | null;
  checked_in_at: string;
  member_name: string;
  plan: string | null;
  notes: string | null;
  staff_name: string | null;
};

export type MemberDetail = MemberRecord & {
  notes: string | null;
};

export type MemberSubscription = {
  id: string;
  starts_at: string;
  expires_at: string;
  sessions_left: number | null;
  price_paid: number;
  status: "active" | "expired" | "cancelled";
  subscription_types: {
    name: string;
  } | null;
};

export type MemberCheckin = {
  id: string;
  checked_in_at: string;
  plan: string | null;
  staff_name: string | null;
};

export type MemberPayment = {
  id: string;
  amount: number;
  method: PaymentMethod;
  kind: "subscription" | "manual_adjustment";
  paid_at: string;
  notes: string | null;
  plan: string | null;
  staff_name: string | null;
};

export type DashboardAlert = {
  member_id: string;
  member_name: string;
  plan: string | null;
  status: "warning" | "expired";
  status_label: string;
};

export type DashboardRevenueDay = {
  date: string;
  label: string;
  amount: number;
};

export type DashboardRecentPayment = {
  id: string;
  amount: number;
  method: PaymentMethod;
  paid_at: string;
  member_id: string | null;
  member_name: string;
  plan: string | null;
  staff_name: string | null;
};

export type DashboardTopPlan = {
  name: string;
  amount: number;
  count: number;
};

export type DashboardData = {
  revenueToday: number;
  paymentsToday: number;
  checkinsToday: TodayCheckin[];
  activeMembers: number;
  totalMembers: number;
  alerts: DashboardAlert[];
  revenue7Days: DashboardRevenueDay[];
  recentPayments: DashboardRecentPayment[];
  topPlans: DashboardTopPlan[];
};

export type PaymentMethod = "cash" | "wave" | "orange_money" | "card" | "other";

export type PaymentRecord = {
  id: string;
  amount: number;
  method: PaymentMethod;
  kind: "subscription" | "manual_adjustment";
  paid_at: string;
  notes: string | null;
  member_id: string | null;
  member_name: string;
  plan: string | null;
  staff_name: string | null;
};

export type PaymentReceipt = PaymentRecord & {
  gym_id: string;
  member_number: number | null;
  member_phone: string | null;
  subscription_starts_at: string | null;
  subscription_expires_at: string | null;
};

export type PaymentsData = {
  payments: PaymentRecord[];
  total: number;
  count: number;
  todayTotal: number;
  methodTotals: Record<PaymentMethod, number>;
};

export async function getCurrentGym(): Promise<CurrentGym | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("gym_users")
    .select("role, gyms(id, name, currency)")
    .eq("user_id", user.id)
    .eq("active", true)
    .limit(1)
    .single();

  if (error || !data || !data.gyms) {
    return null;
  }

  const gym = Array.isArray(data.gyms) ? data.gyms[0] : data.gyms;
  if (!gym) {
    return null;
  }

  return {
    id: gym.id,
    name: gym.name,
    currency: gym.currency,
    role: data.role,
  };
}

export async function getGymSettings(gymId: string): Promise<GymSettings | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gyms")
    .select("id, name, phone, address, currency")
    .eq("id", gymId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function getGymUsers(gymId: string): Promise<GymUserRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gym_users")
    .select("id, user_id, role, full_name, active, created_at")
    .eq("gym_id", gymId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getGymStaff(gymId: string): Promise<GymStaffRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gym_staff")
    .select("id, role, full_name, active, created_at")
    .eq("gym_id", gymId)
    .order("created_at", { ascending: true });

  if (error) {
    if (error.message.includes("gym_staff")) {
      return [];
    }
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getSubscriptionTypes(
  gymId: string,
  options?: { includeInactive?: boolean },
): Promise<SubscriptionTypeRecord[]> {
  const supabase = await createClient();
  let request = supabase
    .from("subscription_types")
    .select("id, name, duration_days, sessions, price, active, created_at")
    .eq("gym_id", gymId)
    .order("created_at", { ascending: false });

  if (!options?.includeInactive) {
    request = request.eq("active", true);
  }

  const { data, error } = await request;

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getSubscriptionTypeStats(
  gymId: string,
): Promise<Record<string, SubscriptionTypeStats>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("subscription_type_id, price_paid, status, created_at")
    .eq("gym_id", gymId);

  if (error) {
    throw new Error(error.message);
  }

  const stats: Record<string, SubscriptionTypeStats> = {};
  for (const subscription of data ?? []) {
    const typeId = subscription.subscription_type_id;
    if (!typeId) continue;

    const current = stats[typeId] ?? {
      subscription_type_id: typeId,
      sales_count: 0,
      revenue: 0,
      active_subscriptions: 0,
      latest_sale_at: null,
    };

    const createdAt = typeof subscription.created_at === "string" ? subscription.created_at : null;
    stats[typeId] = {
      ...current,
      sales_count: current.sales_count + 1,
      revenue: current.revenue + Number(subscription.price_paid ?? 0),
      active_subscriptions:
        subscription.status === "active"
          ? current.active_subscriptions + 1
          : current.active_subscriptions,
      latest_sale_at:
        createdAt && (!current.latest_sale_at || createdAt > current.latest_sale_at)
          ? createdAt
          : current.latest_sale_at,
    };
  }

  return stats;
}

export async function getPublicGymPage(gymId: string): Promise<PublicGymPage | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_public_gym_page", {
    target_gym_id: gymId,
  });

  if (error || !data) {
    return null;
  }

  return data as PublicGymPage;
}

export async function getSubscriptionType(
  gymId: string,
  subscriptionTypeId: string,
): Promise<SubscriptionTypeRecord | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscription_types")
    .select("id, name, duration_days, sessions, price, active, created_at")
    .eq("gym_id", gymId)
    .eq("id", subscriptionTypeId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function getMembers(
  gymId: string,
  options?: { includeArchived?: boolean },
): Promise<MemberRecord[]> {
  const supabase = await createClient();
  let request = supabase
    .from("members")
    .select("id, member_number, full_name, phone, created_at, archived_at")
    .eq("gym_id", gymId)
    .order("created_at", { ascending: false });

  if (!options?.includeArchived) {
    request = request.is("archived_at", null);
  }

  const { data: members, error } = await request;

  if (error) {
    throw new Error(error.message);
  }

  const memberIds = (members ?? []).map((member) => member.id);
  if (memberIds.length === 0) {
    return [];
  }

  const { data: subscriptions, error: subscriptionsError } = await supabase
    .from("subscriptions")
    .select("id, member_id, expires_at, sessions_left, status, subscription_types(name)")
    .eq("gym_id", gymId)
    .in("member_id", memberIds)
    .order("created_at", { ascending: false });

  if (subscriptionsError) {
    throw new Error(subscriptionsError.message);
  }

  return (members ?? []).map((member) => {
    const subscription =
      subscriptions?.find((item) => item.member_id === member.id) ?? null;
    const subscriptionType = Array.isArray(subscription?.subscription_types)
      ? subscription?.subscription_types[0]
      : subscription?.subscription_types;
    const active_subscription = subscription
      ? {
          id: subscription.id,
          expires_at: subscription.expires_at,
          sessions_left: subscription.sessions_left,
          status: subscription.status,
          subscription_types: subscriptionType ? { name: subscriptionType.name } : null,
        }
      : null;

    return {
      ...member,
      active_subscription,
    };
  });
}

export async function getCheckinCandidates(gymId: string): Promise<CheckinCandidate[]> {
  const members = await getMembers(gymId);

  return members.map((member) => {
    const subscription = member.active_subscription;
    const expiresAt = subscription?.expires_at ? new Date(subscription.expires_at) : null;
    const daysLeft = expiresAt
      ? Math.ceil((expiresAt.getTime() - Date.now()) / 86400000)
      : -1;
    const sessionsLeft = subscription?.sessions_left;
    const lowSessions =
      sessionsLeft !== null &&
      sessionsLeft !== undefined &&
      sessionsLeft <= 2;
    const isExpired =
      !subscription ||
      subscription.status !== "active" ||
      daysLeft < 0 ||
      subscription.sessions_left === 0;

    let status: CheckinCandidate["status"] = "active";
    let status_label = "Actif";

    if (isExpired) {
      status = "expired";
      status_label = "Expire";
    } else if (lowSessions) {
      status = "warning";
      status_label = `${sessionsLeft} seance${sessionsLeft > 1 ? "s" : ""}`;
    } else if (daysLeft <= 2) {
      status = "warning";
      status_label = `Expire J-${Math.max(daysLeft, 0)}`;
    }

    return {
      id: member.id,
      member_number: member.member_number,
      full_name: member.full_name,
      phone: member.phone,
      plan: subscription?.subscription_types?.name ?? null,
      expires_at: subscription?.expires_at ?? null,
      sessions_left: subscription?.sessions_left ?? null,
      status,
      status_label,
    };
  });
}

export async function getTodayCheckins(gymId: string): Promise<TodayCheckin[]> {
  const supabase = await createClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const checkinsResult = await supabase
    .from("checkins")
    .select("id, member_id, checked_in_at, notes, members(full_name), subscriptions(subscription_types(name)), gym_staff(full_name)")
    .eq("gym_id", gymId)
    .gte("checked_in_at", today.toISOString())
    .order("checked_in_at", { ascending: false });
  let data = checkinsResult.data as QueryRow[] | null;
  let error = checkinsResult.error;

  if (error && isStaffAttributionUnavailable(error.message)) {
    const fallback = await supabase
      .from("checkins")
      .select("id, member_id, checked_in_at, notes, members(full_name), subscriptions(subscription_types(name))")
      .eq("gym_id", gymId)
      .gte("checked_in_at", today.toISOString())
      .order("checked_in_at", { ascending: false });

    data = fallback.data as QueryRow[] | null;
    error = fallback.error;
  }

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((checkin) => {
    const member = getRelation(checkin.members);
    const subscription = getRelation(checkin.subscriptions);
    const subscriptionType = getRelation(subscription?.subscription_types);
    const staff = getRelation(checkin.gym_staff);
    const notes = asNullableString(checkin.notes);
    const walkInName = notes?.replace(/^Seance simple\s*-\s*/i, "").trim();

    return {
      id: asString(checkin.id),
      member_id: asNullableString(checkin.member_id),
      checked_in_at: asString(checkin.checked_in_at),
      member_name: member?.full_name ?? walkInName ?? "Client seance",
      plan: subscriptionType?.name ?? (member ? null : "Seance simple"),
      notes,
      staff_name: staff?.full_name ?? null,
    };
  });
}

export async function getMemberDetail(
  gymId: string,
  memberId: string,
): Promise<MemberDetail | null> {
  const supabase = await createClient();
  const { data: member, error } = await supabase
    .from("members")
    .select("id, member_number, full_name, phone, notes, created_at, archived_at")
    .eq("gym_id", gymId)
    .eq("id", memberId)
    .single();

  if (error || !member) {
    return null;
  }

  const { data: subscriptions, error: subscriptionsError } = await supabase
    .from("subscriptions")
    .select("id, expires_at, sessions_left, status, subscription_types(name)")
    .eq("gym_id", gymId)
    .eq("member_id", memberId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (subscriptionsError) {
    throw new Error(subscriptionsError.message);
  }

  const subscription = subscriptions?.[0] ?? null;
  const subscriptionType = Array.isArray(subscription?.subscription_types)
    ? subscription?.subscription_types[0]
    : subscription?.subscription_types;

  return {
    ...member,
    active_subscription: subscription
      ? {
          id: subscription.id,
          expires_at: subscription.expires_at,
          sessions_left: subscription.sessions_left,
          status: subscription.status,
          subscription_types: subscriptionType ? { name: subscriptionType.name } : null,
        }
      : null,
  };
}

export async function getMemberSubscriptions(
  gymId: string,
  memberId: string,
): Promise<MemberSubscription[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("id, starts_at, expires_at, sessions_left, price_paid, status, subscription_types(name)")
    .eq("gym_id", gymId)
    .eq("member_id", memberId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((subscription) => {
    const subscriptionType = Array.isArray(subscription.subscription_types)
      ? subscription.subscription_types[0]
      : subscription.subscription_types;

    return {
      id: subscription.id,
      starts_at: subscription.starts_at,
      expires_at: subscription.expires_at,
      sessions_left: subscription.sessions_left,
      price_paid: subscription.price_paid,
      status: subscription.status,
      subscription_types: subscriptionType ? { name: subscriptionType.name } : null,
    };
  });
}

export async function getMemberCheckins(
  gymId: string,
  memberId: string,
): Promise<MemberCheckin[]> {
  const supabase = await createClient();
  const checkinsResult = await supabase
    .from("checkins")
    .select("id, checked_in_at, subscriptions(subscription_types(name)), gym_staff(full_name)")
    .eq("gym_id", gymId)
    .eq("member_id", memberId)
    .order("checked_in_at", { ascending: false })
    .limit(10);
  let data = checkinsResult.data as QueryRow[] | null;
  let error = checkinsResult.error;

  if (error && isStaffAttributionUnavailable(error.message)) {
    const fallback = await supabase
      .from("checkins")
      .select("id, checked_in_at, subscriptions(subscription_types(name))")
      .eq("gym_id", gymId)
      .eq("member_id", memberId)
      .order("checked_in_at", { ascending: false })
      .limit(10);

    data = fallback.data as QueryRow[] | null;
    error = fallback.error;
  }

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((checkin) => {
    const subscription = getRelation(checkin.subscriptions);
    const subscriptionType = getRelation(subscription?.subscription_types);
    const staff = getRelation(checkin.gym_staff);

    return {
      id: asString(checkin.id),
      checked_in_at: asString(checkin.checked_in_at),
      plan: subscriptionType?.name ?? null,
      staff_name: staff?.full_name ?? null,
    };
  });
}

export async function getMemberPayments(
  gymId: string,
  memberId: string,
): Promise<MemberPayment[]> {
  const supabase = await createClient();
  const paymentsResult = await supabase
    .from("payments")
    .select("id, amount, method, kind, paid_at, notes, subscriptions(subscription_types(name)), gym_staff(full_name)")
    .eq("gym_id", gymId)
    .eq("member_id", memberId)
    .order("paid_at", { ascending: false })
    .limit(20);
  let data = paymentsResult.data as QueryRow[] | null;
  let error = paymentsResult.error;

  if (error && isStaffAttributionUnavailable(error.message)) {
    const fallback = await supabase
      .from("payments")
      .select("id, amount, method, kind, paid_at, notes, subscriptions(subscription_types(name))")
      .eq("gym_id", gymId)
      .eq("member_id", memberId)
      .order("paid_at", { ascending: false })
      .limit(20);

    data = fallback.data as QueryRow[] | null;
    error = fallback.error;
  }

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((payment) => {
    const subscription = getRelation(payment.subscriptions);
    const subscriptionType = getRelation(subscription?.subscription_types);
    const staff = getRelation(payment.gym_staff);

    return {
      id: asString(payment.id),
      amount: Number(payment.amount ?? 0),
      method: normalizePaymentMethod(payment.method),
      kind: normalizePaymentKind(payment.kind),
      paid_at: asString(payment.paid_at),
      notes: asNullableString(payment.notes),
      plan: subscriptionType?.name ?? null,
      staff_name: staff?.full_name ?? null,
    };
  });
}

export async function getPaymentReceipt(
  gymId: string,
  paymentId: string,
): Promise<PaymentReceipt | null> {
  const supabase = await createClient();
  const paymentResult = await supabase
    .from("payments")
    .select("id, gym_id, amount, method, kind, paid_at, notes, member_id, members(full_name, member_number, phone), subscriptions(starts_at, expires_at, subscription_types(name)), gym_staff(full_name)")
    .eq("gym_id", gymId)
    .eq("id", paymentId)
    .single();
  let data = paymentResult.data as QueryRow | null;
  let error = paymentResult.error;

  if (error && isStaffAttributionUnavailable(error.message)) {
    const fallback = await supabase
      .from("payments")
      .select("id, gym_id, amount, method, kind, paid_at, notes, member_id, members(full_name, member_number, phone), subscriptions(starts_at, expires_at, subscription_types(name))")
      .eq("gym_id", gymId)
      .eq("id", paymentId)
      .single();

    data = fallback.data as QueryRow | null;
    error = fallback.error;
  }

  if (error || !data) {
    return null;
  }

  const member = getRelation(data.members);
  const subscription = getRelation(data.subscriptions);
  const subscriptionType = getRelation(subscription?.subscription_types);
  const staff = getRelation(data.gym_staff);

  return {
    id: asString(data.id),
    gym_id: asString(data.gym_id),
    amount: Number(data.amount ?? 0),
    method: normalizePaymentMethod(data.method),
    kind: normalizePaymentKind(data.kind),
    paid_at: asString(data.paid_at),
    notes: asNullableString(data.notes),
    member_id: asNullableString(data.member_id),
    member_name: member?.full_name ?? "Client comptoir",
    member_number: member?.member_number ?? null,
    member_phone: member?.phone ?? null,
    plan: subscriptionType?.name ?? null,
    subscription_starts_at: subscription?.starts_at ?? null,
    subscription_expires_at: subscription?.expires_at ?? null,
    staff_name: staff?.full_name ?? null,
  };
}

export async function getDashboardData(gymId: string): Promise<DashboardData> {
  const supabase = await createClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const [members, checkinsResult, paymentsResult, weekPaymentsResult, recentPaymentsInitialResult] = await Promise.all([
    getMembers(gymId),
    getTodayCheckins(gymId),
    supabase
      .from("payments")
      .select("amount")
      .eq("gym_id", gymId)
      .gte("paid_at", today.toISOString()),
    supabase
      .from("payments")
      .select("amount, paid_at, subscriptions(subscription_types(name))")
      .eq("gym_id", gymId)
      .gte("paid_at", sevenDaysAgo.toISOString()),
    supabase
      .from("payments")
      .select("id, amount, method, paid_at, member_id, members(full_name), subscriptions(subscription_types(name)), gym_staff(full_name)")
      .eq("gym_id", gymId)
      .order("paid_at", { ascending: false })
      .limit(6),
  ]);
  let recentPaymentsData = recentPaymentsInitialResult.data as QueryRow[] | null;
  let recentPaymentsError = recentPaymentsInitialResult.error;

  if (recentPaymentsError && isStaffAttributionUnavailable(recentPaymentsError.message)) {
    const fallback = await supabase
      .from("payments")
      .select("id, amount, method, paid_at, member_id, members(full_name), subscriptions(subscription_types(name))")
      .eq("gym_id", gymId)
      .order("paid_at", { ascending: false })
      .limit(6);
    recentPaymentsData = fallback.data as QueryRow[] | null;
    recentPaymentsError = fallback.error;
  }

  if (paymentsResult.error) {
    throw new Error(paymentsResult.error.message);
  }
  if (weekPaymentsResult.error) {
    throw new Error(weekPaymentsResult.error.message);
  }
  if (recentPaymentsError) {
    throw new Error(recentPaymentsError.message);
  }

  const alerts: DashboardAlert[] = [];
  let activeMembers = 0;

  for (const member of members) {
    const subscription = member.active_subscription;
    const expiresAt = subscription?.expires_at ? new Date(subscription.expires_at) : null;
    const daysLeft = expiresAt
      ? Math.ceil((expiresAt.getTime() - Date.now()) / 86400000)
      : -1;
    const sessionsLeft = subscription?.sessions_left;
    const plan = subscription?.subscription_types?.name ?? null;

    if (!subscription || subscription.status !== "active" || daysLeft < 0 || sessionsLeft === 0) {
      alerts.push({
        member_id: member.id,
        member_name: member.full_name,
        plan,
        status: "expired",
        status_label: "Expire",
      });
      continue;
    }

    activeMembers += 1;

    if (sessionsLeft !== null && sessionsLeft !== undefined && sessionsLeft <= 2) {
      alerts.push({
        member_id: member.id,
        member_name: member.full_name,
        plan,
        status: "warning",
        status_label: `${sessionsLeft} seance${sessionsLeft > 1 ? "s" : ""}`,
      });
    } else if (daysLeft <= 2) {
      alerts.push({
        member_id: member.id,
        member_name: member.full_name,
        plan,
        status: "warning",
        status_label: `Expire J-${Math.max(daysLeft, 0)}`,
      });
    }
  }

  const revenueToday = (paymentsResult.data ?? []).reduce(
    (sum, payment) => sum + Number(payment.amount ?? 0),
    0,
  );
  const revenueByDate = new Map<string, number>();
  const planTotals = new Map<string, DashboardTopPlan>();

  for (let index = 0; index < 7; index += 1) {
    const day = new Date(sevenDaysAgo);
    day.setDate(sevenDaysAgo.getDate() + index);
    revenueByDate.set(day.toISOString().slice(0, 10), 0);
  }

  for (const payment of weekPaymentsResult.data ?? []) {
    const date = new Date(payment.paid_at).toISOString().slice(0, 10);
    revenueByDate.set(date, (revenueByDate.get(date) ?? 0) + Number(payment.amount ?? 0));

    const subscription = Array.isArray(payment.subscriptions)
      ? payment.subscriptions[0]
      : payment.subscriptions;
    const subscriptionType = Array.isArray(subscription?.subscription_types)
      ? subscription?.subscription_types[0]
      : subscription?.subscription_types;
    const planName = subscriptionType?.name ?? "Paiements manuels";
    const current = planTotals.get(planName) ?? { name: planName, amount: 0, count: 0 };
    planTotals.set(planName, {
      ...current,
      amount: current.amount + Number(payment.amount ?? 0),
      count: current.count + 1,
    });
  }

  const revenue7Days = Array.from(revenueByDate.entries()).map(([date, amount]) => ({
    date,
    label: new Intl.DateTimeFormat("fr-FR", { weekday: "short" }).format(new Date(date)),
    amount,
  }));

  const recentPayments = (recentPaymentsData ?? []).map((payment) => {
    const member = getRelation(payment.members);
    const subscription = getRelation(payment.subscriptions);
    const subscriptionType = getRelation(subscription?.subscription_types);
    const staff = getRelation(payment.gym_staff);

    return {
      id: asString(payment.id),
      amount: Number(payment.amount ?? 0),
      method: normalizePaymentMethod(payment.method),
      paid_at: asString(payment.paid_at),
      member_id: asNullableString(payment.member_id),
      member_name: member?.full_name ?? "Membre supprime",
      plan: subscriptionType?.name ?? null,
      staff_name: staff?.full_name ?? null,
    };
  });

  return {
    revenueToday,
    paymentsToday: paymentsResult.data?.length ?? 0,
    checkinsToday: checkinsResult,
    activeMembers,
    totalMembers: members.length,
    alerts: alerts.slice(0, 8),
    revenue7Days,
    recentPayments,
    topPlans: Array.from(planTotals.values())
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5),
  };
}

export type PaymentsPeriod = "today" | "week" | "month" | "all";

function getPeriodStart(period: PaymentsPeriod) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);

  if (period === "week") {
    const day = date.getDay();
    const diff = day === 0 ? 6 : day - 1;
    date.setDate(date.getDate() - diff);
  }

  if (period === "month") {
    date.setDate(1);
  }

  return date;
}

function normalizePaymentMethod(method: unknown): PaymentMethod {
  if (
    method === "cash" ||
    method === "wave" ||
    method === "orange_money" ||
    method === "card" ||
    method === "other"
  ) {
    return method;
  }

  return "other";
}

function normalizePaymentKind(kind: unknown): "subscription" | "manual_adjustment" {
  return kind === "manual_adjustment" ? "manual_adjustment" : "subscription";
}

function isStaffAttributionUnavailable(message: string) {
  return (
    message.includes("gym_staff") ||
    message.includes("staff_id") ||
    message.includes("relationship")
  );
}

export async function getPaymentsData(
  gymId: string,
  filters?: {
    period?: PaymentsPeriod;
    method?: PaymentMethod | "all";
    query?: string;
  },
): Promise<PaymentsData> {
  const supabase = await createClient();
  const period = filters?.period ?? "today";
  const method = filters?.method ?? "all";
  const query = filters?.query?.trim().toLowerCase() ?? "";
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let request = supabase
    .from("payments")
    .select("id, amount, method, kind, paid_at, notes, member_id, members(full_name), subscriptions(subscription_types(name)), gym_staff(full_name)")
    .eq("gym_id", gymId)
    .order("paid_at", { ascending: false })
    .limit(200);

  if (period !== "all") {
    request = request.gte("paid_at", getPeriodStart(period).toISOString());
  }

  if (method !== "all") {
    request = request.eq("method", method);
  }

  const [paymentsInitialResult, todayResult] = await Promise.all([
    request,
    supabase
      .from("payments")
      .select("amount")
      .eq("gym_id", gymId)
      .gte("paid_at", today.toISOString()),
  ]);
  let data = paymentsInitialResult.data as QueryRow[] | null;
  let error = paymentsInitialResult.error;

  if (error && isStaffAttributionUnavailable(error.message)) {
    let fallbackRequest = supabase
      .from("payments")
      .select("id, amount, method, kind, paid_at, notes, member_id, members(full_name), subscriptions(subscription_types(name))")
      .eq("gym_id", gymId)
      .order("paid_at", { ascending: false })
      .limit(200);

    if (period !== "all") {
      fallbackRequest = fallbackRequest.gte("paid_at", getPeriodStart(period).toISOString());
    }

    if (method !== "all") {
      fallbackRequest = fallbackRequest.eq("method", method);
    }

    const fallback = await fallbackRequest;
    data = fallback.data as QueryRow[] | null;
    error = fallback.error;
  }

  if (error) {
    throw new Error(error.message);
  }

  if (todayResult.error) {
    throw new Error(todayResult.error.message);
  }

  const payments = (data ?? []).map((payment) => {
    const member = getRelation(payment.members);
    const subscription = getRelation(payment.subscriptions);
    const subscriptionType = getRelation(subscription?.subscription_types);
    const paymentMethod = normalizePaymentMethod(payment.method);
    const staff = getRelation(payment.gym_staff);

    return {
      id: asString(payment.id),
      amount: Number(payment.amount ?? 0),
      method: paymentMethod,
      kind: normalizePaymentKind(payment.kind),
      paid_at: asString(payment.paid_at),
      notes: asNullableString(payment.notes),
      member_id: asNullableString(payment.member_id),
      member_name: member?.full_name ?? "Membre supprime",
      plan: subscriptionType?.name ?? null,
      staff_name: staff?.full_name ?? null,
    };
  });

  const filteredPayments = query
    ? payments.filter((payment) => {
        const haystack = `${payment.member_name} ${payment.plan ?? ""} ${payment.method} ${payment.staff_name ?? ""}`.toLowerCase();
        return haystack.includes(query);
      })
    : payments;

  const methodTotals: PaymentsData["methodTotals"] = {
    cash: 0,
    wave: 0,
    orange_money: 0,
    card: 0,
    other: 0,
  };

  for (const payment of filteredPayments) {
    methodTotals[payment.method] += payment.amount;
  }

  return {
    payments: filteredPayments,
    total: filteredPayments.reduce((sum, payment) => sum + payment.amount, 0),
    count: filteredPayments.length,
    todayTotal: (todayResult.data ?? []).reduce(
      (sum, payment) => sum + Number(payment.amount ?? 0),
      0,
    ),
    methodTotals,
  };
}
