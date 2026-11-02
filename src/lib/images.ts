export type AlbumPhoto = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

/**
 * Editorial stand-ins for the engagement album.
 * Replace the files in `public/images` with the couple's photographs;
 * keep the same filenames or update the paths here.
 */
export const albumPhotos = {
  hero: {
    src: "/images/hero.jpg",
    alt: "Gün ışığında, fildişi örtülü uzun bir masa; şampanya tonlarında güller ve zeytin dalları.",
    width: 1280,
    height: 720,
  },
  florals: {
    src: "/images/florals.jpg",
    alt: "Taş bir sehpa üzerinde, cam vazoda şampanya ve krem güller.",
    width: 864,
    height: 1152,
  },
  hands: {
    src: "/images/hands.jpg",
    alt: "Keten kumaşın üzerinde, ince bir yüzük ve şampanya güllerinin yanında duran bir el.",
    width: 864,
    height: 1152,
  },
  place: {
    src: "/images/place.jpg",
    alt: "Ahşap masada keten peçete, tek bir gül ve ince bir kadeh.",
    width: 1152,
    height: 864,
  },
} as const satisfies Record<string, AlbumPhoto>;
