import type { MemoryKindId } from "@/lib/memory-kinds";

/**
 * Metadata for a guest's original file.
 * The File bytes stay untouched: previews use a separate object URL
 * and never replace, recompress, or re-encode the original.
 */
export type OriginalFileRecord = {
  localId: string;
  fileName: string;
  mimeType: string;
  byteSize: number;
};

export type MemoryDraft = {
  kind: MemoryKindId;
  guestName: string;
  message: string;
  originals: OriginalFileRecord[];
};

/**
 * Original file stored as-is on a private Cloudflare R2 bucket.
 * `objectKey` is the private locator. It is not a public URL.
 */
export type StoredOriginal = OriginalFileRecord & {
  provider: "cloudflare-r2";
  objectKey: string;
  downloadPath: string;
};

export type DeliveryReceipt = {
  id: string;
  stored: StoredOriginal[];
};

export function describeOriginal(file: File, localId: string): OriginalFileRecord {
  return {
    localId,
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    byteSize: file.size,
  };
}

export function buildMemoryDraft(input: {
  kind: MemoryKindId;
  guestName: string;
  message: string;
  files: Array<{ id: string; file: File }>;
}): MemoryDraft {
  return {
    kind: input.kind,
    guestName: input.guestName.trim(),
    message: input.message.trim(),
    originals: input.files.map((item) => describeOriginal(item.file, item.id)),
  };
}
