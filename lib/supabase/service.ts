import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Client service-role pour les webhooks Stripe (bypass RLS)
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set");
  }

  return createSupabaseClient(url, key, {
    auth: { persistSession: false },
  });
}
