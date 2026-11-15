import { connection } from "next/server";
import { r2Ready } from "@/lib/r2";

export async function GET() {
  await connection();
  return Response.json({ ready: r2Ready() });
}
