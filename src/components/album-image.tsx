import Image from "next/image";
import type { AlbumPhoto } from "@/lib/images";

type AlbumImageProps = {
  photo: AlbumPhoto;
  sizes: string;
  priority?: boolean;
  className?: string;
};

export function AlbumImage({
  photo,
  sizes,
  priority = false,
  className,
}: AlbumImageProps) {
  return (
    <Image
      src={photo.src}
      alt={photo.alt}
      fill
      sizes={sizes}
      priority={priority}
      quality={priority ? 85 : 80}
      className={className}
    />
  );
}
