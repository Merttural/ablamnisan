import { connection } from "next/server";
import { albumCookieName, albumCookieOptions, redirectPath } from "@/lib/album-session";

export async function POST() {
  await connection();
  const response = redirectPath("/giris");
  response.cookies.set(albumCookieName, "", albumCookieOptions(0));
  return response;
}
