import { connection } from "next/server";
import { isMemoryId, parseSubmission, planUploads } from "@/lib/memory-record";
import { r2Ready, signOriginalUpload } from "@/lib/r2";

export async function POST(request: Request) {
  await connection();
  if (!r2Ready()) {
    return Response.json(
      { error: "Anı albümü henüz bağlanmadı. Dosya gitmedi." },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = parseSubmission(body);
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  const memoryId = crypto.randomUUID();
  if (!isMemoryId(memoryId)) {
    return Response.json({ error: "Gönderilemedi. Dosya gitmedi." }, { status: 500 });
  }

  const planned = planUploads(memoryId, parsed.value);
  const uploads = [];
  for (const item of planned) {
    const url = await signOriginalUpload({
      objectKey: item.objectKey,
      contentType: item.contentType,
    });
    if (!url) {
      return Response.json({ error: "Gönderilemedi. Dosya gitmedi." }, { status: 503 });
    }
    uploads.push({
      localId: item.localId,
      objectKey: item.objectKey,
      url,
      contentType: item.contentType,
    });
  }

  return Response.json({ memoryId, uploads });
}
