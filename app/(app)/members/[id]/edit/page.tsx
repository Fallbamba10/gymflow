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

const inputCls =
  "h-11 w-full rounded-xl border border-white/10 bg-white/6 px-3.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-emerald-500/60 focus:bg-white/8";

export default async function EditMemberPage({ params }: EditMemberPageProps) {
  const { id } = await params;
  const gym = await requireAdminGym();
  const member = await getMemberDetail(gym.id, id);
  if (!member) notFound();

  return (
    <AppShell>
      <PageHeader
        title="Modifier membre"
        eyebrow={`Membre ${String(member.member_number).padStart(6, "0")}`}
        actions={
          <Link
            href={`/members/${member.id}`}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white/60 transition hover:bg-white/8 hover:text-white"
          >
            <ArrowLeft size={16} />
            Retour
          </Link>
        }
      />

      <div className="grid gap-4 px-6 py-6 md:px-8 xl:grid-cols-[1fr_280px]">
        <form action={updateMember} className="overflow-hidden rounded-2xl border border-white/8 bg-white/4">
          <input type="hidden" name="member_id" value={member.id} />
          <div className="flex items-center gap-3 border-b border-white/8 px-6 py-5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
              <UserPen size={16} />
            </div>
            <div>
              <h2 className="font-semibold">Informations du membre</h2>
              <p className="mt-0.5 text-xs text-white/40">Modifie les données visibles sur la fiche.</p>
            </div>
          </div>

          <div className="px-6 py-6">
            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="Nom complet">
                <input
                  name="full_name"
                  className={inputCls}
                  defaultValue={member.full_name}
                  required
                />
              </FormField>
              <FormField label="Téléphone">
                <input
                  name="phone"
                  className={inputCls}
                  defaultValue={member.phone ?? ""}
                  placeholder="+221 77 123 45 67"
                />
              </FormField>
            </div>

            <div className="mt-5">
              <FormField label="Notes internes">
                <textarea
                  name="notes"
                  className="min-h-28 w-full rounded-xl border border-white/10 bg-white/6 p-3.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-emerald-500/60 focus:bg-white/8"
                  defaultValue={member.notes ?? ""}
                  placeholder="Préférences, informations importantes…"
                />
              </FormField>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Link
                href={`/members/${member.id}`}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white/60 transition hover:bg-white/8 hover:text-white"
              >
                Annuler
              </Link>
              <SubmitButton
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 text-sm font-semibold text-white hover:bg-emerald-400"
                pendingLabel="Enregistrement…"
              >
                <CheckCircle2 size={15} />
                Enregistrer
              </SubmitButton>
            </div>
          </div>
        </form>

        <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/4 xl:self-start">
          <div className="border-b border-white/8 px-5 py-4">
            <h2 className="font-semibold">Photo du membre</h2>
            <p className="mt-0.5 text-xs text-white/40">JPG, PNG ou WebP · max 5 Mo</p>
          </div>
          <div className="p-5">
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
