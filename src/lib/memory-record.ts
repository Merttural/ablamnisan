import {
  getMemoryKind,
  isMediaKind,
  isMemoryKindId,
  maxGuestName,
  maxPhotoCount,
  validateMediaMeta,
  type MediaKind,
  type MemoryKindId,
} from "@/lib/memory-kinds";

export type IncomingFile = {
  localId: string;
  fileName: string;
  mimeType: string;
  byteSize: number;
};

export type MemorySubmission = {
  kind: MemoryKindId;
  guestName: string;
  message: string;
  files: IncomingFile[];
};

export type PreparedUpload = {
  localId: string;
  objectKey: string;
  contentType: string;
  byteSize: number;
  fileName: string;
  mimeType: string;
};

const localIdPattern = /^[A-Za-z0-9-]{8,80}$/;

export function parseSubmission(
  input: unknown,
): { ok: true; value: MemorySubmission } | { ok: false; error: string } {
  if (!input || typeof input !== "object") {
    return { ok: false, error: "Gönderim okunamadı." };
  }
  const body = input as Record<string, unknown>;
  if (typeof body.kind !== "string" || !isMemoryKindId(body.kind)) {
    return { ok: false, error: "Anı türü uygun değil." };
  }
  if (typeof body.guestName !== "string" || typeof body.message !== "string") {
    return { ok: false, error: "Gönderim okunamadı." };
  }
  if (!Array.isArray(body.files)) {
    return { ok: false, error: "Gönderim okunamadı." };
  }

  const guestName = body.guestName.trim();
  const message = body.message.trim();
  if (guestName.length === 0) {
    return { ok: false, error: "Önce adını yaz." };
  }
  if (guestName.length > maxGuestName) {
    return { ok: false, error: "Ad çok uzun." };
  }

  const kind = getMemoryKind(body.kind);
  if (!isMediaKind(kind)) {
    if (message.length === 0) {
      return { ok: false, error: "Önce bir mesaj yaz." };
    }
    if (message.length > kind.maxMessage) {
      return { ok: false, error: "Mesaj çok uzun." };
    }
    if (body.files.length > 0) {
      return { ok: false, error: "Yazılı mesaja dosya eklenmez." };
    }
    return { ok: true, value: { kind: body.kind, guestName, message, files: [] } };
  }

  if (message.length > 600) {
    return { ok: false, error: "Not çok uzun." };
  }

  const files: IncomingFile[] = [];
  const seen = new Set<string>();
  for (const item of body.files) {
    const file = readFile(item);
    if (!file) {
      return { ok: false, error: "Dosya bilgisi eksik." };
    }
    if (seen.has(file.localId)) {
      return { ok: false, error: "Aynı dosya iki kez seçilmiş." };
    }
    seen.add(file.localId);
    const problem = validateMediaMeta(file, kind);
    if (problem) {
      return { ok: false, error: problem };
    }
    files.push(file);
  }

  if (kind.id === "fotograf") {
    if (files.length === 0) {
      return { ok: false, error: "Önce bir fotoğraf ekle." };
    }
    if (files.length > maxPhotoCount) {
      return { ok: false, error: `En fazla ${maxPhotoCount} fotoğraf ekleyebilirsin.` };
    }
  } else if (files.length !== 1) {
    return { ok: false, error: "Önce bir dosya seç." };
  }

  return { ok: true, value: { kind: body.kind, guestName, message, files } };
}

export function planUploads(memoryId: string, submission: MemorySubmission): PreparedUpload[] {
  const kind = getMemoryKind(submission.kind);
  if (!isMediaKind(kind)) {
    return [];
  }
  return submission.files.map((file, index) => {
    const extension = extensionFor(file, kind);
    return {
      localId: file.localId,
      objectKey: `orijinaller/${memoryId}/${String(index).padStart(3, "0")}${extension}`,
      contentType: kind.accept.includes(file.mimeType) ? file.mimeType : "application/octet-stream",
      byteSize: file.byteSize,
      fileName: file.fileName,
      mimeType: file.mimeType || "application/octet-stream",
    };
  });
}

export function recordKey(memoryId: string): string {
  return `kayitlar/${memoryId}.json`;
}

export function isMemoryId(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function readFile(input: unknown): IncomingFile | null {
  if (!input || typeof input !== "object") {
    return null;
  }
  const file = input as Record<string, unknown>;
  if (typeof file.localId !== "string" || !localIdPattern.test(file.localId)) {
    return null;
  }
  if (typeof file.fileName !== "string" || typeof file.mimeType !== "string") {
    return null;
  }
  if (typeof file.byteSize !== "number" || !Number.isInteger(file.byteSize)) {
    return null;
  }
  const fileName = file.fileName.split("\\").join("/").split("/").pop()?.trim() ?? "";
  if (fileName.length === 0 || fileName.length > 180) {
    return null;
  }
  if (file.mimeType.length > 120) {
    return null;
  }
  return {
    localId: file.localId,
    fileName,
    mimeType: file.mimeType,
    byteSize: file.byteSize,
  };
}

function extensionFor(file: IncomingFile, kind: MediaKind): string {
  const extension = file.fileName.slice(file.fileName.lastIndexOf(".")).toLowerCase();
  if (kind.extensions.includes(extension)) {
    return extension;
  }
  return kind.extensions[0];
}
