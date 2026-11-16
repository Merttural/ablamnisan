import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { AlbumBoard } from "@/components/album-board";
import { SiteFooter } from "@/components/site-footer";
import { albumCookieName, verifyAlbumToken } from "@/lib/album-session";
import { listAlbumMemories } from "@/lib/album-library";

export const metadata: Metadata = {
  title: "Albüm",
  robots: { index: false, follow: false },
};

export default function AlbumPage() {
  return (
    <>
      <header className="border-b border-charcoal/10">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8">
          <Link href="/" className="font-serif text-lg text-charcoal">
            Alkan <span className="italic text-taupe">&</span> Gamze
          </Link>
          <form action="/api/cikis" method="post">
            <button type="submit" className="min-h-11 px-2 text-base text-charcoal">
              Çıkış
            </button>
          </form>
        </div>
      </header>
      <main id="icerik" className="mx-auto w-full max-w-6xl flex-1 px-5 py-12 md:px-8 md:py-16">
        <p className="text-[0.68rem] uppercase tracking-[0.38em] text-taupe">Özel albüm</p>
        <h1 className="mt-5 font-serif text-5xl leading-none font-medium tracking-[-0.03em] text-charcoal">
          Anılar
        </h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-taupe">
          İndirme, misafirin yüklediği dosyayı getirir. Silmek, dosyayı depodan da kaldırır.
        </p>
        <Suspense fallback={<p className="mt-10 text-base text-taupe">Albüm açılıyor.</p>}>
          <PrivateAlbum />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}

async function PrivateAlbum() {
  await connection();
  const jar = await cookies();
  if (!(await verifyAlbumToken(jar.get(albumCookieName)?.value))) {
    redirect("/giris");
  }
  const memories = await listAlbumMemories();
  if (memories === null) {
    return <p className="mt-10 text-base leading-7 text-charcoal">Albüm henüz bağlanmadı.</p>;
  }
  return <AlbumBoard memories={memories} />;
}
