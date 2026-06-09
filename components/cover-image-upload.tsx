"use client";

import { useMemo, useState, useTransition } from "react";
import { ImageIcon, Loader2, UploadCloud, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type CoverImageUploadProps = {
  gymId: string;
  inputName: string;
  initialUrl?: string | null;
};

function cleanFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function CoverImageUpload({ gymId, inputName, initialUrl }: CoverImageUploadProps) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const previewStyle = useMemo(
    () => (url ? { backgroundImage: `linear-gradient(180deg, rgba(23,23,23,0.08), rgba(23,23,23,0.36)), url('${url}')` } : undefined),
    [url],
  );

  function uploadCover(file: File) {
    setError("");

    if (!file.type.startsWith("image/")) {
      setError("Choisis une image valide.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image trop lourde. Maximum 5 Mo.");
      return;
    }

    startTransition(async () => {
      const supabase = createClient();
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = cleanFileName(file.name.replace(/\.[^.]+$/, "")) || "cover";
      const path = `${gymId}/${Date.now()}-${fileName}.${extension}`;

      const { error: uploadError } = await supabase.storage.from("gym-covers").upload(path, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false,
      });

      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      const { data } = supabase.storage.from("gym-covers").getPublicUrl(path);
      setUrl(data.publicUrl);
    });
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name={inputName} value={url} />
      <div
        className="flex min-h-40 items-end overflow-hidden rounded-md border border-line bg-paper bg-cover bg-center"
        style={previewStyle}
      >
        <div className="flex w-full items-center justify-between gap-3 bg-white/92 p-3 text-sm backdrop-blur">
          <span className="inline-flex min-w-0 items-center gap-2 font-semibold">
            <ImageIcon className="shrink-0 text-mint" size={17} />
            <span className="truncate">{url ? "Image de couverture ajoutee" : "Aucune image importee"}</span>
          </span>
          {url ? (
            <button
              type="button"
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-line bg-white hover:bg-paper"
              onClick={() => setUrl("")}
              aria-label="Retirer l'image"
            >
              <X size={16} />
            </button>
          ) : null}
        </div>
      </div>

      <label className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white transition hover:bg-neutral-800">
        {isPending ? <Loader2 className="animate-spin" size={17} /> : <UploadCloud size={17} />}
        {isPending ? "Import en cours..." : "Importer une photo"}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          disabled={isPending}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              uploadCover(file);
            }
            event.target.value = "";
          }}
        />
      </label>

      <p className="text-xs leading-5 text-neutral-500">Formats acceptes : JPG, PNG ou WebP. Taille maximum : 5 Mo.</p>
      {error ? <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-semibold text-danger">{error}</p> : null}
    </div>
  );
}
