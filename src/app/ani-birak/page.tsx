import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { MemoryComposer } from "@/components/memory-composer";

export const metadata: Metadata = {
  title: "Bir Anı Bırak",
  description: "Fotoğrafın, videon veya birkaç güzel kelimen bizim için çok değerli.",
  alternates: {
    canonical: "/ani-birak",
  },
  openGraph: {
    title: "Bir Anı Bırak — Alkan & Gamze",
    description: "Fotoğrafın, videon veya birkaç güzel kelimen bizim için çok değerli.",
    url: "/ani-birak",
  },
};

export default function AniBirakPage() {
  return (
    <>
      <header className="border-b border-charcoal/10">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-center px-5">
          <Link href="/" className="font-serif text-lg text-charcoal">
            Alkan <span className="italic text-taupe">&</span> Gamze
          </Link>
        </div>
      </header>
      <main id="icerik" className="flex-1">
        <MemoryComposer />
      </main>
      <SiteFooter />
    </>
  );
}
