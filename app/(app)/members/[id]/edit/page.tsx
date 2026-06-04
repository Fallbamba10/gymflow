import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, UserPen } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { FormField } from "@/components/form-field";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { updateMember } from "@/app/(app)/members/actions";
import { getCurrentGym, getMemberDetail } from "@/lib/supabase/queries";

type EditMemberPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function EditMemberPage({
  params,
  searchParams,
}: EditMemberPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const gym = await getCurrentGym();
  if (!gym) {
    notFound();
  }

  const member = await getMemberDetail(gym.id, id);
  if (!member) {
    notFound();
  }

  return (
    <AppShell>
      <PageHeader
        title="Modifier membre"
        eyebrow={`Membre ${String(member.member_number).padStart(6, "0")}`}
        actions={
          <Link href={`/members/${member.id}`} className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-semibold shadow-sm">
            <ArrowLeft size={18} />
            Retour
          </Link>
        }
      />

      <div className="px-4 py-6 md:px-8">
        <form action={updateMember} className="max-w-3xl rounded-md border border-line bg-white p-5 shadow-soft">
          <input type="hidden" name="member_id" value={member.id} />

          <div className="flex items-center gap-3 border-b border-line pb-5">
            <div className="flex size-10 items-center justify-center rounded-md bg-paper text-ink">
              <UserPen size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Informations du membre</h2>
              <p className="mt-1 text-sm text-neutral-500">Modifie les donnees visibles sur la fiche.</p>
            </div>
          </div>

          {query.error ? (
            <div className="mt-5 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold text-danger">
              {query.error}
            </div>
          ) : null}

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <FormField label="Nom complet">
              <input
                name="full_name"
                className="h-11 w-full rounded-md border border-line bg-paper px-3 outline-none focus:border-mint"
                defaultValue={member.full_name}
                required
              />
            </FormField>
            <FormField label="Telephone">
              <input
                name="phone"
                className="h-11 w-full rounded-md border border-line bg-paper px-3 outline-none focus:border-mint"
                defaultValue={member.phone ?? ""}
              />
            </FormField>
          </div>

          <FormField label="Notes internes">
            <textarea
              name="notes"
              className="min-h-32 w-full rounded-md border border-line bg-paper p-3 outline-none focus:border-mint"
              defaultValue={member.notes ?? ""}
            />
          </FormField>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Link href={`/members/${member.id}`} className="inline-flex h-11 items-center justify-center rounded-md border border-line bg-white px-4 text-sm font-semibold">
              Annuler
            </Link>
            <Button type="submit" variant="accent" className="h-11">
              <CheckCircle2 size={18} />
              Enregistrer
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}

