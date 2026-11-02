import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { TextLink } from "@/components/text-link";

export const metadata: Metadata = {
  title: "Sayfa bulunamadı",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="icerik" className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <p className="text-[0.68rem] uppercase tracking-[0.38em] text-taupe">404</p>
        <h1 className="mt-5 font-serif text-5xl leading-none font-medium tracking-[-0.03em] text-charcoal">
          Bu sayfa yok.
        </h1>
        <p className="mt-6 max-w-md text-pretty text-base leading-7 text-taupe">
          Aradığın adres albümde yer almıyor. Anı bırakmak için doğru sayfa hazır.
        </p>
        <div className="mt-10">
          <TextLink href="/ani-birak" variant="solid">
            Bir Anı Bırak
          </TextLink>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
