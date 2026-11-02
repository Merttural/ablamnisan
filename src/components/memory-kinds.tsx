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
                  href="/ani-birak"
                  className="group flex h-full flex-col border border-charcoal/20 bg-champagne/45 p-6 transition-colors duration-300 hover:border-charcoal hover:bg-champagne focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-charcoal md:p-8"
                >
                  <Icon className="size-5 text-gold" strokeWidth={1.25} aria-hidden />
                  <h3 className="mt-5 font-serif text-4xl font-medium tracking-tight text-charcoal">
                    {kind.title}
                  </h3>
                  <p className="mt-3 text-lg leading-7 text-charcoal/80">{kind.summary}</p>
                  <span className="mt-8 inline-flex min-h-12 items-center gap-2 text-base text-charcoal">
                    {kind.action}
                    <ArrowUpRight
                      className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      strokeWidth={1.25}
                      aria-hidden
                    />
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
