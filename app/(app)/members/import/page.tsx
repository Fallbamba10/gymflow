import Link from "next/link";
import { ArrowLeft, Download, FileSpreadsheet } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { CsvImport } from "@/components/csv-import";
import { PageHeader } from "@/components/page-header";
import { requireAdminGym } from "@/lib/supabase/guards";

export default async function MembersImportPage() {
  await requireAdminGym();

  return (
    <AppShell>
      <PageHeader
        title="Importer des membres"
        eyebrow="Import CSV"
        actions={
          <Link href="/members" className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-semibold shadow-sm transition hover:bg-neutral-50">
            <ArrowLeft size={18} />
            Retour
          </Link>
        }
      />

      <div className="grid gap-6 px-4 py-6 md:px-8 xl:grid-cols-[1fr_340px]">
        {/* Zone principale */}
        <section className="rounded-md border border-line bg-white p-6 shadow-soft">
          <div className="flex items-center gap-3 border-b border-line pb-5">
            <div className="flex size-10 items-center justify-center rounded-md bg-paper text-ink">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Fichier CSV</h2>
              <p className="mt-1 text-sm text-neutral-500">Sélectionne ou dépose ton fichier pour démarrer.</p>
            </div>
          </div>
          <div className="mt-6">
            <CsvImport />
          </div>
        </section>

        {/* Panneau d'aide */}
        <aside className="space-y-4">
          <div className="rounded-md border border-line bg-white p-5 shadow-soft">
            <h2 className="font-semibold">Format attendu</h2>
            <p className="mt-2 text-sm text-neutral-500">Ton fichier doit avoir une ligne d&apos;en-tête et ces colonnes :</p>
            <div className="mt-4 overflow-hidden rounded-md border border-line">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-line bg-neutral-50">
                    <th className="px-3 py-2 text-left font-semibold text-neutral-600">Colonne</th>
                    <th className="px-3 py-2 text-left font-semibold text-neutral-600">Requis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  <tr>
                    <td className="px-3 py-2 font-mono font-semibold">nom</td>
                    <td className="px-3 py-2 text-mint font-semibold">Oui</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-mono font-semibold">telephone</td>
                    <td className="px-3 py-2 text-neutral-400">Non</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-mono font-semibold">notes</td>
                    <td className="px-3 py-2 text-neutral-400">Non</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-neutral-500">
              Les colonnes <strong>nom</strong>, <strong>name</strong>, <strong>prenom</strong>, <strong>tel</strong>, <strong>phone</strong>, <strong>portable</strong> sont toutes reconnues automatiquement.
            </p>
          </div>

          <div className="rounded-md border border-line bg-white p-5 shadow-soft">
            <h2 className="font-semibold">Exemple de fichier</h2>
            <pre className="mt-3 overflow-x-auto rounded-md bg-neutral-50 p-3 text-xs leading-5 text-neutral-700">
{`nom,telephone,notes
Moussa Diallo,+221771234567,Coach sportif
Fatou Ndiaye,+221770000001,
Ousmane Ba,,Abonnement famille`}
            </pre>
            <a
              href="data:text/csv;charset=utf-8,%EF%BB%BFnom%2Ctelephone%2Cnotes%0AMoussa+Diallo%2C%2B221771234567%2CCoach+sportif%0AFatou+Ndiaye%2C%2B221770000001%2C%0AOusmane+Ba%2C%2CAbonnement+famille"
              download="gymflow-import-exemple.csv"
              className="mt-3 inline-flex h-9 items-center gap-2 rounded-md border border-line bg-white px-3 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50"
            >
              <Download size={14} />
              Télécharger l&apos;exemple
            </a>
          </div>

          <div className="rounded-md border border-amber/30 bg-amber/10 p-4 text-sm">
            <p className="font-semibold text-amber">Important</p>
            <ul className="mt-2 space-y-1.5 text-xs text-neutral-600">
              <li>• Les membres importés n&apos;ont <strong>pas d&apos;abonnement</strong> — à assigner depuis la fiche.</li>
              <li>• Les doublons (même numéro ou même nom exact) sont ignorés automatiquement.</li>
              <li>• Maximum 5 000 lignes par fichier recommandé.</li>
            </ul>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
