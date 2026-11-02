import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

type TextLinkProps = {
  href: string;
  children: string;
  variant?: "outline" | "solid";
};

const variants = {
  outline:
    "border border-charcoal/80 text-charcoal hover:bg-charcoal hover:text-ivory",
  solid: "bg-charcoal text-ivory hover:bg-taupe",
} as const;

export function TextLink({ href, children, variant = "outline" }: TextLinkProps) {
  return (
    <Link
      href={href}
      className={`group inline-flex min-h-14 items-center justify-center gap-3 px-8 py-4 text-[0.78rem] font-medium uppercase tracking-[0.28em] transition-colors duration-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-charcoal ${variants[variant]}`}
    >
      {children}
      <span className="transition-transform duration-500 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5">
        <ArrowUpRight className="size-4" strokeWidth={1.25} aria-hidden />
      </span>
    </Link>
  );
}
