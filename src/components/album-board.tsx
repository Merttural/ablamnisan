import { AlbumDeleteButton } from "@/components/album-delete-button";
import { AlbumPhotoSave } from "@/components/album-photo-save";
import { formatFileSize, getMemoryKind } from "@/lib/memory-kinds";
import type { AlbumFile, AlbumMemory } from "@/lib/album-library";

const dateFormat = new Intl.DateTimeFormat("tr-TR", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Europe/Istanbul",
});

export function AlbumBoard({ memories }: { memories: AlbumMemory[] }) {
  if (memories.length === 0) {
    return <p className="mt-10 text-base leading-7 text-taupe">Henüz bir anı gelmedi.</p>;
  }

  return (
    <ul className="mt-10 grid gap-14">
      {memories.map((memory) => (
        <li key={memory.id} className="min-w-0 border-t border-charcoal/10 pt-8">
          <p className="text-base text-taupe">{dateFormat.format(new Date(memory.createdAt))}</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
            <h2 className="font-serif text-4xl leading-none font-medium text-charcoal">
              {memory.guestName || "Bir misafir"}
            </h2>
            <AlbumDeleteButton memoryId={memory.id} label="Anıyı sil" confirmLabel="Evet, anıyı sil" />
          </div>
          <p className="mt-3 text-base text-charcoal">{getMemoryKind(memory.kind).title}</p>
          {memory.message ? (
            <blockquote className="mt-6 border-l border-gold pl-5 font-serif text-2xl leading-snug text-charcoal">
              {memory.message}
            </blockquote>
          ) : null}
          {memory.files.length > 0 ? (
            <ul
              className={`mt-6 grid gap-4 ${memory.kind === "fotograf" ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-1"}`}
            >
              {memory.files.map((file) => (
                <li key={file.objectKey} className="min-w-0">
                  <div className="relative">
                    <FileView file={file} kind={memory.kind} />
                    <div className="absolute top-2 right-2 z-10">
                      <AlbumDeleteButton
                        memoryId={memory.id}
                        objectKey={file.objectKey}
                        label="Sil"
                        confirmLabel="Evet, sil"
                        onPhoto
                      />
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-x-5">
                    {memory.kind === "fotograf" ? (
                      <AlbumPhotoSave
                        href={downloadHref(file)}
                        viewUrl={file.viewUrl}
                        fileName={file.fileName}
                        label={`Galeriye kaydet · ${formatFileSize(file.byteSize)}`}
                      />
                    ) : (
                      <a
                        href={downloadHref(file)}
                        className="inline-flex min-h-11 items-center text-base text-charcoal underline decoration-charcoal/30 underline-offset-4"
                      >
                        İndir · {formatFileSize(file.byteSize)}
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function FileView({ file, kind }: { file: AlbumFile; kind: AlbumMemory["kind"] }) {
  if (!file.viewUrl) {
    return <p className="text-base text-taupe">{file.fileName}</p>;
  }
  if (kind === "fotograf" && canPreviewPhoto(file)) {
    return (
      // Guest originals stay on R2. This preview must not pass through the image optimizer.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={file.viewUrl}
        alt={file.fileName}
        className="aspect-square w-full bg-champagne/40 object-cover"
      />
    );
  }
  if (kind === "video") {
    return (
      <video
        controls
        playsInline
        preload="metadata"
        src={file.viewUrl}
        className="max-h-[70vh] w-full bg-charcoal"
      />
    );
  }
  if (kind === "ses") {
    if (file.byteSize < 1024) {
      return <p className="text-base text-taupe">Bu kayıt boş kalmış. Yeniden kaydetmek gerekir.</p>;
    }
    return <audio controls preload="auto" src={file.viewUrl} className="w-full" />;
  }
  return <p className="truncate text-base text-taupe">{file.fileName}</p>;
}

function canPreviewPhoto(file: AlbumFile): boolean {
  const name = file.fileName.toLowerCase();
  return (
    file.mimeType === "image/jpeg" ||
    file.mimeType === "image/png" ||
    file.mimeType === "image/webp" ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".png") ||
    name.endsWith(".webp")
  );
}

function downloadHref(file: AlbumFile): string {
  const params = new URLSearchParams({ anahtar: file.objectKey, ad: file.fileName });
  return `/api/album/indir?${params.toString()}`;
}
