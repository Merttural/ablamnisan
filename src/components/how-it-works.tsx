import { howItWorksSteps } from "@/lib/memory-kinds";

export function HowItWorks() {
  return (
    <section
      id="nasil-calisir"
      className="scroll-mt-20 border-t border-charcoal/10 px-5 py-24 md:px-8 md:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <p className="text-[0.68rem] uppercase tracking-[0.38em] text-taupe">Süreç</p>
        <h2 className="mt-5 max-w-xl text-balance font-serif text-4xl leading-[1.05] font-medium tracking-[-0.02em] text-charcoal sm:text-5xl">
          Nasıl çalışır?
        </h2>
        <ol className="mt-10 grid gap-3 md:mt-16 md:grid-cols-2 md:gap-4 lg:grid-cols-4">
          {howItWorksSteps.map((step, index) => (
            <li
              key={step}
              className="flex items-center gap-4 border-2 border-charcoal/25 bg-champagne/45 p-4 md:flex-col md:items-start md:p-6"
            >
              <span className="grid size-12 shrink-0 place-items-center bg-charcoal font-serif text-2xl text-ivory">
                {index + 1}
              </span>
              <p className="text-pretty font-serif text-2xl leading-snug text-charcoal">{step}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
