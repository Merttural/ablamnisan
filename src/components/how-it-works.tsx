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
        <ol className="mt-14 grid gap-8 sm:grid-cols-2 md:mt-20 lg:grid-cols-4 lg:gap-10">
          {howItWorksSteps.map((step, index) => (
            <li key={step} className="border-t border-charcoal/10 pt-6">
              <span className="font-serif text-3xl text-charcoal">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="mt-4 text-pretty font-serif text-2xl leading-snug text-charcoal">
                {step}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
