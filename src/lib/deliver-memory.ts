import type { DeliveryReceipt } from "@/lib/memory-draft";
import type { MemoryKindId } from "@/lib/memory-kinds";

const NOT_SENT = "Gönderilemedi. Dosya gitmedi.";

type Prepared = {
  localId: string;
  objectKey: string;
  url: string;
  contentType: string;
};

export async function deliverMemory(input: {
  kind: MemoryKindId;
  guestName: string;
  message: string;
  files: Array<{ localId: string; file: File }>;
  onProgress: (done: number) => void;
}): Promise<DeliveryReceipt> {
  const files = input.files.map((item) => ({
    localId: item.localId,
    fileName: item.file.name,
    mimeType: item.file.type,
    byteSize: item.file.size,
  }));

  const prepared = await postJson("/api/ani/hazirlik", {
    kind: input.kind,
    guestName: input.guestName,
    message: input.message,
    files,
  });
  const memoryId = prepared.memoryId;
  const uploads = prepared.uploads;
  if (typeof memoryId !== "string" || !Array.isArray(uploads)) {
    throw new Error(NOT_SENT);
  }
  if (uploads.length !== input.files.length) {
    throw new Error(NOT_SENT);
  }

  const slots = new Map<string, Prepared>();
  for (const upload of uploads) {
    if (!isPrepared(upload)) {
      throw new Error(NOT_SENT);
    }
    slots.set(upload.localId, upload);
  }

  let done = 0;
  const queue = [...input.files];
  const workers = Array.from({ length: Math.min(3, queue.length) }, async () => {
    while (queue.length > 0) {
      const next = queue.shift();
      if (!next) {
        return;
      }
      const slot = slots.get(next.localId);
      if (!slot) {
        throw new Error(NOT_SENT);
      }
      let response: Response;
      try {
        response = await fetch(slot.url, {
          method: "PUT",
          body: next.file,
          headers: { "Content-Type": slot.contentType },
        });
      } catch {
        throw new Error("Bağlantı koptu. Dosya gitmediyse tekrar dene.");
      }
      if (!response.ok) {
        throw new Error(NOT_SENT);
      }
      done += 1;
      input.onProgress(done);
    }
  });
  await Promise.all(workers);

  const finished = await postJson("/api/ani/tamamla", {
    memoryId,
    kind: input.kind,
    guestName: input.guestName,
    message: input.message,
    files,
  });
  if (!finished.receipt || typeof finished.receipt !== "object") {
    throw new Error(NOT_SENT);
  }
  return finished.receipt as DeliveryReceipt;
}

async function postJson(path: string, body: unknown): Promise<Record<string, unknown>> {
  let response: Response;
  try {
    response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Bağlantı koptu. Dosya gitmediyse tekrar dene.");
  }
  const payload = (await response.json().catch(() => null)) as Record<string, unknown> | null;
  if (!response.ok) {
    const error = payload && typeof payload.error === "string" ? payload.error : NOT_SENT;
    throw new Error(error);
  }
  return payload ?? {};
}

function isPrepared(value: unknown): value is Prepared {
  if (!value || typeof value !== "object") {
    return false;
  }
  const upload = value as Record<string, unknown>;
  return (
    typeof upload.localId === "string" &&
    typeof upload.objectKey === "string" &&
    typeof upload.url === "string" &&
    typeof upload.contentType === "string"
  );
}
