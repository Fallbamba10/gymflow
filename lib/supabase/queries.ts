import { createClient } from "@/lib/supabase/server";

export type CurrentGym = {
  id: string;
  name: string;
  currency: string;
  role: "admin" | "operator";
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
  checked_in_at: string;
  member_name: string;
  plan: string | null;
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
};

export type DashboardAlert = {
  member_id: string;
  member_name: string;
  plan: string | null;
  status: "warning" | "expired";
  status_label: string;
};

export type DashboardData = {
  revenueToday: number;
  paymentsToday: number;
  checkinsToday: TodayCheckin[];
  activeMembers: number;
  totalMembers: number;
  alerts: DashboardAlert[];
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

export async function getSubscriptionTypes(gymId: string): Promise<SubscriptionTypeRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscription_types")
    .select("id, name, duration_days, sessions, price, active, created_at")
    .eq("gym_id", gymId)
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getMembers(gymId: string): Promise<MemberRecord[]> {
  const supabase = await createClient();
  const { data: members, error } = await supabase
    .from("members")
    .select("id, member_number, full_name, phone, created_at, archived_at")
    .eq("gym_id", gymId)
    .is("archived_at", null)
    .order("created_at", { ascending: false });

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

  const { data, error } = await supabase
    .from("checkins")
    .select("id, checked_in_at, members(full_name), subscriptions(subscription_types(name))")
    .eq("gym_id", gymId)
    .gte("checked_in_at", today.toISOString())
    .order("checked_in_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((checkin) => {
    const member = Array.isArray(checkin.members) ? checkin.members[0] : checkin.members;
    const subscription = Array.isArray(checkin.subscriptions)
      ? checkin.subscriptions[0]
      : checkin.subscriptions;
    const subscriptionType = Array.isArray(subscription?.subscription_types)
      ? subscription?.subscription_types[0]
      : subscription?.subscription_types;

    return {
      id: checkin.id,
      checked_in_at: checkin.checked_in_at,
      member_name: member?.full_name ?? "Membre",
      plan: subscriptionType?.name ?? null,
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
  const { data, error } = await supabase
    .from("checkins")
    .select("id, checked_in_at, subscriptions(subscription_types(name))")
    .eq("gym_id", gymId)
    .eq("member_id", memberId)
    .order("checked_in_at", { ascending: false })
    .limit(10);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((checkin) => {
    const subscription = Array.isArray(checkin.subscriptions)
      ? checkin.subscriptions[0]
      : checkin.subscriptions;
    const subscriptionType = Array.isArray(subscription?.subscription_types)
      ? subscription?.subscription_types[0]
      : subscription?.subscription_types;

    return {
      id: checkin.id,
      checked_in_at: checkin.checked_in_at,
      plan: subscriptionType?.name ?? null,
    };
  });
}

export async function getDashboardData(gymId: string): Promise<DashboardData> {
  const supabase = await createClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [members, checkinsResult, paymentsResult] = await Promise.all([
    getMembers(gymId),
    getTodayCheckins(gymId),
    supabase
      .from("payments")
      .select("amount")
      .eq("gym_id", gymId)
      .gte("paid_at", today.toISOString()),
  ]);

  if (paymentsResult.error) {
    throw new Error(paymentsResult.error.message);
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

  return {
    revenueToday,
    paymentsToday: paymentsResult.data?.length ?? 0,
    checkinsToday: checkinsResult,
    activeMembers,
    totalMembers: members.length,
    alerts: alerts.slice(0, 8),
  };
}
