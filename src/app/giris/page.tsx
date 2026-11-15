import { Suspense } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { albumCookieName, albumDoorReady, verifyAlbumToken } from "@/lib/album-session";

export const metadata: Metadata = {
  title: "Albüm girişi",
  robots: { index: false, follow: false },
};

const fieldClass =
  "mt-3 w-full border-b border-charcoal/20 bg-transparent py-3 text-base text-charcoal outline-none placeholder:text-taupe/50 focus:border-charcoal";

const primaryButton =
  "flex min-h-14 w-full items-center justify-center bg-charcoal px-6 py-4 text-center font-serif text-2xl text-ivory transition-colors duration-300 hover:bg-taupe focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-charcoal";

export default function GirisPage({
  searchParams,
}: {
  searchParams: Promise<{ hata?: string }>;
}) {
  return (
    <>
      <SiteHeader />
      <main id="icerik" className="flex-1">
        <section className="mx-auto w-full max-w-xl px-5 py-16 md:px-8 md:py-24">
          <p className="text-[0.68rem] uppercase tracking-[0.38em] text-taupe">Özel albüm</p>
          <h1 className="mt-5 font-serif text-5xl leading-none font-medium tracking-[-0.03em] text-charcoal">
            Yalnız size açık.
          </h1>
          <p className="mt-6 text-base leading-7 text-taupe">
            Fotoğraflar ve videolar bu kapının ardında. Misafirler içeri giremez.
          </p>
          <Suspense fallback={<p className="mt-10 text-base text-taupe">Kapı açılıyor.</p>}>
            <LoginForm searchParams={searchParams} />
          </Suspense>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

async function LoginForm({ searchParams }: { searchParams: Promise<{ hata?: string }> }) {
  await connection();
  const jar = await cookies();
  if (await verifyAlbumToken(jar.get(albumCookieName)?.value)) {
    redirect("/album");
  }
  const { hata } = await searchParams;
  const closed = !albumDoorReady();

  return (
    <form action="/api/giris" method="post" className="mt-10">
      <label className="block">
        <span className="text-base text-charcoal">Şifre</span>
        <input
          name="sifre"
          type="password"
          autoComplete="current-password"
          required
          className={fieldClass}
        />
      </label>
      {hata === "kapali" || closed ? (
        <p className="mt-6 text-base leading-7 text-charcoal">Bu kapı henüz hazır değil.</p>
      ) : null}
      {hata === "1" ? (
        <p className="mt-6 text-base leading-7 text-charcoal">Şifre uygun değil.</p>
      ) : null}
      <button type="submit" className={`${primaryButton} mt-8 disabled:cursor-not-allowed disabled:bg-taupe/40`} disabled={closed}>
        Giriş
      </button>
    </form>
  );
}
