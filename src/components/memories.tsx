import { albumPhotos } from "@/lib/images";
import { AlbumImage } from "@/components/album-image";

export function Memories() {
  return (
    <section id="anilar" className="scroll-mt-20 px-5 py-24 md:px-8 md:py-36">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-[0.68rem] uppercase tracking-[0.38em] text-taupe">
            Albüm
          </p>
          <h2 className="mt-5 text-balance font-serif text-4xl leading-[1.05] font-medium tracking-[-0.02em] text-charcoal sm:text-5xl md:text-[4.25rem]">
            En güzel anılar birlikte biriktirilir.
          </h2>
          <p className="mt-6 max-w-xl text-pretty text-base leading-8 text-taupe md:text-lg">
            29 Kasım 2026’da aynı masada buluşan herkesin gözünden bir nişan.
            Bir fotoğraf ya da kısa bir not; yıllar sonra da aynı sıcaklıkla
            açılacak.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-3 md:mt-24 md:grid-cols-12 md:items-start md:gap-6">
          <figure className="group relative aspect-[4/5] overflow-hidden bg-champagne md:col-span-7">
            <AlbumImage
              photo={albumPhotos.florals}
              sizes="(max-width: 768px) 100vw, 58vw"
              className="object-cover motion-safe:transition motion-safe:duration-700 motion-safe:ease-out motion-safe:group-hover:scale-[1.03]"
            />
          </figure>

          <div className="grid grid-cols-2 gap-3 md:col-span-5 md:grid-cols-1 md:gap-6 md:pt-16">
            <figure className="group relative aspect-[3/4] overflow-hidden bg-champagne md:ml-8 md:aspect-[4/5]">
              <AlbumImage
                photo={albumPhotos.hands}
                sizes="(max-width: 768px) 50vw, 34vw"
                className="object-cover motion-safe:transition motion-safe:duration-700 motion-safe:ease-out motion-safe:group-hover:scale-[1.03]"
              />
            </figure>
            <figure className="group relative aspect-[3/4] overflow-hidden bg-champagne md:aspect-[4/3]">
              <AlbumImage
                photo={albumPhotos.place}
                sizes="(max-width: 768px) 50vw, 36vw"
                className="object-cover motion-safe:transition motion-safe:duration-700 motion-safe:ease-out motion-safe:group-hover:scale-[1.03]"
              />
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
