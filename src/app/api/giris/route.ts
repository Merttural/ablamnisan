import { connection } from "next/server";
import {
  albumCookieName,
  albumCookieOptions,
  albumDoorReady,
  createAlbumToken,
  passwordMatches,
  redirectPath,
} from "@/lib/album-session";

export async function POST(request: Request) {
  await connection();
  const form = await request.formData().catch(() => null);
  const password = form ? String(form.get("sifre") ?? "") : "";
  if (!albumDoorReady()) {
    return redirectPath("/giris?hata=kapali");
  }
  if (!(await passwordMatches(password))) {
    return redirectPath("/giris?hata=1");
  }

  const response = redirectPath("/album");
  response.cookies.set(albumCookieName, await createAlbumToken(), albumCookieOptions());
  return response;
}
