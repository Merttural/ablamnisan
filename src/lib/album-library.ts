import { GetObjectCommand, ListObjectsV2Command, type S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { isMemoryKindId, type MemoryKindId } from "@/lib/memory-kinds";
import { isMemoryId, recordKey } from "@/lib/memory-record";
import { deleteStoredObjects, openR2, writeMemoryRecord } from "@/lib/r2";

export type AlbumFile = {
  objectKey: string;
  fileName: string;
  mimeType: string;
  byteSize: number;
  viewUrl: string | null;
};

export type AlbumMemory = {
  id: string;
  kind: MemoryKindId;
  guestName: string;
  message: string;
  createdAt: string;
  files: AlbumFile[];
};

const originalKey =
  /^orijinaller\/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\/\d{3}\.(jpg|jpeg|png|webp|heic|heif|mp4|mov|webm|mp3|m4a|wav)$/i;

export function isOriginalObjectKey(value: string): boolean {
  return originalKey.test(value);
}

export async function listAlbumMemories(): Promise<AlbumMemory[] | null> {
  const r2 = openR2();
  if (!r2) {
    return null;
  }

  const keys: string[] = [];
  let token: string | undefined;
  do {
    const page = await r2.client.send(
      new ListObjectsV2Command({
        Bucket: r2.bucket,
        Prefix: "kayitlar/",
        ContinuationToken: token,
      }),
    );
    for (const item of page.Contents ?? []) {
      if (item.Key?.endsWith(".json")) {
        keys.push(item.Key);
      }
    }
    token = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (token && keys.length < 300);

  const memories: AlbumMemory[] = [];
  for (const key of keys.slice(0, 300)) {
    const memory = await readRecord(r2, key);
    if (memory) {
      memories.push(memory);
    }
  }
  memories.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  return memories;
}

export async function removeAlbumStorage(input: {
  memoryId: string;
  objectKey?: string;
  all: boolean;
}): Promise<"removed" | "missing" | "failed"> {
  if (!isMemoryId(input.memoryId)) {
    return "missing";
  }
  const r2 = openR2();
  if (!r2) {
    return "failed";
  }
  const stored = await readStoredRecord(r2, recordKey(input.memoryId));
  if (!stored) {
    return "missing";
  }

  const validKeys = stored.files.flatMap((file) => {
    const objectKey = file.objectKey;
    return typeof objectKey === "string" && keyBelongsToMemory(input.memoryId, objectKey) ? [objectKey] : [];
  });
  const hasInvalidFile = stored.files.length !== validKeys.length;
  const targets = input.all ? validKeys : input.objectKey ? [input.objectKey] : [];
  if (!input.all && (targets.length !== 1 || !validKeys.includes(targets[0] ?? ""))) {
    return "missing";
  }

  const gone = new Set(await deleteStoredObjects(targets));
  const remaining = stored.files.filter((file) => {
    const objectKey = file.objectKey;
    return typeof objectKey !== "string" || !gone.has(objectKey);
  });
  const everyTargetGone = targets.every((key) => gone.has(key));
  const message = typeof stored.raw.message === "string" ? stored.raw.message.trim() : "";
  const dropRecord =
    everyTargetGone && !hasInvalidFile && (input.all || (remaining.length === 0 && message.length === 0));

  if (dropRecord) {
    const recordGone = await deleteStoredObjects([recordKey(input.memoryId)]);
    return recordGone.length === 1 ? "removed" : "failed";
  }

  const written = await writeMemoryRecord(recordKey(input.memoryId), {
    ...stored.raw,
    files: remaining,
  });
  if (!written || !everyTargetGone || hasInvalidFile) {
    return "failed";
  }
  return "removed";
}

function keyBelongsToMemory(memoryId: string, objectKey: string): boolean {
  return (
    isOriginalObjectKey(objectKey) &&
    objectKey.toLowerCase().startsWith(`orijinaller/${memoryId.toLowerCase()}/`)
  );
}

export async function signOriginalDownload(objectKey: string, fileName: string): Promise<string | null> {
  if (!isOriginalObjectKey(objectKey)) {
    return null;
  }
  const r2 = openR2();
  if (!r2) {
    return null;
  }
  const command = new GetObjectCommand({
    Bucket: r2.bucket,
    Key: objectKey,
    ResponseContentDisposition: attachmentName(fileName),
  });
  return getSignedUrl(r2.client, command, { expiresIn: 10 * 60 });
}

type OpenBucket = { client: S3Client; bucket: string };

type StoredRecord = {
  raw: Record<string, unknown>;
  files: Record<string, unknown>[];
};

async function readStoredRecord(r2: OpenBucket, key: string): Promise<StoredRecord | null> {
  try {
    const object = await r2.client.send(new GetObjectCommand({ Bucket: r2.bucket, Key: key }));
    const text = await object.Body?.transformToString();
    if (!text) {
      return null;
    }
    const body: unknown = JSON.parse(text);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return null;
    }
    const raw = body as Record<string, unknown>;
    const memoryId = key.slice("kayitlar/".length, -".json".length);
    if (typeof raw.id !== "string" || raw.id.toLowerCase() !== memoryId.toLowerCase()) {
      return null;
    }
    const files = Array.isArray(raw.files)
      ? raw.files.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
      : [];
    return { raw, files };
  } catch (error) {
    console.error("R2 record read failed", error instanceof Error ? error.name : "unknown");
    return null;
  }
}

async function readRecord(r2: OpenBucket, key: string): Promise<AlbumMemory | null> {
  try {
    const object = await r2.client.send(new GetObjectCommand({ Bucket: r2.bucket, Key: key }));
    const text = await object.Body?.transformToString();
    if (!text) {
      return null;
    }
    return parseRecord(text, r2);
  } catch (error) {
    console.error("R2 record read failed", error instanceof Error ? error.name : "unknown");
    return null;
  }
}

async function parseRecord(text: string, r2: OpenBucket): Promise<AlbumMemory | null> {
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return null;
  }
  if (!body || typeof body !== "object") {
    return null;
  }
  const record = body as Record<string, unknown>;
  if (typeof record.id !== "string" || !isMemoryId(record.id)) {
    return null;
  }
  if (typeof record.kind !== "string" || !isMemoryKindId(record.kind)) {
    return null;
  }
  if (typeof record.createdAt !== "string" || Number.isNaN(Date.parse(record.createdAt))) {
    return null;
  }
  const files = Array.isArray(record.files) ? record.files : [];
  const parsedFiles: AlbumFile[] = [];
  for (const item of files) {
    const file = await parseFile(item, r2);
    if (file) {
      parsedFiles.push(file);
    }
  }
  const message = typeof record.message === "string" ? record.message.slice(0, 600) : "";
  const guestName = typeof record.guestName === "string" ? record.guestName.slice(0, 40) : "";
  if (parsedFiles.length === 0 && message.length === 0) {
    return null;
  }
  return {
    id: record.id,
    kind: record.kind,
    guestName,
    message,
    createdAt: record.createdAt,
    files: parsedFiles,
  };
}

async function parseFile(item: unknown, r2: OpenBucket): Promise<AlbumFile | null> {
  if (!item || typeof item !== "object") {
    return null;
  }
  const file = item as Record<string, unknown>;
  if (typeof file.objectKey !== "string" || !isOriginalObjectKey(file.objectKey)) {
    return null;
  }
  if (typeof file.fileName !== "string" || typeof file.mimeType !== "string") {
    return null;
  }
  if (typeof file.byteSize !== "number" || !Number.isInteger(file.byteSize) || file.byteSize <= 0) {
    return null;
  }
  return {
    objectKey: file.objectKey,
    fileName: file.fileName.slice(0, 180),
    mimeType: file.mimeType.slice(0, 120),
    byteSize: file.byteSize,
    viewUrl: await signView(r2, file.objectKey),
  };
}

async function signView(r2: OpenBucket, objectKey: string): Promise<string | null> {
  try {
    const command = new GetObjectCommand({ Bucket: r2.bucket, Key: objectKey });
    return await getSignedUrl(r2.client, command, { expiresIn: 15 * 60 });
  } catch (error) {
    console.error("R2 view link failed", error instanceof Error ? error.name : "unknown");
    return null;
  }
}

function attachmentName(fileName: string): string {
  const cleaned = fileName.replace(/[\r\n"]/g, "").trim().slice(0, 160) || "ani";
  const ascii = cleaned.replace(/[^\w.\- ]+/g, "_");
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(cleaned)}`;
}
