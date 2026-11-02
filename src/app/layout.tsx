import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

const title = "Alkan & Gamze — 29 Kasım 2026";
const description =
  "Alkan ve Gamze’nin nişanına özel dijital anı albümü. 29 Kasım 2026 gününün karelerini birlikte biriktiriyoruz.";

export const metadata: Metadata = {
  title: {
    default: title,
    template: "%s — Alkan & Gamze",
  },
  description,
  applicationName: "Alkan & Gamze",
  authors: [{ name: "Alkan & Gamze" }],
  openGraph: {
    title,
    description,
    locale: "tr_TR",
    type: "website",
    siteName: "Alkan & Gamze",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      className={`${cormorant.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-ivory font-sans text-charcoal">
        {children}
      </body>
    </html>
  );
}
