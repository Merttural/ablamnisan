"use client";

import { useState } from "react";

export function AlbumPhotoSave({
  href,
  viewUrl,
  fileName,
  label,
}: {
  href: string;
  viewUrl: string | null;
  fileName: string;
  label: string;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [holdSave, setHoldSave] = useState(false);

  async function save() {
    setPending(true);
    setError("");
    try {
      const response = await fetch(href);
      const contentType = response.headers.get("content-type") ?? "";
      if (!response.ok || contentType.startsWith("text/html")) {
        throw new Error("download");
      }
      const blob = await response.blob();
      const type = contentType.startsWith("image/") ? contentType : blob.type || "image/jpeg";
      const file = new File([blob], safeFileName(fileName), { type });
      if (isAppleTouch() && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file] });
          return;
        } catch (reason) {
          if (reason instanceof DOMException && reason.name === "AbortError") {
            return;
          }
          if (viewUrl) {
            setHoldSave(true);
            return;
          }
          throw reason;
        }
      }
      downloadBlob(file);
    } catch {
      setError("Galeriye kaydedilemedi.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <span className="inline-flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void save()}
          disabled={pending}
          className="inline-flex min-h-11 items-center text-base text-charcoal underline decoration-charcoal/30 underline-offset-4 disabled:opacity-50"
        >
          {pending ? "Kaydediliyor" : label}
        </button>
        {error ? <span className="text-sm text-charcoal">{error}</span> : null}
      </span>
      {holdSave && viewUrl ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-ivory px-5 py-8">
          <button
            type="button"
            onClick={() => setHoldSave(false)}
            className="min-h-11 self-end text-base text-charcoal"
          >
            Kapat
          </button>
          <p className="mt-6 max-w-md font-serif text-3xl leading-tight text-charcoal">
            Parmağını fotoğrafın üzerinde tut, ardından Galeriye Kaydet&apos;e dokun.
          </p>
          {/* The original file is already on screen. Long-press saves that file, without a new encode. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={viewUrl} alt="" className="mt-6 max-h-[70vh] w-full object-contain" />
        </div>
      ) : null}
    </>
  );
}

function isAppleTouch(): boolean {
  const agent = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(agent)) {
    return true;
  }
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}

function safeFileName(fileName: string): string {
  const base = fileName.split(/[/\\]/).pop()?.replace(/[^\w.\- ]+/g, "_").trim() || "fotograf.jpg";
  return base.slice(0, 160);
}

function downloadBlob(file: File) {
  const href = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = href;
  link.download = file.name;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(href), 1000);
}
