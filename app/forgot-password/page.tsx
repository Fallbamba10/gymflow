import { AuthCard } from "@/components/auth-card";
import { EnvWarning } from "@/components/env-warning";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { ForgotPasswordForm } from "./forgot-password-form";

export default function ForgotPasswordPage() {
  const enabled = hasSupabaseEnv();

  return (
    <AuthCard title="Réinitialiser le mot de passe" subtitle="Nous t’enverrons un lien pour choisir un nouveau mot de passe.">
      {!enabled ? <EnvWarning /> : null}
      {enabled ? <ForgotPasswordForm /> : null}
    </AuthCard>
  );
}
