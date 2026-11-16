"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AlbumDeleteButton({
  memoryId,
  objectKey,
  label,
  confirmLabel,
}: {
  memoryId: string;
  objectKey?: string;
  label: string;
  confirmLabel: string;
}) {
  const router = useRouter();
  const [armed, setArmed] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    setPending(true);
    setError("");
    const body = new FormData();
    body.set("id", memoryId);
    if (objectKey) {
      body.set("anahtar", objectKey);
    } else {
      body.set("hepsi", "1");
    }
    const response = await fetch("/api/album/sil", { method: "POST", body }).catch(() => null);
    if (!response?.ok) {
      setPending(false);
      setError("Silinemedi. Dosya duruyor.");
      return;
    }
    setArmed(false);
    setPending(false);
    router.refresh();
  }

  if (!armed) {
    return (
      <span className="inline-flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            setError("");
            setArmed(true);
          }}
          className="inline-flex min-h-11 items-center text-base text-taupe underline decoration-charcoal/20 underline-offset-4"
        >
          {label}
        </button>
        {error ? <span className="text-sm text-charcoal">{error}</span> : null}
      </span>
    );
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-x-4 gap-y-1">
      <button
        type="button"
        onClick={() => void remove()}
        disabled={pending}
        className="inline-flex min-h-11 items-center text-base text-charcoal underline decoration-charcoal/30 underline-offset-4 disabled:opacity-50"
      >
        {pending ? "Siliniyor" : confirmLabel}
      </button>
      <button
        type="button"
        onClick={() => setArmed(false)}
        disabled={pending}
        className="inline-flex min-h-11 items-center text-base text-taupe disabled:opacity-50"
      >
        Vazgeç
      </button>
      {error ? <span className="text-sm text-charcoal">{error}</span> : null}
    </span>
  );
}
