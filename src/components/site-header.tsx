"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const NAV = [
  { href: "/#anilar", label: "Anılar" },
  { href: "/#nasil-calisir", label: "Nasıl" },
  { href: "/#gun", label: "Davet" },
  { href: "/ani-birak", label: "Anı Bırak" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const pathname = usePathname();

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-charcoal/10 bg-ivory/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:h-[4.5rem] md:px-8">
          <Link
            href="/"
            className="flex items-center gap-3 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-charcoal"
            onClick={() => setOpen(false)}
          >
            <span className="grid size-9 place-items-center border border-charcoal/15 font-serif text-[0.95rem] tracking-[0.08em] text-charcoal">
              AG
            </span>
            <span className="whitespace-nowrap font-serif text-[1.05rem] leading-none tracking-[0.03em] text-charcoal sm:text-lg">
              Alkan <span className="italic text-taupe">&</span> Gamze
            </span>
          </Link>

          <nav className="hidden items-center gap-9 md:flex" aria-label="Sayfa">
            {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              className={`relative text-[0.68rem] uppercase tracking-[0.28em] transition-colors duration-300 after:absolute after:inset-x-0 after:-bottom-1.5 after:h-px after:origin-left after:bg-gold after:transition-transform after:duration-500 hover:text-charcoal hover:after:scale-x-100 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-charcoal motion-reduce:after:transition-none ${pathname === item.href ? "text-charcoal after:scale-x-100" : "text-taupe after:scale-x-0"}`}
            >
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            className="grid size-11 place-items-center text-charcoal focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-charcoal md:hidden"
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? (
              <X className="size-5" strokeWidth={1.25} aria-hidden />
            ) : (
              <Menu className="size-5" strokeWidth={1.25} aria-hidden />
            )}
          </button>
        </div>
      </header>

      {open ? (
        <nav
          id={menuId}
          aria-label="Mobil"
          className="fixed inset-x-0 bottom-0 top-16 z-30 overflow-y-auto bg-ivory md:hidden"
        >
          <ul className="flex min-h-full flex-col justify-center px-8 pb-16">
            {NAV.map((item) => (
              <li key={item.href} className="border-b border-charcoal/10">
                <Link
                  href={item.href}
                  className="block py-5 font-serif text-4xl tracking-tight text-charcoal"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </>
  );
}
