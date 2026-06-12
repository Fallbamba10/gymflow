/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef, useState, useTransition } from "react";
import { Camera, Loader2, User, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type MemberPhotoUploadProps = {
  memberId: string;
  initialUrl?: string | null;
  memberName: string;
};

function cleanFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function MemberPhotoUpload({ memberId, initialUrl, memberName }: MemberPhotoUploadProps) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function uploadPhoto(file: File) {
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
      const fileName = cleanFileName(file.name.replace(/\.[^.]+$/, "")) || "photo";
      const path = `members/${memberId}/${Date.now()}-${fileName}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("gym-covers")
        .upload(path, file, {
          cacheControl: "3600",
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      const { data } = supabase.storage.from("gym-covers").getPublicUrl(path);
      const newUrl = data.publicUrl;
      setUrl(newUrl);

      // Sauvegarder directement en DB
      const { error: updateError } = await supabase
        .from("members")
        .update({ photo_url: newUrl })
        .eq("id", memberId);

      if (updateError) {
        setError(updateError.message);
      }
    });
  }

  async function removePhoto() {
    setError("");
    startTransition(async () => {
      const supabase = createClient();
      await supabase.from("members").update({ photo_url: null }).eq("id", memberId);
      setUrl("");
    });
  }

  const initials = memberName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar */}
      <div className="relative">
        <div className="flex size-24 items-center justify-center overflow-hidden rounded-full border-2 border-line bg-paper">
          {url ? (
            <img src={url} alt={memberName} className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center bg-neutral-100">
              {initials ? (
                <span className="text-2xl font-semibold text-neutral-400">{initials}</span>
              ) : (
                <User className="text-neutral-300" size={32} />
              )}
            </div>
          )}
        </div>

        {/* Bouton caméra overlay */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isPending}
          className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full border-2 border-white bg-ink text-white transition hover:bg-neutral-800 disabled:opacity-50"
          aria-label="Changer la photo"
        >
          {isPending ? <Loader2 className="animate-spin" size={14} /> : <Camera size={14} />}
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isPending}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-line bg-white px-3 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50"
        >
          <Camera size={14} />
          {url ? "Changer" : "Ajouter une photo"}
        </button>

        {url && (
          <button
            type="button"
            onClick={removePhoto}
            disabled={isPending}
            className="inline-flex size-9 items-center justify-center rounded-md border border-line bg-white text-neutral-400 transition hover:bg-red-50 hover:text-danger disabled:opacity-50"
            aria-label="Supprimer la photo"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        disabled={isPending}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadPhoto(file);
          e.target.value = "";
        }}
      />

      {error && (
        <p className="text-center text-xs font-semibold text-danger">{error}</p>
      )}
    </div>
  );
}
