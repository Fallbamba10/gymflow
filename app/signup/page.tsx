import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { EnvWarning } from "@/components/env-warning";
import { Button } from "@/components/ui/button";
import { signUp } from "@/app/auth/actions";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type SignupPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;
  const enabled = hasSupabaseEnv();

  return (
    <AuthCard title="Creer un compte" subtitle="Configure ton espace salle en quelques minutes.">
      {!enabled ? <EnvWarning /> : null}
      {params.error ? (
        <div className="mb-5 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold text-danger">
          {params.error}
        </div>
      ) : null}

      <form action={signUp} className="space-y-4">
        <label className="block">
          <span className="text-sm font-semibold text-neutral-700">Nom complet</span>
          <input
            className="mt-2 h-11 w-full rounded-md border border-line bg-paper px-3 outline-none focus:border-mint"
            name="full_name"
            placeholder="Bamba Fall"
            required
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-neutral-700">Email</span>
          <input
            className="mt-2 h-11 w-full rounded-md border border-line bg-paper px-3 outline-none focus:border-mint"
            name="email"
            type="email"
            placeholder="gerant@gymflow.sn"
            required
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-neutral-700">Mot de passe</span>
          <input
            className="mt-2 h-11 w-full rounded-md border border-line bg-paper px-3 outline-none focus:border-mint"
            name="password"
            type="password"
            minLength={6}
            required
          />
        </label>
        <Button className="h-11 w-full" disabled={!enabled}>
          Creer le compte
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-neutral-500">
        Deja inscrit ?{" "}
        <Link className="font-semibold text-mint" href="/login">
          Se connecter
        </Link>
      </p>
    </AuthCard>
  );
}

