"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { AlertTriangle, CheckCircle2, FileText, Loader2, Upload, X } from "lucide-react";
import { importMembers } from "@/app/(app)/members/import/actions";

type ParsedRow = {
  nom: string;
  telephone: string;
  notes: string;
  valid: boolean;
  error?: string;
};

type ImportResult = {
  inserted: number;
  skipped: number;
  errors: string[];
};

function parseCSV(text: string): ParsedRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

  // Détecte le séparateur (virgule ou point-virgule)
  const sep = lines[0].includes(";") ? ";" : ",";

  function splitLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === sep && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  }

  const headerRaw = splitLine(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9éèàùâêîôûëïü]/gi, "").trim());

  // Mapping flexible des colonnes
  const colMap: Record<string, number> = {};
  for (let i = 0; i < headerRaw.length; i++) {
    const h = headerRaw[i];
    if (/^(nom|name|fullname|prenom|membre)/.test(h)) colMap.nom = i;
    else if (/^(tel|phone|portable|mobile|contact)/.test(h)) colMap.telephone = i;
    else if (/^(note|notes|commentaire|info)/.test(h)) colMap.notes = i;
  }

  // Si pas d'en-tête reconnue, on essaie col 0=nom, col 1=tel
  const hasHeader = colMap.nom !== undefined || colMap.telephone !== undefined;
  const startLine = hasHeader ? 1 : 0;
  if (!hasHeader) {
    colMap.nom = 0;
    colMap.telephone = 1;
  }

  const rows: ParsedRow[] = [];
  for (let i = startLine; i < lines.length; i++) {
    const cols = splitLine(lines[i]);
    const nom = (colMap.nom !== undefined ? cols[colMap.nom] : "") ?? "";
    const telephone = (colMap.telephone !== undefined ? cols[colMap.telephone] : "") ?? "";
    const notes = (colMap.notes !== undefined ? cols[colMap.notes] : "") ?? "";

    const cleanNom = nom.replace(/^"|"$/g, "").trim();
    const cleanTel = telephone.replace(/^"|"$/g, "").trim();
    const cleanNotes = notes.replace(/^"|"$/g, "").trim();

    if (!cleanNom && !cleanTel) continue;

    const valid = cleanNom.length >= 2;
    rows.push({
      nom: cleanNom,
      telephone: cleanTel,
      notes: cleanNotes,
      valid,
      error: !valid ? "Nom trop court ou manquant" : undefined,
    });
  }

  return rows;
}

export function CsvImport() {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    setResult(null);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setRows(parseCSV(text));
    };
    reader.readAsText(file, "UTF-8");
  }

  function clearFile() {
    setRows([]);
    setFileName("");
    setResult(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function submit() {
    const valid = rows.filter((r) => r.valid);
    if (!valid.length) return;

    startTransition(async () => {
      const res = await importMembers(valid.map((r) => ({ nom: r.nom, telephone: r.telephone, notes: r.notes })));
      setResult(res);
      if (res.inserted > 0) {
        setRows([]);
        setFileName("");
      }
    });
  }

  const validCount = rows.filter((r) => r.valid).length;
  const invalidCount = rows.filter((r) => !r.valid).length;

  if (result) {
    return (
      <div className="rounded-md border border-emerald-200 bg-emerald-50 p-6 text-center">
        <CheckCircle2 className="mx-auto text-mint" size={36} />
        <h3 className="mt-4 text-xl font-semibold text-ink">Import terminé</h3>
        <p className="mt-2 text-sm text-neutral-600">
          <span className="font-semibold text-mint">{result.inserted} membre{result.inserted > 1 ? "s" : ""}</span> importé{result.inserted > 1 ? "s" : ""} avec succès.
          {result.skipped > 0 ? ` ${result.skipped} ignoré${result.skipped > 1 ? "s" : ""} (doublons).` : ""}
        </p>
        {result.errors.length > 0 && (
          <ul className="mt-3 space-y-1 text-left text-xs text-danger">
            {result.errors.slice(0, 5).map((e, i) => <li key={i}>• {e}</li>)}
          </ul>
        )}
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/members" className="inline-flex h-10 items-center gap-2 rounded-md bg-mint px-4 text-sm font-semibold text-white">
            <CheckCircle2 size={16} />
            Voir les membres
          </Link>
          <button onClick={() => setResult(null)} className="inline-flex h-10 items-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-semibold">
            Nouvel import
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Zone de dépôt */}
      {!fileName && (
        <label
          className="flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-line bg-paper p-10 text-center transition hover:border-mint hover:bg-emerald-50/30"
        >
          <div className="flex size-14 items-center justify-center rounded-xl bg-white border border-line shadow-soft">
            <Upload className="text-mint" size={26} />
          </div>
          <div>
            <p className="font-semibold text-ink">Dépose ton fichier CSV ici</p>
            <p className="mt-1 text-sm text-neutral-500">ou clique pour sélectionner</p>
          </div>
          <span className="rounded-md border border-line bg-white px-3 py-1.5 text-xs font-semibold text-neutral-600">
            .csv ou .txt — UTF-8 ou Excel
          </span>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.txt"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </label>
      )}

      {/* Fichier sélectionné + stats */}
      {fileName && rows.length > 0 && (
        <div className="rounded-md border border-line bg-white p-4 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-md bg-emerald-50 text-mint">
                <FileText size={20} />
              </div>
              <div>
                <p className="font-semibold text-sm">{fileName}</p>
                <p className="mt-0.5 text-xs text-neutral-500">
                  {validCount} valide{validCount > 1 ? "s" : ""}
                  {invalidCount > 0 ? ` · ${invalidCount} avec erreur` : ""}
                </p>
              </div>
            </div>
            <button onClick={clearFile} className="flex size-8 items-center justify-center rounded-md border border-line bg-white text-neutral-400 hover:text-danger transition" type="button">
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Tableau de preview */}
      {rows.length > 0 && (
        <div className="overflow-hidden rounded-md border border-line bg-white shadow-soft">
          <div className="border-b border-line bg-neutral-50 px-4 py-3">
            <p className="text-sm font-semibold">Aperçu — {rows.length} ligne{rows.length > 1 ? "s" : ""} détectée{rows.length > 1 ? "s" : ""}</p>
            <p className="mt-0.5 text-xs text-neutral-500">Seules les lignes valides seront importées.</p>
          </div>
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-line">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.05em] text-neutral-500">Nom</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.05em] text-neutral-500">Téléphone</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.05em] text-neutral-500">Notes</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.05em] text-neutral-500">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.slice(0, 100).map((row, i) => (
                  <tr key={i} className={row.valid ? "" : "bg-red-50"}>
                    <td className="px-4 py-3 font-medium">{row.nom || <span className="text-neutral-400 italic">vide</span>}</td>
                    <td className="px-4 py-3 text-neutral-600">{row.telephone || <span className="text-neutral-400">-</span>}</td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-neutral-600">{row.notes || <span className="text-neutral-400">-</span>}</td>
                    <td className="px-4 py-3">
                      {row.valid ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-mint">
                          <CheckCircle2 size={11} /> Valide
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-0.5 text-xs font-semibold text-danger">
                          <AlertTriangle size={11} /> {row.error}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 100 && (
              <p className="border-t border-line px-4 py-3 text-xs text-neutral-500">
                … et {rows.length - 100} autres lignes (toutes seront importées si valides).
              </p>
            )}
          </div>
        </div>
      )}

      {/* Bouton import */}
      {validCount > 0 && (
        <div className="flex items-center justify-between gap-4 rounded-md border border-emerald-200 bg-emerald-50 px-5 py-4">
          <div>
            <p className="font-semibold text-ink">
              {validCount} membre{validCount > 1 ? "s" : ""} prêt{validCount > 1 ? "s" : ""} à importer
            </p>
            {invalidCount > 0 && (
              <p className="mt-0.5 text-xs text-neutral-500 flex items-center gap-1">
                <AlertTriangle size={12} className="text-amber" />
                {invalidCount} ligne{invalidCount > 1 ? "s" : ""} ignorée{invalidCount > 1 ? "s" : ""} (erreur)
              </p>
            )}
          </div>
          <button
            onClick={submit}
            disabled={isPending}
            type="button"
            className="inline-flex h-11 items-center gap-2 rounded-md bg-mint px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {isPending ? <Loader2 size={17} className="animate-spin" /> : <Upload size={17} />}
            {isPending ? "Import en cours..." : "Importer maintenant"}
          </button>
        </div>
      )}

      {rows.length === 0 && fileName && (
        <div className="rounded-md border border-amber/30 bg-amber/10 p-4 text-sm text-amber">
          <p className="font-semibold flex items-center gap-2"><AlertTriangle size={16} /> Fichier vide ou non reconnu</p>
          <p className="mt-1">Vérifie que le fichier contient des colonnes <code>nom</code> et <code>telephone</code>.</p>
        </div>
      )}
    </div>
  );
}
