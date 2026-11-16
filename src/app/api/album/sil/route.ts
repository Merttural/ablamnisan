import { cookies } from "next/headers";
import { connection } from "next/server";
import { removeAlbumStorage } from "@/lib/album-library";
import { albumCookieName, verifyAlbumToken } from "@/lib/album-session";

export async function POST(request: Request) {
  await connection();
  const jar = await cookies();
  if (!(await verifyAlbumToken(jar.get(albumCookieName)?.value))) {
    return Response.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const form = await request.formData().catch(() => null);
  if (!form) {
    return Response.json({ error: "Bu dosya yok." }, { status: 400 });
  }

  const result = await removeAlbumStorage({
    memoryId: String(form.get("id") ?? ""),
    objectKey: String(form.get("anahtar") ?? ""),
    all: form.get("hepsi") === "1",
  });
  if (result === "removed") {
    return Response.json({ ok: true });
  }
  if (result === "missing") {
    return Response.json({ error: "Bu dosya yok." }, { status: 404 });
  }
  return Response.json({ error: "Silinemedi. Dosya duruyor." }, { status: 502 });
}
