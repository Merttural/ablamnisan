import { albumPhotos } from "@/lib/images";
import { AlbumImage } from "@/components/album-image";
import { TextLink } from "@/components/text-link";

export function Hero() {
  return (
    <section className="relative flex min-h-[calc(100svh-4rem)] items-center md:min-h-[calc(100svh-4.5rem)]">
      <div className="absolute inset-0">
        <AlbumImage
          photo={albumPhotos.hero}
          sizes="100vw"
          priority
          className="object-cover object-[center_40%]"
        />
        <div className="absolute inset-0 bg-ivory/40" aria-hidden />
        <div
          className="absolute inset-0 bg-gradient-to-b from-ivory/15 via-transparent to-ivory/75"
          aria-hidden
        />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-6 py-24 text-center">
        <p className="rise text-[0.68rem] uppercase tracking-[0.42em] text-taupe">
          Nişan
        </p>
        <h1
          className="rise mt-6 font-serif text-[3.35rem] leading-[0.9] font-medium tracking-[-0.03em] text-charcoal sm:text-7xl md:text-8xl lg:text-[6.5rem]"
          style={{ animationDelay: "120ms" }}
        >
          Alkan <span className="font-normal text-taupe italic">&</span> Gamze
        </h1>
        <p
          className="rise mt-7 text-[0.72rem] uppercase tracking-[0.32em] text-charcoal/80"
          style={{ animationDelay: "240ms" }}
        >
          29 Kasım 2026
        </p>
        <span
          className="rise mt-8 block h-px w-12 bg-gold"
          style={{ animationDelay: "320ms" }}
          aria-hidden
        />
        <p
          className="rise mt-8 max-w-md text-pretty text-base leading-7 text-taupe md:text-lg md:leading-8"
          style={{ animationDelay: "400ms" }}
        >
          En güzel anılar, sevdiklerimizle paylaştıklarımızdır.
        </p>
        <div className="rise mt-10" style={{ animationDelay: "520ms" }}>
          <TextLink href="/ani-birak" variant="solid">
            Bir Anı Bırak
          </TextLink>
        </div>
      </div>
    </section>
  );
}
