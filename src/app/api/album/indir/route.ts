import { cookies } from "next/headers";
import { NextResponse, connection } from "next/server";
import { isOriginalObjectKey, signOriginalDownload } from "@/lib/album-library";
import { albumCookieName, redirectPath, verifyAlbumToken } from "@/lib/album-session";

export async function GET(request: Request) {
  await connection();
  const jar = await cookies();
  if (!(await verifyAlbumToken(jar.get(albumCookieName)?.value))) {
    return redirectPath("/giris");
  }

  const url = new URL(request.url);
  const objectKey = url.searchParams.get("anahtar") ?? "";
  const fileName = (url.searchParams.get("ad") ?? "ani").slice(0, 180);
  if (!isOriginalObjectKey(objectKey)) {
    return new Response("Bu dosya yok.", { status: 404 });
  }

  const signed = await signOriginalDownload(objectKey, fileName);
  if (!signed) {
    return new Response("Dosya şu an indirilemiyor.", { status: 503 });
  }
  return NextResponse.redirect(signed, 302);
}
