import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MemoryComposer } from "@/components/memory-composer";

export const metadata: Metadata = {
  title: "Bir Anı Bırak",
  description:
    "Fotoğrafın, videon veya birkaç güzel kelimen Alkan ve Gamze için çok değerli.",
};

export default function AniBirakPage() {
  return (
    <>
      <SiteHeader />
      <main id="icerik" className="flex-1">
        <MemoryComposer />
      </main>
      <SiteFooter />
    </>
  );
}
