import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { createClient } from "@/lib/supabase/server";
import { UpdatePasswordForm } from "./update-password-form";

export default async function UpdatePasswordPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <AuthCard title="Choisir un nouveau mot de passe" subtitle="Utilise au moins 8 caractères.">
      {user ? (
        <UpdatePasswordForm />
      ) : (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-danger">
          Le lien de réinitialisation est invalide ou a expiré. Demande un nouveau lien depuis la page de connexion.
          <Link href="/forgot-password" className="mt-3 block font-semibold underline">Recevoir un nouveau lien</Link>
        </div>
      )}
    </AuthCard>
  );
}
