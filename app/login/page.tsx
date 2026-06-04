import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { EnvWarning } from "@/components/env-warning";
import { Button } from "@/components/ui/button";
import { signIn } from "@/app/auth/actions";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const enabled = hasSupabaseEnv();

  return (
    <AuthCard title="Connexion" subtitle="Accede a ton espace de gestion GymFlow.">
      {!enabled ? <EnvWarning /> : null}
      {params.error ? (
        <div className="mb-5 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold text-danger">
          {params.error}
        </div>
      ) : null}

      <form action={signIn} className="space-y-4">
        <input type="hidden" name="next" value={params.next ?? "/"} />
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
          Se connecter
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-neutral-500">
        Pas encore de compte ?{" "}
        <Link className="font-semibold text-mint" href="/signup">
          Creer un compte
        </Link>
      </p>
    </AuthCard>
  );
}

