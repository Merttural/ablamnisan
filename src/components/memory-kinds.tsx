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
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 md:mt-16">
          {memoryKinds.map((kind) => {
            const Icon = kind.icon;
            return (
              <li key={kind.id}>
                <Link
                  href={`/ani-birak?tur=${kind.id}`}
                  className="group flex h-full flex-col border border-charcoal/10 p-7 transition-colors duration-500 hover:bg-champagne/60 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-charcoal md:p-9"
                >
                  <Icon className="size-5 text-charcoal" strokeWidth={1.25} aria-hidden />
                  <h3 className="mt-8 font-serif text-3xl font-medium tracking-tight text-charcoal">
                    {kind.title}
                  </h3>
                  <p className="mt-3 max-w-xs text-pretty leading-7 text-taupe">{kind.summary}</p>
                  <span className="mt-8 inline-flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.24em] text-charcoal">
                    {kind.action}
                    <ArrowUpRight
                      className="size-3.5 transition-transform duration-500 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5"
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
