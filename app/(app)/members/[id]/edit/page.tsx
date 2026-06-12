import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, UserPen } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { FormField } from "@/components/form-field";
import { MemberPhotoUpload } from "@/components/member-photo-upload";
import { PageHeader } from "@/components/page-header";
import { SubmitButton } from "@/components/submit-button";
import { updateMember } from "@/app/(app)/members/actions";
import { requireAdminGym } from "@/lib/supabase/guards";
import { getMemberDetail } from "@/lib/supabase/queries";

type EditMemberPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditMemberPage({ params }: EditMemberPageProps) {
  const { id } = await params;
  const gym = await requireAdminGym();

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

      <div className="grid gap-6 px-4 py-6 md:px-8 xl:grid-cols-[1fr_280px]">
        <form action={updateMember} className="rounded-md border border-line bg-white p-5 shadow-soft">
          <input type="hidden" name="member_id" value={member.id} />

          <div className="flex items-center gap-3 border-b border-line pb-5">
            <div className="flex size-10 items-center justify-center rounded-md bg-paper text-ink">
              <UserPen size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Informations du membre</h2>
              <p className="mt-1 text-sm text-neutral-500">Modifie les données visibles sur la fiche.</p>
            </div>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <FormField label="Nom complet">
              <input
                name="full_name"
                className="h-11 w-full rounded-md border border-line bg-paper px-3 outline-none focus:border-mint"
                defaultValue={member.full_name}
                required
              />
            </FormField>
            <FormField label="Téléphone">
              <input
                name="phone"
                className="h-11 w-full rounded-md border border-line bg-paper px-3 outline-none focus:border-mint"
                defaultValue={member.phone ?? ""}
                placeholder="+221 77 123 45 67"
              />
            </FormField>
          </div>

          <FormField label="Notes internes">
            <textarea
              name="notes"
              className="min-h-32 w-full rounded-md border border-line bg-paper p-3 outline-none focus:border-mint"
              defaultValue={member.notes ?? ""}
              placeholder="Préférences, informations importantes..."
            />
          </FormField>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Link href={`/members/${member.id}`} className="inline-flex h-11 items-center justify-center rounded-md border border-line bg-white px-4 text-sm font-semibold">
              Annuler
            </Link>
            <SubmitButton type="submit" variant="accent" className="h-11" pendingLabel="Enregistrement...">
              <CheckCircle2 size={18} />
              Enregistrer
            </SubmitButton>
          </div>
        </form>

        {/* Photo membre — mise à jour directe sans rechargement */}
        <div className="rounded-md border border-line bg-white p-5 shadow-soft">
          <h2 className="text-base font-semibold">Photo du membre</h2>
          <p className="mt-1 text-sm text-neutral-500">Visible sur la fiche. JPG, PNG ou WebP, max 5 Mo.</p>
          <div className="mt-6">
            <MemberPhotoUpload
              memberId={member.id}
              memberName={member.full_name}
              initialUrl={member.photo_url}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
