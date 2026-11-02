import { TextLink } from "@/components/text-link";

export function MemoryCta() {
  return (
    <section id="gun" className="scroll-mt-20 bg-champagne">
      <div className="mx-auto flex max-w-3xl flex-col items-center px-6 py-24 text-center md:py-36">
        <p className="text-[0.68rem] uppercase tracking-[0.38em] text-taupe">
          Davet
        </p>
        <h2 className="mt-5 text-balance font-serif text-4xl leading-[1.05] font-medium tracking-[-0.02em] text-charcoal sm:text-5xl md:text-6xl">
          Bu özel günün bir parçası ol.
        </h2>
        <p className="mt-6 max-w-md text-pretty text-base leading-8 text-taupe md:text-lg">
          Gördüğünüz bir anı, duyduğunuz bir cümleyi ya da yalnızca o akşamın
          ışığını bırakın.
        </p>
        <div className="mt-10">
          <TextLink href="/ani-birak" variant="solid">
            Anını Bırak
          </TextLink>
        </div>
      </div>
    </section>
  );
}
