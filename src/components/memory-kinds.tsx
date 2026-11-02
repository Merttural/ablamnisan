import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { memoryKinds } from "@/lib/memory-kinds";

export function MemoryKinds() {
  return (
    <section className="px-5 pb-24 md:px-8 md:pb-32">
      <div className="mx-auto max-w-6xl">
        <p className="text-[0.68rem] uppercase tracking-[0.38em] text-taupe">Anı türleri</p>
        <h2 className="mt-5 max-w-xl text-balance font-serif text-4xl leading-[1.05] font-medium tracking-[-0.02em] text-charcoal sm:text-5xl">
          Dilediğin biçimde bırak.
        </h2>
        <ul className="mt-10 grid gap-4 md:mt-16 md:grid-cols-2 md:gap-5">
          {memoryKinds.map((kind) => {
            const Icon = kind.icon;
            return (
              <li key={kind.id}>
                <Link
                  href={`/ani-birak?tur=${kind.id}`}
                  className="group flex h-full flex-col border-2 border-charcoal/30 bg-champagne/55 p-6 transition-colors duration-300 hover:border-charcoal hover:bg-champagne focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-charcoal md:p-8"
                >
                  <span className="grid size-12 place-items-center border border-charcoal/20 bg-ivory text-charcoal">
                    <Icon className="size-6" strokeWidth={1.5} aria-hidden />
                  </span>
                  <h3 className="mt-6 font-serif text-4xl font-medium tracking-tight text-charcoal">
                    {kind.title}
                  </h3>
                  <p className="mt-3 text-lg leading-7 text-charcoal/80">{kind.summary}</p>
                  <span className="mt-8 inline-flex min-h-12 items-center justify-between gap-3 bg-charcoal px-4 py-3 text-base text-ivory">
                    {kind.action}
                    <ArrowUpRight className="size-5 shrink-0" strokeWidth={1.5} aria-hidden />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
