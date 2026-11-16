"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AlbumDeleteButton({
  memoryId,
  objectKey,
  label,
  confirmLabel,
  onPhoto = false,
}: {
  memoryId: string;
  objectKey?: string;
  label: string;
  confirmLabel: string;
  onPhoto?: boolean;
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

  const buttonClass = onPhoto
    ? "inline-flex min-h-11 items-center bg-ivory px-3 text-base text-charcoal shadow-sm disabled:opacity-50"
    : "inline-flex min-h-11 items-center border border-charcoal/20 bg-ivory px-4 text-base text-charcoal disabled:opacity-50";

  if (!armed) {
    return (
      <span className="inline-flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            setError("");
            setArmed(true);
          }}
          className={buttonClass}
        >
          {label}
        </button>
        {error ? <span className="text-sm text-charcoal">{error}</span> : null}
      </span>
    );
  }

  return (
    <span className={`inline-flex flex-wrap items-center gap-2 ${onPhoto ? "bg-ivory p-1" : ""}`}>
      <button type="button" onClick={() => void remove()} disabled={pending} className={buttonClass}>
        {pending ? "Siliniyor" : confirmLabel}
      </button>
      <button type="button" onClick={() => setArmed(false)} disabled={pending} className={buttonClass}>
        Vazgeç
      </button>
      {error ? <span className="text-sm text-charcoal">{error}</span> : null}
    </span>
  );
}
