import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { Memories } from "@/components/memories";
import { MemoryCta } from "@/components/memory-cta";
import { SiteFooter } from "@/components/site-footer";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="icerik" className="flex-1">
        <Hero />
        <Memories />
        <MemoryCta />
      </main>
      <SiteFooter />
    </>
  );
}
