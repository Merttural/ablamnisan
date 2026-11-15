import { connection } from "next/server";
import type { DeliveryReceipt } from "@/lib/memory-draft";
import { isMemoryId, parseSubmission, planUploads, recordKey } from "@/lib/memory-record";
import { originalByteSize, r2Ready, writeMemoryRecord } from "@/lib/r2";

export async function POST(request: Request) {
  await connection();
  if (!r2Ready()) {
    return Response.json(
      { error: "Anı albümü henüz bağlanmadı. Dosya gitmedi." },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || typeof (body as { memoryId?: unknown }).memoryId !== "string") {
    return Response.json({ error: "Gönderim okunamadı." }, { status: 400 });
  }
  const memoryId = (body as { memoryId: string }).memoryId;
  if (!isMemoryId(memoryId)) {
    return Response.json({ error: "Gönderim okunamadı." }, { status: 400 });
  }

  const parsed = parseSubmission(body);
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  const planned = planUploads(memoryId, parsed.value);
  for (const item of planned) {
    const storedSize = await originalByteSize(item.objectKey);
    if (storedSize !== item.byteSize) {
      return Response.json(
        { error: "Dosya tam olarak ulaşmadı. Tekrar dene." },
        { status: 409 },
      );
    }
  }

  const createdAt = new Date().toISOString();
  const saved = await writeMemoryRecord(recordKey(memoryId), {
    id: memoryId,
    kind: parsed.value.kind,
    guestName: parsed.value.guestName,
    message: parsed.value.message,
    createdAt,
    files: planned.map((item) => ({
      objectKey: item.objectKey,
      fileName: item.fileName,
      mimeType: item.mimeType,
      byteSize: item.byteSize,
    })),
  });
  if (!saved) {
    return Response.json({ error: "Gönderilemedi. Dosya gitmedi." }, { status: 502 });
  }

  const receipt: DeliveryReceipt = {
    id: memoryId,
    stored: planned.map((item) => ({
      localId: item.localId,
      fileName: item.fileName,
      mimeType: item.mimeType,
      byteSize: item.byteSize,
      provider: "cloudflare-r2",
      objectKey: item.objectKey,
      downloadPath: item.objectKey,
    })),
  };
  return Response.json({ receipt });
}
