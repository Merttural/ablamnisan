export function SiteFooter() {
  return (
    <footer className="border-t border-charcoal/10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-10 text-center sm:flex-row sm:text-left md:px-8">
        <p className="font-serif text-xl tracking-wide text-charcoal">
          Alkan <span className="italic text-taupe">&</span> Gamze
        </p>
        <p className="text-[0.68rem] uppercase tracking-[0.32em] text-taupe">
          29.11.2026
        </p>
      </div>
    </footer>
  );
}
