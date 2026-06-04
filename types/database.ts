export type GymRole = "admin" | "operator";
export type SubscriptionStatus = "active" | "expired" | "cancelled";
export type PaymentMethod = "cash" | "wave" | "orange_money" | "card" | "other";

export type Gym = {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  currency: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
};

export type Member = {
  id: string;
  gym_id: string;
  member_number: number;
  full_name: string;
  phone: string | null;
  photo_url: string | null;
  notes: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SubscriptionType = {
  id: string;
  gym_id: string;
  name: string;
  duration_days: number;
  sessions: number | null;
  price: number;
  active: boolean;
  created_at: string;
};

