import { NextResponse } from "next/server";

export const albumCookieName = "album_oturum";
const sessionSeconds = 60 * 60 * 24 * 14;

export function albumDoorReady(): boolean {
  const password = process.env.ALBUM_PASSWORD ?? "";
  const secret = process.env.ALBUM_SESSION_SECRET?.trim() ?? "";
  return password.length >= 8 && secret.length >= 16;
}

export function redirectPath(path: string, status = 303) {
  const response = new NextResponse(null, { status });
  response.headers.set("Location", path);
  return response;
}

export function albumCookieOptions(maxAge = sessionSeconds) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export async function passwordMatches(password: string): Promise<boolean> {
  if (!albumDoorReady() || password.length === 0 || password.length > 200) {
    return false;
  }
  const expected = process.env.ALBUM_PASSWORD ?? "";
  const [actualHash, expectedHash] = await Promise.all([digest(password), digest(expected)]);
  return safeEqual(actualHash, expectedHash);
}

export async function createAlbumToken(): Promise<string> {
  const expiresAt = Date.now() + sessionSeconds * 1000;
  const payload = String(expiresAt);
  const signature = await sign(payload);
  return `${payload}.${signature}`;
}

export function hasAlbumCookie(token: string | undefined): boolean {
  if (!token) {
    return false;
  }
  const dot = token.indexOf(".");
  if (dot <= 0) {
    return false;
  }
  return /^\d+$/.test(token.slice(0, dot)) && /^[0-9a-f]{64}$/.test(token.slice(dot + 1));
}

export async function verifyAlbumToken(token: string | undefined): Promise<boolean> {
  if (!albumDoorReady() || !token) {
    return false;
  }
  const dot = token.indexOf(".");
  if (dot <= 0) {
    return false;
  }
  const payload = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) {
    return false;
  }
  if (expiresAt > Date.now() + sessionSeconds * 1000 + 60_000) {
    return false;
  }
  const expected = await sign(payload);
  return safeEqual(signature, expected);
}

async function sign(value: string): Promise<string> {
  const secret = process.env.ALBUM_SESSION_SECRET?.trim() ?? "";
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return hex(signature);
}

async function digest(value: string): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return hex(hash);
}

function hex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function safeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) {
    return false;
  }
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return mismatch === 0;
}
