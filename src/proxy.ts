import { NextResponse, type NextRequest } from "next/server";
import { albumCookieName, hasAlbumCookie, redirectPath } from "@/lib/album-session";

export function proxy(request: NextRequest) {
  const token = request.cookies.get(albumCookieName)?.value;
  if (hasAlbumCookie(token)) {
    return NextResponse.next();
  }
  return redirectPath("/giris", 307);
}

export const config = {
  matcher: ["/album", "/album/:path*", "/api/album/:path*"],
};
